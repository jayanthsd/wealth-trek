"use client";

import { useState, useEffect, useCallback } from "react";
import type { AdvancedInputs } from "@/types";

const LEGACY_STORAGE_KEY = "wealthtrek_advanced_inputs";

export function useAdvancedInputs() {
  const [inputs, setInputs] = useState<AdvancedInputs>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/advanced-inputs")
      .then((r) => r.json())
      .then(async (data) => {
        const dbInputs: AdvancedInputs = data.inputs ?? {};
        const hasDbData = Object.values(dbInputs).some((v) => v !== undefined && v !== null);

        if (hasDbData) {
          setInputs(dbInputs);
        } else {
          // Migrate from localStorage if DB is empty
          try {
            const stored = localStorage.getItem(LEGACY_STORAGE_KEY);
            if (stored) {
              const local = JSON.parse(stored) as AdvancedInputs;
              const hasLocal = Object.values(local).some((v) => v !== undefined && v !== null && v !== 0);
              if (hasLocal) {
                await fetch("/api/advanced-inputs", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(local),
                });
                setInputs(local);
                localStorage.removeItem(LEGACY_STORAGE_KEY);
                return;
              }
            }
          } catch {
            // ignore
          }
          setInputs(dbInputs);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const save = useCallback((updated: AdvancedInputs) => {
    setInputs(updated);
    fetch("/api/advanced-inputs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    }).catch(() => {});
  }, []);

  const hasAnyInput = Object.values(inputs).some(
    (v) => v !== undefined && v !== null && v !== 0
  );

  return { inputs, save, loaded, hasAnyInput };
}
