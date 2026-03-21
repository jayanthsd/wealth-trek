"use client";

import { useState, useEffect, useCallback } from "react";
import { StatementEntry } from "@/types";
import { v4 as uuidv4 } from "uuid";

const STORAGE_KEY = "nwc_statements";

export function useStatements() {
  const [statements, setStatements] = useState<StatementEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setStatements(JSON.parse(stored));
      }
    } catch {
      // ignore parse errors
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(statements));
    }
  }, [statements, loaded]);

  const addStatement = useCallback(
    (entry: Omit<StatementEntry, "id">) => {
      setStatements((prev) => [...prev, { ...entry, id: uuidv4() }]);
    },
    []
  );

  const bulkAddStatements = useCallback(
    (entries: Omit<StatementEntry, "id">[]) => {
      setStatements((prev) => [
        ...prev,
        ...entries.map((entry) => ({ ...entry, id: uuidv4() })),
      ]);
    },
    []
  );

  const updateStatement = useCallback(
    (id: string, updates: Partial<Omit<StatementEntry, "id">>) => {
      setStatements((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
      );
    },
    []
  );

  const deleteStatement = useCallback((id: string) => {
    setStatements((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return { statements, addStatement, bulkAddStatements, updateStatement, deleteStatement, loaded };
}
