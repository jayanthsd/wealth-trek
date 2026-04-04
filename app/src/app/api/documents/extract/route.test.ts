// @vitest-environment node
import { getOpenAIClient } from "@/lib/openai";
import { jsonRequest } from "@/test-utils/apiTestHelpers";

vi.mock("@/lib/openai", () => ({
  getOpenAIClient: vi.fn(),
}));

describe("/api/documents/extract route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when required fields are missing", async () => {
    const { POST } = await import("./route");
    const req = jsonRequest("http://test/api/documents/extract", "POST", {});
    const res = await POST(req as never);
    expect(res.status).toBe(400);
  });

  it("returns 500 when OpenAI client is unavailable", async () => {
    vi.mocked(getOpenAIClient).mockImplementation(() => {
      throw new Error("missing key");
    });
    const { POST } = await import("./route");
    const req = jsonRequest("http://test/api/documents/extract", "POST", {
      storedPath: "x.pdf",
      fileType: "application/pdf",
    });
    const res = await POST(req as never);
    expect(res.status).toBe(500);
  });
});
