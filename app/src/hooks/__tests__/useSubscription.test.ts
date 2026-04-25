import { renderHook, waitFor } from "@testing-library/react";
import { useSubscription } from "@/hooks/useSubscription";

describe("useSubscription", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("starts with loading=true and subscription=null", () => {
    vi.spyOn(global, "fetch").mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useSubscription());
    expect(result.current.loading).toBe(true);
    expect(result.current.subscription).toBeNull();
  });

  it("sets subscription when API returns one", async () => {
    const mockSub = { id: "sub1", plan: "professional", billingCycle: "monthly", status: "active", expiresAt: "2027-01-01" };
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ subscription: mockSub }),
    } as Response);

    const { result } = renderHook(() => useSubscription());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.subscription).toEqual(mockSub);
  });

  it("sets subscription to null when API returns no subscription", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ subscription: null }),
    } as Response);

    const { result } = renderHook(() => useSubscription());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.subscription).toBeNull();
  });

  it("sets subscription to null when API returns non-ok response", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    } as Response);

    const { result } = renderHook(() => useSubscription());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.subscription).toBeNull();
  });

  it("sets subscription to null on network error", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("network error"));

    const { result } = renderHook(() => useSubscription());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.subscription).toBeNull();
  });

  it("exposes refetch function that re-fetches subscription", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ subscription: null }),
    } as Response);

    const { result } = renderHook(() => useSubscription());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const callsBefore = fetchSpy.mock.calls.length;
    await result.current.refetch();
    expect(fetchSpy.mock.calls.length).toBeGreaterThan(callsBefore);
  });
});
