// @vitest-environment node
const OpenAIConstructor = vi.fn(function OpenAI() {
  return { ok: true };
});

vi.mock("openai", () => ({
  default: OpenAIConstructor,
}));

describe("openai client factory", () => {
  it("throws when OPENAI_API_KEY is missing", async () => {
    delete process.env.OPENAI_API_KEY;
    vi.resetModules();
    const { getOpenAIClient } = await import("@/lib/openai");
    expect(() => getOpenAIClient()).toThrow("OPENAI_API_KEY environment variable is not configured");
  });

  it("creates singleton client when key is present", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    vi.resetModules();
    const { getOpenAIClient } = await import("@/lib/openai");

    const first = getOpenAIClient();
    const second = getOpenAIClient();

    expect(first).toBe(second);
    expect(OpenAIConstructor).toHaveBeenCalledTimes(1);
  });
});
