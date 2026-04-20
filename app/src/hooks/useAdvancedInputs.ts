"use client";

import { useState, useEffect, useCallback } from "react";
import type { AdvancedInputs } from "@/types";

const STORAGE_KEY = "wealthtrek_advanced_inputs";

export function useAdvancedInputs() {
  const [inputs, setInputs] = useState<AdvancedInputs>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setInputs(JSON.parse(stored));
      }
    } catch {
      // ignore parse errors
    }
    setLoaded(true);
  }, []);

  const save = useCallback((updated: AdvancedInputs) => {
    setInputs(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // storage full — ignore
    }
  }, []);

  const hasAnyInput = Object.values(inputs).some(
    (v) => v !== undefined && v !== null && v !== 0
  );

  return { inputs, save, loaded, hasAnyInput };
}
