import type { UserProfileRepository } from "@/core/application/ports/userProfileRepository";
import type { UserProfile } from "@/lib/types";

export function makeGetUserProfileUseCase(repository: UserProfileRepository) {
  return function getUserProfile(): UserProfile | null {
    return repository.get();
  };
}

export function makeSaveUserProfileUseCase(repository: UserProfileRepository) {
  return function saveUserProfile(profile: UserProfile): void {
    repository.save(profile);
  };
}
