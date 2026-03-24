"use client";

import { useState, useEffect, useCallback } from "react";
import { NetWorthSnapshot, StatementEntry } from "@/types";

export function useNetWorthHistory() {
  const [snapshots, setSnapshots] = useState<NetWorthSnapshot[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/snapshots")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch snapshots");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setSnapshots(data.snapshots);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => { cancelled = true; };
  }, []);

  const saveSnapshot = useCallback(
    async (data: {
      date: string;
      totalAssets: number;
      totalLiabilities: number;
      netWorth: number;
      entries: StatementEntry[];
    }) => {
      const res = await fetch("/api/snapshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save snapshot");
      const result = await res.json();
      const saved = result.snapshot as NetWorthSnapshot;

      setSnapshots((prev) => {
        const existingIndex = prev.findIndex((s) => s.date === saved.date);
        let updated: NetWorthSnapshot[];

        if (existingIndex >= 0) {
          updated = prev.map((s, i) =>
            i === existingIndex ? saved : s
          );
        } else {
          updated = [...prev, saved];
        }

        updated.sort((a, b) => a.date.localeCompare(b.date));
        return updated;
      });
    },
    []
  );

  const deleteSnapshot = useCallback(async (id: string) => {
    const res = await fetch(`/api/snapshots/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete snapshot");
    setSnapshots((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return { snapshots, saveSnapshot, deleteSnapshot, loaded };
}
