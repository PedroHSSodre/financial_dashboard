import { UserProfileDto } from "../dto/userProfile";


export interface UserProfileRepository {
  get(): UserProfileDto | null;
  save(profile: UserProfileDto): void;
}
