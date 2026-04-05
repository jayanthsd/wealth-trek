import { renderHook, act } from "@testing-library/react";
import { useChatHistory } from "@/hooks/useChatHistory";

describe("useChatHistory", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("appends and updates assistant messages", () => {
    const { result } = renderHook(() => useChatHistory());

    act(() => {
      result.current.addMessage({
        id: "m1",
        role: "assistant",
        content: "Hello",
        timestamp: new Date().toISOString(),
      });
      result.current.updateLastAssistantMessage(" world");
    });

    expect(result.current.messages[0].content).toBe("Hello world");

    act(() => result.current.clearHistory());
    expect(result.current.messages).toHaveLength(0);
  });
});
