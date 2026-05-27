import { UserProfileDto } from "@/core/application/dto/userProfile";
import type { UserProfileRepository } from "@/core/application/ports/userProfileRepository";

const STORAGE_KEY = "dashboard-user-profile";

export class LocalStorageUserProfileRepository implements UserProfileRepository {
  get(): UserProfileDto | null {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored) as UserProfileDto;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }

  save(profile: UserProfileDto): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }
}
