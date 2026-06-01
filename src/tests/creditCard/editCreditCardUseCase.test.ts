import {
  makeEditCreditCardUseCase,
  type EditCreditCardInput,
} from "@/core/application/useCases/creditCard/editCreditCardUseCase";
import type { CreditCardRepository } from "@/core/application/ports/financialRepositories";

function makeSut() {
  const creditCardRepository: CreditCardRepository = {
    listByUser: jest.fn(),
    create: jest.fn(async (creditCard) => creditCard),
    getById: jest.fn(),
    updateRemainingLimit: jest.fn(),
    updateUsedLimit: jest.fn(),
    update: jest.fn(),
  };

  const editCreditCard = makeEditCreditCardUseCase({
    creditCardRepository,
  });

  const validInput: EditCreditCardInput = {
    id: "card-id",
    userId: "user-id",
    walletId: "wallet-id",
    name: "Cartao principal",
    brand: "Visa",
    limit: 5000,
    closingDay: 10,
    dueDay: 20,
    limitUsed: 1200,
  };

  return {
    editCreditCard,
    creditCardRepository,
    validInput,
  };
}

describe("makeEditCreditCardUseCase", () => {
  it("deve atualizar cartao recalculando limite restante", async () => {
    const { editCreditCard, creditCardRepository, validInput } = makeSut();

    const result = await editCreditCard(validInput);

    expect(creditCardRepository.update).toHaveBeenCalledWith("card-id", {
      ...validInput,
      remainingLimit: 3800,
    });
    expect(result.remainingLimit).toBe(3800);
  });

  it("deve falhar quando id nao for informado", async () => {
    const { editCreditCard, creditCardRepository, validInput } = makeSut();

    await expect(editCreditCard({ ...validInput, id: "" })).rejects.toThrow(
      "Informe o id do cartão.",
    );
    expect(creditCardRepository.update).not.toHaveBeenCalled();
  });

  it("deve falhar quando fechamento for igual ao vencimento", async () => {
    const { editCreditCard, creditCardRepository, validInput } = makeSut();

    await expect(
      editCreditCard({
        ...validInput,
        closingDay: 20,
        dueDay: 20,
      }),
    ).rejects.toThrow("O dia de fechamento e o dia de vencimento não podem ser o mesmo dia.");
    expect(creditCardRepository.update).not.toHaveBeenCalled();
  });
});
