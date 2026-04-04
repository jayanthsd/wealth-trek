import { renderHook, waitFor, act } from "@testing-library/react";
import { useStatements } from "@/hooks/useStatements";

describe("useStatements", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn((input: RequestInfo | URL) => {
      if (String(input) === "/api/statements") {
        return Promise.resolve({
          ok: true,
          json: async () => ({ statements: [] }),
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({ statements: [{ id: "1" }] }) });
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads statements and adds one", async () => {
    const { result } = renderHook(() => useStatements());
    await waitFor(() => expect(result.current.loaded).toBe(true));

    await act(async () => {
      await result.current.addStatement({
        statementType: "Savings",
        description: "",
        category: "asset",
        closingBalance: 100,
        ownershipPercentage: 100,
      });
    });

    expect(result.current.statements.length).toBe(1);
  });
});
