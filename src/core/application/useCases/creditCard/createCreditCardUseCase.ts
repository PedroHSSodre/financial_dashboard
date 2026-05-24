import type { CreditCard } from "@/lib/types";
import type { CreditCardRepository } from "@/core/application/ports/financialRepositories";

export interface CreateCreditCardInput {
  userId: string;
  walletId: string;
  name: string;
  brand: string;
  limit: number;
  closingDay: number;
  dueDay: number;
}

interface CreateCreditCardDependencies {
  creditCardRepository: CreditCardRepository;
  generateId(): string;
}

export function makeCreateCreditCardUseCase({
  creditCardRepository,
  generateId,
}: CreateCreditCardDependencies) {
  return async function createCreditCard(input: CreateCreditCardInput) {
    validateInput(input);

    const creditCard: CreditCard = {
      id: generateId(),
      userId: input.userId,
      walletId: input.walletId,
      name: input.name,
      brand: input.brand,
      limit: input.limit,
      closingDay: input.closingDay,
      dueDay: input.dueDay,
    };

    await creditCardRepository.create(creditCard);

    return creditCard;
  };
}

function validateInput(input: CreateCreditCardInput) {
  if (!input.walletId) {
    throw new Error("Selecione uma carteira.");
  }

  if (!input.closingDay) {
    throw new Error("Informe o dia de fechamento do cartão.");
  }

  if (!Number.isFinite(input.closingDay) || input.closingDay <= 0) {
    throw new Error("O dia de vencimento deve ser maior que zero.");
  }

  if (!Number.isFinite(input.dueDay) || input.dueDay <= 0) {
    throw new Error("O dia de vencimento deve ser maior que zero.");
  }

  if (input.closingDay > input.dueDay) {
    throw new Error("O dia de fechamento deve ser anterior ao dia de vencimento.");
  }

  if (input.closingDay === input.dueDay) {
    throw new Error("O dia de fechamento e o dia de vencimento não podem ser o mesmo dia.");
  }

  if (!input.name) {
    throw new Error("Informe o nome do cartão.");
  }

  if (!input.brand) {
    throw new Error("Informe a bandeira do cartão.");
  }

  if (!Number.isFinite(input.limit) || input.limit <= 0) {
    throw new Error("O limite deve ser maior que zero.");
  }
}
