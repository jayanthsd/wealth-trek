import { useState, useEffect } from 'react';
import { getItem, setItem } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/constants';
import { UserProfile } from '@/types';

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

const DEFAULT_PROFILE: UserProfile = {
  fullName: '',
  address: '',
  certificateDate: todayISO(),
  asOnDate: '',
};

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE).then((stored) => {
      if (stored) setProfile(stored);
      setLoading(false);
    });
  }, []);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const updated = { ...profile, ...updates };
    setProfile(updated);
    await setItem(STORAGE_KEYS.USER_PROFILE, updated);
  };

  return { profile, loading, updateProfile };
}
