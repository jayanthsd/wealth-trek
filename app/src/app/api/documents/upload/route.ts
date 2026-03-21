import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const ALLOWED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
];

const MAX_SIZE = 20 * 1024 * 1024; // 20MB

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files");

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    const uploadsDir = path.join(process.cwd(), "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const results = [];

    for (const file of files) {
      if (!(file instanceof File)) {
        continue;
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          {
            error: `File type "${file.type}" is not supported. Allowed types: PDF, PNG, JPG, JPEG.`,
          },
          { status: 400 }
        );
      }

      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          {
            error: `File "${file.name}" exceeds the 20MB size limit.`,
          },
          { status: 400 }
        );
      }

      const id = uuidv4();
      const timestamp = Date.now();
      const sanitizedName = sanitizeFilename(file.name);
      const storedFilename = `${timestamp}-${sanitizedName}`;
      const storedPath = path.join(uploadsDir, storedFilename);

      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(storedPath, buffer);

      results.push({
        id,
        originalName: file.name,
        storedPath: storedFilename,
        fileType: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ documents: results });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file(s)" },
      { status: 500 }
    );
  }
}
