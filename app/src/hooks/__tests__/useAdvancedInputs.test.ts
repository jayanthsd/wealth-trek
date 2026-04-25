import { renderHook, act, waitFor } from "@testing-library/react";
import { useAdvancedInputs } from "@/hooks/useAdvancedInputs";

const STORAGE_KEY = "wealthtrek_advanced_inputs";

describe("useAdvancedInputs", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("starts with empty inputs and loaded=false", () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      json: () => Promise.resolve({ inputs: {} }),
    } as Response);

    const { result } = renderHook(() => useAdvancedInputs());
    expect(result.current.inputs).toEqual({});
    expect(result.current.loaded).toBe(false);
  });

  it("loads inputs from API on mount", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      json: () => Promise.resolve({ inputs: { monthly_income: 90000, current_age: 30 } }),
    } as Response);

    const { result } = renderHook(() => useAdvancedInputs());
    await waitFor(() => expect(result.current.loaded).toBe(true));

    expect(result.current.inputs.monthly_income).toBe(90000);
    expect(result.current.inputs.current_age).toBe(30);
  });

  it("migrates from localStorage when DB returns empty", async () => {
    const localData = { monthly_income: 70000, current_age: 28 };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localData));

    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      json: () => Promise.resolve({ inputs: {} }),
    } as Response);

    const { result } = renderHook(() => useAdvancedInputs());
    await waitFor(() => expect(result.current.loaded).toBe(true));

    expect(result.current.inputs.monthly_income).toBe(70000);
    // Should POST migration to API
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/advanced-inputs",
      expect.objectContaining({ method: "POST" })
    );
    // Should remove from localStorage after migration
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("does not migrate when localStorage has all-zero values", async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ monthly_income: 0, current_age: 0 }));

    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      json: () => Promise.resolve({ inputs: {} }),
    } as Response);

    const { result } = renderHook(() => useAdvancedInputs());
    await waitFor(() => expect(result.current.loaded).toBe(true));

    // Only GET should be called, no POST migration
    const postCalls = fetchSpy.mock.calls.filter(([, opts]) => (opts as RequestInit)?.method === "POST");
    expect(postCalls).toHaveLength(0);
  });

  it("save() updates state and POSTs to API", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      json: () => Promise.resolve({ inputs: {} }),
    } as Response);

    const { result } = renderHook(() => useAdvancedInputs());
    await waitFor(() => expect(result.current.loaded).toBe(true));

    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({} as Response);

    act(() => {
      result.current.save({ monthly_income: 120000 });
    });

    expect(result.current.inputs.monthly_income).toBe(120000);
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/advanced-inputs",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ monthly_income: 120000 }) })
    );
  });

  it("hasAnyInput is false when inputs are empty", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      json: () => Promise.resolve({ inputs: {} }),
    } as Response);

    const { result } = renderHook(() => useAdvancedInputs());
    await waitFor(() => expect(result.current.loaded).toBe(true));
    expect(result.current.hasAnyInput).toBe(false);
  });

  it("hasAnyInput is true when any input has a non-zero value", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      json: () => Promise.resolve({ inputs: { monthly_income: 50000 } }),
    } as Response);

    const { result } = renderHook(() => useAdvancedInputs());
    await waitFor(() => expect(result.current.loaded).toBe(true));
    expect(result.current.hasAnyInput).toBe(true);
  });

  it("handles fetch error gracefully", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("network error"));

    const { result } = renderHook(() => useAdvancedInputs());
    await waitFor(() => expect(result.current.loaded).toBe(true));
    expect(result.current.inputs).toEqual({});
  });
});
