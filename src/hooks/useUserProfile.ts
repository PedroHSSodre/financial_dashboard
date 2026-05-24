"use client";

import { useEffect, useState } from "react";
import {
  makeGetUserProfileUseCase,
  makeSaveUserProfileUseCase,
} from "@/core/application/useCases/user/userProfileUseCases";
import { LocalStorageUserProfileRepository } from "@/lib/repositories/userProfileRepository";
import type { UserProfile } from "@/lib/types";

const userProfileRepository = new LocalStorageUserProfileRepository();
const getUserProfile = makeGetUserProfileUseCase(userProfileRepository);
const saveUserProfile = makeSaveUserProfileUseCase(userProfileRepository);

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setProfile(getUserProfile());
    setIsLoaded(true);
  }, []);

  const saveProfile = (nextProfile: UserProfile) => {
    saveUserProfile(nextProfile);
    setProfile(nextProfile);
  };

  return { profile, saveProfile, isLoaded };
}
