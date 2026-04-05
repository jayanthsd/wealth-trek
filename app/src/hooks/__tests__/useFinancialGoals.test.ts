import { renderHook, act } from "@testing-library/react";
import { useFinancialGoals } from "@/hooks/useFinancialGoals";

describe("useFinancialGoals", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("adds and updates goal status", () => {
    const { result } = renderHook(() => useFinancialGoals());

    act(() => {
      result.current.addGoal({
        title: "Retirement",
        description: "Save money",
        targetAmount: 100000,
      });
    });

    const id = result.current.goals[0].id;
    act(() => {
      result.current.updateGoalStatus(id, "completed");
    });

    expect(result.current.goals[0].status).toBe("completed");
  });
});
