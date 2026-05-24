import type { UserProfile } from "@/lib/types";

export interface UserProfileRepository {
  get(): UserProfile | null;
  save(profile: UserProfile): void;
}
