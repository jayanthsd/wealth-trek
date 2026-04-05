// @vitest-environment node
import { getOpenAIClient } from "@/lib/openai";
import { jsonRequest } from "@/test-utils/apiTestHelpers";

vi.mock("@/lib/openai", () => ({
  getOpenAIClient: vi.fn(),
}));

describe("/api/chat route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for invalid body", async () => {
    const { POST } = await import("./route");
    const req = jsonRequest("http://test/api/chat", "POST", {});
    const res = await POST(req as never);
    expect(res.status).toBe(400);
  });

  it("returns SSE stream with mocked OpenAI replies", async () => {
    const stream = (async function* () {
      yield { choices: [{ delta: { content: "hello" } }] };
    })();
    vi.mocked(getOpenAIClient).mockReturnValue({
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue(stream),
        },
      },
    } as never);

    const { POST } = await import("./route");
    const req = jsonRequest("http://test/api/chat", "POST", {
      messages: [{ role: "user", content: "hi" }],
    });
    const res = await POST(req as never);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/event-stream");
    const text = await res.text();
    expect(text).toContain("hello");
    expect(text).toContain("[DONE]");
  });
});
