"use client";

import { useState, useEffect, useCallback } from "react";
import { UserProfile } from "@/types";

const LEGACY_STORAGE_KEY = "nwc_profile";

function todayString(): string {
  return new Date().toISOString().split("T")[0];
}

const defaultProfile: UserProfile = {
  fullName: "",
  address: "",
  certificateDate: todayString(),
  asOnDate: "",
};

function normalise(raw: Partial<UserProfile>): UserProfile {
  return {
    ...defaultProfile,
    ...raw,
    certificateDate: raw.certificateDate || todayString(),
  };
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then(async (data) => {
        const dbProfile: Partial<UserProfile> = data.profile ?? {};
        const hasDbData = !!(dbProfile.fullName || dbProfile.address || dbProfile.asOnDate);

        if (hasDbData) {
          setProfile(normalise(dbProfile));
        } else {
          // Migrate from localStorage if DB is empty
          try {
            const stored = localStorage.getItem(LEGACY_STORAGE_KEY);
            if (stored) {
              const local = JSON.parse(stored) as Partial<UserProfile>;
              if (local.fullName || local.address) {
                const migrated = normalise(local);
                await fetch("/api/profile", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(migrated),
                });
                setProfile(migrated);
                localStorage.removeItem(LEGACY_STORAGE_KEY);
                return;
              }
            }
          } catch {
            // ignore
          }
          setProfile(normalise(dbProfile));
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updates };
      fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      }).catch(() => {});
      return next;
    });
  }, []);

  return { profile, updateProfile, loaded };
}
