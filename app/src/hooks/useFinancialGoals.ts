"use client";

import { useState, useEffect, useCallback } from "react";
import { FinancialGoal } from "@/types";
import { v4 as uuidv4 } from "uuid";

const STORAGE_KEY = "financial-goals";

export function useFinancialGoals() {
  const [goals, setGoals] = useState<FinancialGoal[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as FinancialGoal[];
      }
    } catch {
      // ignore parse errors
    }
    return [];
  });

  const loaded = typeof window !== "undefined";

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
    }
  }, [goals, loaded]);

  const addGoal = useCallback(
    (data: Omit<FinancialGoal, "id" | "createdAt" | "status">) => {
      const newGoal: FinancialGoal = {
        id: uuidv4(),
        ...data,
        createdAt: new Date().toISOString(),
        status: "active",
      };
      setGoals((prev) => [...prev, newGoal]);
    },
    []
  );

  const updateGoalStatus = useCallback(
    (id: string, status: FinancialGoal["status"]) => {
      setGoals((prev) =>
        prev.map((g) => (g.id === id ? { ...g, status } : g))
      );
    },
    []
  );

  const deleteGoal = useCallback((id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  return { goals, addGoal, updateGoalStatus, deleteGoal, loaded };
}
