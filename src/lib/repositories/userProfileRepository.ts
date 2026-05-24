import type { UserProfileRepository } from "@/core/application/ports/userProfileRepository";
import type { UserProfile } from "@/lib/types";

const STORAGE_KEY = "dashboard-user-profile";

export class LocalStorageUserProfileRepository implements UserProfileRepository {
  get(): UserProfile | null {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored) as UserProfile;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }

  save(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }
}
