"use client";

import { useState, useEffect, useCallback } from "react";
import { NetWorthSnapshot, StatementEntry } from "@/types";
import { v4 as uuidv4 } from "uuid";

const STORAGE_KEY = "networth-history";
const MAX_SNAPSHOTS = 50;

export function useNetWorthHistory() {
  const [snapshots, setSnapshots] = useState<NetWorthSnapshot[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as NetWorthSnapshot[];
      }
    } catch {
      // ignore parse errors
    }
    return [];
  });

  const loaded = typeof window !== "undefined";

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots));
    }
  }, [snapshots, loaded]);

  const saveSnapshot = useCallback(
    (data: {
      date: string;
      totalAssets: number;
      totalLiabilities: number;
      netWorth: number;
      entries: StatementEntry[];
    }) => {
      setSnapshots((prev) => {
        const existingIndex = prev.findIndex((s) => s.date === data.date);
        let updated: NetWorthSnapshot[];

        if (existingIndex >= 0) {
          updated = prev.map((s, i) =>
            i === existingIndex
              ? { ...s, ...data, createdAt: new Date().toISOString() }
              : s
          );
        } else {
          const newSnapshot: NetWorthSnapshot = {
            id: uuidv4(),
            ...data,
            createdAt: new Date().toISOString(),
          };
          updated = [...prev, newSnapshot];
        }

        updated.sort((a, b) => a.date.localeCompare(b.date));

        if (updated.length > MAX_SNAPSHOTS) {
          updated = updated.slice(updated.length - MAX_SNAPSHOTS);
        }

        return updated;
      });
    },
    []
  );

  const deleteSnapshot = useCallback((id: string) => {
    setSnapshots((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return { snapshots, saveSnapshot, deleteSnapshot, loaded };
}
