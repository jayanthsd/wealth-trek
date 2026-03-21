import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { spawn } from "child_process";
import { getOpenAIClient } from "@/lib/openai";
import { EXTRACTION_SYSTEM_PROMPT } from "@/lib/extractionPrompt";
import { ExtractedEntry } from "@/types";

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg"];

function extractPdfText(pdfPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), "scripts", "extract_pdf_text.py");
    const proc = spawn("python", ["-u", scriptPath, pdfPath], {
      env: { ...process.env },
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data: Buffer) => {
      stdout += data.toString();
    });

    proc.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on("close", (code: number | null) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`pdfplumber extraction failed: ${stderr}`));
      }
    });

    proc.on("error", (err: Error) => {
      reject(new Error(`Failed to spawn Python process: ${err.message}. Ensure Python 3.x is installed.`));
    });
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storedPath, fileType } = body;

    if (!storedPath || !fileType) {
      return NextResponse.json(
        { error: "storedPath and fileType are required" },
        { status: 400 }
      );
    }

    let openai;
    try {
      openai = getOpenAIClient();
    } catch {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured. Please set it in .env.local." },
        { status: 500 }
      );
    }

    const filePath = path.join(process.cwd(), "uploads", storedPath);
    let entries: ExtractedEntry[];

    if (fileType === "application/pdf") {
      // PDF: extract text with pdfplumber, then use GPT-4o-mini
      const text = await extractPdfText(filePath);

      if (!text.trim()) {
        return NextResponse.json(
          { error: "Could not extract any text from the PDF. The file may be image-based or empty." },
          { status: 422 }
        );
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
          {
            role: "user",
            content: `Extract all financial entries from the following document text:\n\n${text}`,
          },
        ],
        temperature: 0.1,
      });

      const content = response.choices[0]?.message?.content?.trim() ?? "[]";
      entries = parseExtractionResponse(content);
    } else if (IMAGE_TYPES.includes(fileType)) {
      // Image: use GPT-4o vision
      const fileBuffer = await readFile(filePath);
      const base64 = fileBuffer.toString("base64");
      const mimeType = fileType === "image/jpg" ? "image/jpeg" : fileType;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract all financial entries from this document image.",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64}`,
                },
              },
            ],
          },
        ],
        temperature: 0.1,
      });

      const content = response.choices[0]?.message?.content?.trim() ?? "[]";
      entries = parseExtractionResponse(content);
    } else {
      return NextResponse.json(
        { error: `Unsupported file type: ${fileType}` },
        { status: 400 }
      );
    }

    return NextResponse.json({ entries });
  } catch (error: unknown) {
    console.error("Extraction error:", error);

    if (error && typeof error === "object" && "status" in error) {
      const apiError = error as { status: number; message?: string };
      if (apiError.status === 429) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again later." },
          { status: 429 }
        );
      }
    }

    const message = error instanceof Error ? error.message : "Extraction failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function parseExtractionResponse(content: string): ExtractedEntry[] {
  // Strip markdown code fences if present
  let cleaned = content;
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  try {
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(
        (item: Record<string, unknown>) =>
          item.statementType &&
          item.category &&
          typeof item.closingBalance === "number"
      )
      .map((item: Record<string, unknown>) => ({
        statementType: String(item.statementType),
        description: String(item.description ?? ""),
        category: item.category === "liability" ? ("liability" as const) : ("asset" as const),
        closingBalance: Number(item.closingBalance),
      }));
  } catch {
    console.error("Failed to parse LLM response:", content);
    return [];
  }
}
