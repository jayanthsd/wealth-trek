"use client";

import { useState, useEffect } from "react";

export interface Bank {
  id: string;
  name: string;
}

export function useBanks() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/banks")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch banks");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setBanks(data.banks);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => { cancelled = true; };
  }, []);

  return { banks, loaded };
}
