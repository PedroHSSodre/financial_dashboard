import {
  makeGetUserProfileUseCase,
  makeSaveUserProfileUseCase,
} from "@/core/application/useCases/user/userProfileUseCases";
import type { UserProfileRepository } from "@/core/application/ports/userProfileRepository";
import type { UserProfileDto } from "@/core/application/dto/userProfile";

function makeSut() {
  const repository: UserProfileRepository = {
    get: jest.fn(),
    save: jest.fn(),
  };

  return {
    repository,
    getUserProfile: makeGetUserProfileUseCase(repository),
    saveUserProfile: makeSaveUserProfileUseCase(repository),
  };
}

describe("userProfileUseCases", () => {
  it("deve retornar perfil salvo do repositorio", () => {
    const { getUserProfile, repository } = makeSut();
    const profile: UserProfileDto = {
      name: "Pedro",
      email: "pedro@email.com",
    };
    (repository.get as jest.Mock).mockReturnValue(profile);

    const result = getUserProfile();

    expect(repository.get).toHaveBeenCalledTimes(1);
    expect(result).toEqual(profile);
  });

  it("deve delegar persistencia ao repositorio", () => {
    const { saveUserProfile, repository } = makeSut();
    const profile: UserProfileDto = {
      name: "Maria",
      email: "maria@email.com",
    };

    saveUserProfile(profile);

    expect(repository.save).toHaveBeenCalledWith(profile);
  });
});
