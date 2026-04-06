// @vitest-environment node
import { getOpenAIClient } from "@/lib/openai";
import { EXTRACTION_SYSTEM_PROMPT } from "@/lib/extractionPrompt";

vi.mock("@/lib/openai", () => ({
  getOpenAIClient: vi.fn(),
}));

const mockReadFile = vi.fn().mockResolvedValue(Buffer.from("mock image data"));
vi.mock("fs/promises", () => ({
  readFile: mockReadFile,
}));

vi.mock("path", async () => {
  const actual = await vi.importActual<typeof import("path")>("path");
  return {
    default: {
      ...actual.default,
      join: vi.fn((...args: string[]) => args.join("/")),
    },
    join: vi.fn((...args: string[]) => args.join("/")),
  };
});

describe("/api/documents/extract route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns 400 when storedPath is missing", async () => {
    const { POST } = await import("./route");
    const req = new Request("http://test/api/documents/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileType: "application/pdf" }),
    });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("storedPath");
  });

  it("returns 400 when fileType is missing", async () => {
    const { POST } = await import("./route");
    const req = new Request("http://test/api/documents/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storedPath: "test.pdf" }),
    });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("fileType");
  });

  it("returns 500 when OpenAI client is not configured", async () => {
    vi.mocked(getOpenAIClient).mockImplementation(() => {
      throw new Error("OPENAI_API_KEY is not configured");
    });
    const { POST } = await import("./route");
    const req = new Request("http://test/api/documents/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storedPath: "test.pdf", fileType: "application/pdf" }),
    });
    const res = await POST(req as never);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toContain("OPENAI_API_KEY");
  });

  it("returns 400 for unsupported file types", async () => {
    vi.mocked(getOpenAIClient).mockReturnValue({
      chat: { completions: { create: vi.fn() } },
    } as never);
    const { POST } = await import("./route");
    const req = new Request("http://test/api/documents/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storedPath: "test.docx", fileType: "application/vnd.word" }),
    });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Unsupported file type");
  });

  it("returns 429 when rate limited by OpenAI", async () => {
    const rateLimitError = { status: 429, message: "Rate limit exceeded" };
    vi.mocked(getOpenAIClient).mockReturnValue({
      chat: {
        completions: {
          create: vi.fn().mockRejectedValue(rateLimitError),
        },
      },
    } as never);
    
    // Mock the PDF extraction
    vi.mock("child_process", () => ({
      spawn: vi.fn(() => ({
        stdout: { on: vi.fn((_, cb) => cb("[]")) },
        stderr: { on: vi.fn() },
        on: vi.fn((event, cb) => { if (event === "close") cb(0); }),
      })),
    }));

    const { POST } = await import("./route");
    const req = new Request("http://test/api/documents/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storedPath: "test.pdf", fileType: "application/pdf" }),
    });
    const res = await POST(req as never);
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toContain("Rate limit");
  });
});

describe("parseExtractionResponse (via extract route)", () => {
  it("handles markdown code fences in LLM response", async () => {
    const mockJsonResponse = '```json\n[{"statementType": "Savings", "category": "asset", "closingBalance": 5000}]```';
    vi.mocked(getOpenAIClient).mockReturnValue({
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [{ message: { content: mockJsonResponse } }],
          }),
        },
      },
    } as never);

    vi.mock("child_process", () => ({
      spawn: vi.fn(() => ({
        stdout: { on: vi.fn((_, cb) => cb("some text")) },
        stderr: { on: vi.fn() },
        on: vi.fn((event, cb) => { if (event === "close") cb(0); }),
      })),
    }));

    const { POST } = await import("./route");
    const req = new Request("http://test/api/documents/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storedPath: "test.pdf", fileType: "application/pdf" }),
    });
    const res = await POST(req as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.entries).toHaveLength(1);
    expect(body.entries[0].statementType).toBe("Savings");
  });
});