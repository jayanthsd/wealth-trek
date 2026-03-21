"use client";

import { useState, useEffect, useCallback } from "react";
import { UserProfile } from "@/types";

const STORAGE_KEY = "nwc_profile";

function todayString(): string {
  return new Date().toISOString().split("T")[0];
}

const defaultProfile: UserProfile = {
  fullName: "",
  address: "",
  certificateDate: todayString(),
  asOnDate: "",
};

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as UserProfile;
        setProfile({
          ...defaultProfile,
          ...parsed,
          certificateDate: parsed.certificateDate || todayString(),
        });
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    }
  }, [profile, loaded]);

  const updateProfile = useCallback(
    (updates: Partial<UserProfile>) => {
      setProfile((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  return { profile, updateProfile, loaded };
}
