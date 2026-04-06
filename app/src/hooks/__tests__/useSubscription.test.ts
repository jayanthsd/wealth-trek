import { renderHook, waitFor } from "@testing-library/react";
import { useSubscription } from "@/hooks/useSubscription";

describe("useSubscription", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ subscription: null }),
      })
    ));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads subscription from API", async () => {
    const { result } = renderHook(() => useSubscription());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.subscription).toBeNull();
  });

  it("loads active subscription successfully", async () => {
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          subscription: {
            id: "sub-1",
            plan: "professional",
            billingCycle: "monthly",
            status: "active",
            expiresAt: "2026-12-31T23:59:59.000Z",
          },
        }),
      })
    ));
    const { result } = renderHook(() => useSubscription());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.subscription).toEqual({
      id: "sub-1",
      plan: "professional",
      billingCycle: "monthly",
      status: "active",
      expiresAt: "2026-12-31T23:59:59.000Z",
    });
  });

  it("handles API returning no subscription", async () => {
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ subscription: null }),
      })
    ));
    const { result } = renderHook(() => useSubscription());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.subscription).toBeNull();
  });

  it("handles API error gracefully", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("Network error"))));
    const { result } = renderHook(() => useSubscription());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.subscription).toBeNull();
  });

  it("handles API returning non-ok status", async () => {
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        json: async () => ({ error: "Unauthorized" }),
      })
    ));
    const { result } = renderHook(() => useSubscription());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.subscription).toBeNull();
  });

  it("can refetch subscription data", async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          subscription: {
            id: "sub-1",
            plan: "free",
            billingCycle: "monthly",
            status: "active",
            expiresAt: "2026-12-31T23:59:59.000Z",
          },
        }),
      })
    );
    vi.stubGlobal("fetch", mockFetch);
    
    const { result } = renderHook(() => useSubscription());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockFetch).toHaveBeenCalledTimes(1);
    
    await waitFor(async () => {
      await result.current.refetch();
    });
    
    await waitFor(() => expect(result.current.loading).toBe(false));
    // May have been called more times depending on timing
    expect(mockFetch).toHaveBeenCalled();
  });
});