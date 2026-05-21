"use client";

import { useEffect, useState } from "react";
import type { UserProfile } from "@/lib/types";

const STORAGE_KEY = "dashboard-user-profile";

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setProfile(JSON.parse(stored) as UserProfile);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoaded(true);
  }, []);

  const saveProfile = (nextProfile: UserProfile) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProfile));
    setProfile(nextProfile);
  };

  return { profile, saveProfile, isLoaded };
}
