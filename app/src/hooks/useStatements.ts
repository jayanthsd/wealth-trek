"use client";

import { useState, useEffect, useCallback } from "react";
import { StatementEntry } from "@/types";

export function useStatements() {
  const [statements, setStatements] = useState<StatementEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/statements")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch statements");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setStatements(data.statements);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => { cancelled = true; };
  }, []);

  const addStatement = useCallback(
    async (entry: Omit<StatementEntry, "id">) => {
      const res = await fetch("/api/statements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
      if (!res.ok) throw new Error("Failed to add statement");
      const data = await res.json();
      const created = data.statements[0] as StatementEntry;
      setStatements((prev) => [...prev, created]);
    },
    []
  );

  const bulkAddStatements = useCallback(
    async (entries: Omit<StatementEntry, "id">[]) => {
      const res = await fetch("/api/statements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entries),
      });
      if (!res.ok) throw new Error("Failed to bulk add statements");
      const data = await res.json();
      setStatements((prev) => [...prev, ...(data.statements as StatementEntry[])]);
    },
    []
  );

  const updateStatement = useCallback(
    async (id: string, updates: Partial<Omit<StatementEntry, "id">>) => {
      const res = await fetch(`/api/statements/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update statement");
      const data = await res.json();
      const updated = data.statement as StatementEntry;
      setStatements((prev) =>
        prev.map((s) => (s.id === id ? updated : s))
      );
    },
    []
  );

  const deleteStatement = useCallback(async (id: string) => {
    const res = await fetch(`/api/statements/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete statement");
    setStatements((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const deleteAllStatements = useCallback(async () => {
    const res = await fetch("/api/statements", { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete all statements");
    setStatements([]);
  }, []);

  return { statements, addStatement, bulkAddStatements, updateStatement, deleteStatement, deleteAllStatements, loaded };
}
