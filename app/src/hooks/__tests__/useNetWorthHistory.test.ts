import { renderHook, waitFor, act } from "@testing-library/react";
import { useNetWorthHistory } from "@/hooks/useNetWorthHistory";

describe("useNetWorthHistory", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn((input: RequestInfo | URL) => {
      if (String(input) === "/api/snapshots") {
        return Promise.resolve({ ok: true, json: async () => ({ snapshots: [] }) });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          snapshot: {
            id: "s1",
            date: "2026-01-01",
            totalAssets: 100,
            totalLiabilities: 10,
            netWorth: 90,
            entries: [],
            createdAt: "2026-01-01T00:00:00.000Z",
          },
        }),
      });
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads and saves snapshots", async () => {
    const { result } = renderHook(() => useNetWorthHistory());
    await waitFor(() => expect(result.current.loaded).toBe(true));

    await act(async () => {
      await result.current.saveSnapshot({
        date: "2026-01-01",
        totalAssets: 100,
        totalLiabilities: 10,
        netWorth: 90,
        entries: [],
      });
    });

    expect(result.current.snapshots).toHaveLength(1);
  });
});
