import {
  makeCreateCreditCardUseCase,
  type CreateCreditCardInput,
} from "@/core/application/useCases/creditCard/createCreditCardUseCase";
import type { CreditCardRepository } from "@/core/application/ports/financialRepositories";

function makeSut() {
  const creditCardRepository: CreditCardRepository = {
    listByUser: jest.fn(),
    create: jest.fn(async (creditCard) => creditCard),
    getById: jest.fn(),
    updateLimit: jest.fn(),
    updateUsedLimit: jest.fn(),
  };

  const generateId = jest.fn(() => "credit-card-id");

  const createCreditCardUseCase = makeCreateCreditCardUseCase({
    creditCardRepository,
    generateId,
  });

  const validInput: CreateCreditCardInput = {
    userId: "user-id",
    walletId: "wallet-id",
    name: "Cartao Nubank",
    brand: "Mastercard",
    limit: 5000,
    closingDay: 10,
    dueDay: 20,
    limitUsed: 0
  };

  return {
    createCreditCardUseCase,
    creditCardRepository,
    generateId,
    validInput,
  };
}

describe("makeCreateCreditCardUseCase", () => {
  it("deve criar e retornar o cartao de credito", async () => {
    const { createCreditCardUseCase, creditCardRepository, generateId, validInput } = makeSut();

    const result = await createCreditCardUseCase(validInput);

    expect(generateId).toHaveBeenCalledTimes(1);
    expect(creditCardRepository.create).toHaveBeenCalledWith({
      id: "credit-card-id",
      userId: validInput.userId,
      walletId: validInput.walletId,
      name: validInput.name,
      brand: validInput.brand,
      limit: validInput.limit,
      closingDay: validInput.closingDay,
      dueDay: validInput.dueDay,
      limitUsed: validInput.limitUsed,
    });
    expect(result).toEqual({
      id: "credit-card-id",
      userId: validInput.userId,
      walletId: validInput.walletId,
      name: validInput.name,
      brand: validInput.brand,
      limit: validInput.limit,
      closingDay: validInput.closingDay,
      dueDay: validInput.dueDay,
      limitUsed: validInput.limitUsed,
    });
  });

  it("deve falhar quando carteira nao for informada", async () => {
    const { createCreditCardUseCase, validInput, creditCardRepository } = makeSut();

    await expect(createCreditCardUseCase({ ...validInput, walletId: "" })).rejects.toThrow(
      "Selecione uma carteira.",
    );

    expect(creditCardRepository.create).not.toHaveBeenCalled();
  });

  it("deve falhar quando nome nao for informado", async () => {
    const { createCreditCardUseCase, validInput, creditCardRepository } = makeSut();

    await expect(createCreditCardUseCase({ ...validInput, name: "" })).rejects.toThrow(
      "Informe o nome do cartão.",
    );

    expect(creditCardRepository.create).not.toHaveBeenCalled();
  });

  it("deve falhar quando bandeira nao for informada", async () => {
    const { createCreditCardUseCase, validInput, creditCardRepository } = makeSut();

    await expect(createCreditCardUseCase({ ...validInput, brand: "" })).rejects.toThrow(
      "Informe a bandeira do cartão.",
    );

    expect(creditCardRepository.create).not.toHaveBeenCalled();
  });

  it("deve falhar quando limite for menor ou igual a zero", async () => {
    const { createCreditCardUseCase, validInput, creditCardRepository } = makeSut();

    await expect(createCreditCardUseCase({ ...validInput, limit: 0 })).rejects.toThrow(
      "O limite deve ser maior que zero.",
    );

    expect(creditCardRepository.create).not.toHaveBeenCalled();
  });

  it("deve falhar quando dia de fechamento nao for informado", async () => {
    const { createCreditCardUseCase, validInput, creditCardRepository } = makeSut();

    await expect(createCreditCardUseCase({ ...validInput, closingDay: 0 })).rejects.toThrow(
      "Informe o dia de fechamento do cartão.",
    );

    expect(creditCardRepository.create).not.toHaveBeenCalled();
  });

  it("deve falhar quando dia de vencimento for menor ou igual a zero", async () => {
    const { createCreditCardUseCase, validInput, creditCardRepository } = makeSut();

    await expect(createCreditCardUseCase({ ...validInput, dueDay: 0 })).rejects.toThrow(
      "O dia de vencimento deve ser maior que zero.",
    );

    expect(creditCardRepository.create).not.toHaveBeenCalled();
  });

  it("deve falhar quando dia de fechamento for maior que o dia de vencimento", async () => {
    const { createCreditCardUseCase, validInput, creditCardRepository } = makeSut();

    await expect(createCreditCardUseCase({ ...validInput, closingDay: 25, dueDay: 20 })).rejects.toThrow(
      "O dia de fechamento deve ser anterior ao dia de vencimento.",
    );

    expect(creditCardRepository.create).not.toHaveBeenCalled();
  });

  it("deve falhar quando dia de fechamento e vencimento forem iguais", async () => {
    const { createCreditCardUseCase, validInput, creditCardRepository } = makeSut();

    await expect(createCreditCardUseCase({ ...validInput, closingDay: 20, dueDay: 20 })).rejects.toThrow(
      "O dia de fechamento e o dia de vencimento não podem ser o mesmo dia.",
    );

    expect(creditCardRepository.create).not.toHaveBeenCalled();
  });
});
