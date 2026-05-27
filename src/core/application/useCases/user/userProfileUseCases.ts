import type { UserProfileRepository } from "@/core/application/ports/userProfileRepository";
import type { UserProfileDto } from "@/core/application/dto/userProfile";

export function makeGetUserProfileUseCase(repository: UserProfileRepository) {
  return function getUserProfile(): UserProfileDto | null {
    return repository.get();
  };
}

export function makeSaveUserProfileUseCase(repository: UserProfileRepository) {
  return function saveUserProfile(profile: UserProfileDto): void {
    repository.save(profile);
  };
}
