import { renderHook, act } from "@testing-library/react";
import { useUserProfile } from "@/hooks/useUserProfile";

describe("useUserProfile", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("updates and persists profile", () => {
    const { result } = renderHook(() => useUserProfile());
    expect(result.current.loaded).toBe(true);

    act(() => {
      result.current.updateProfile({ fullName: "Alice" });
    });

    expect(result.current.profile.fullName).toBe("Alice");
    expect(localStorage.getItem("nwc_profile")).toContain("Alice");
  });
});
