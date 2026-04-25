"use client";

import { useState, useEffect, useCallback } from "react";
import { FinancialGoal } from "@/types";
import { v4 as uuidv4 } from "uuid";

const LEGACY_STORAGE_KEY = "financial-goals";

export function useFinancialGoals() {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/goals")
      .then((r) => r.json())
      .then(async (data) => {
        const dbGoals: FinancialGoal[] = data.goals ?? [];

        if (dbGoals.length > 0) {
          setGoals(dbGoals);
        } else {
          // Migrate from localStorage if DB is empty
          try {
            const stored = localStorage.getItem(LEGACY_STORAGE_KEY);
            if (stored) {
              const local = JSON.parse(stored) as FinancialGoal[];
              if (local.length > 0) {
                await fetch("/api/goals", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(local),
                });
                // Re-fetch to get server IDs
                const res2 = await fetch("/api/goals");
                const data2 = await res2.json();
                setGoals(data2.goals ?? []);
                localStorage.removeItem(LEGACY_STORAGE_KEY);
                return;
              }
            }
          } catch {
            // ignore
          }
          setGoals(dbGoals);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const addGoal = useCallback(
    (data: Omit<FinancialGoal, "id" | "createdAt" | "status">) => {
      const tempId = uuidv4();
      const newGoal: FinancialGoal = {
        id: tempId,
        ...data,
        createdAt: new Date().toISOString(),
        status: "active",
      };
      setGoals((prev) => [...prev, newGoal]);

      fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGoal),
      })
        .then((r) => r.json())
        .then((res) => {
          const serverGoal: FinancialGoal = res.goals?.[0];
          if (serverGoal) {
            setGoals((prev) => prev.map((g) => (g.id === tempId ? serverGoal : g)));
          }
        })
        .catch(() => {});
    },
    []
  );

  const updateGoalStatus = useCallback(
    (id: string, status: FinancialGoal["status"]) => {
      setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, status } : g)));
      fetch(`/api/goals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }).catch(() => {});
    },
    []
  );

  const deleteGoal = useCallback((id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    fetch(`/api/goals/${id}`, { method: "DELETE" }).catch(() => {});
  }, []);

  return { goals, addGoal, updateGoalStatus, deleteGoal, loaded };
}
