import { renderHook, act } from "@testing-library/react";
import { useDocuments } from "@/hooks/useDocuments";

describe("useDocuments", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ ok: true })));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("adds and deletes documents", async () => {
    const { result } = renderHook(() => useDocuments());

    act(() => {
      result.current.addDocuments([
        {
          id: "d1",
          originalName: "file.pdf",
          storedPath: "a.pdf",
          fileType: "application/pdf",
          size: 123,
          uploadedAt: new Date().toISOString(),
        },
      ]);
    });

    expect(result.current.documents).toHaveLength(1);

    await act(async () => {
      await result.current.deleteDocument(result.current.documents[0]);
    });

    expect(result.current.documents).toHaveLength(0);
  });
});
