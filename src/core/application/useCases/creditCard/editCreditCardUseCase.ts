import type { CreditCard } from "@/lib/types";
import type { CreditCardRepository } from "@/core/application/ports/financialRepositories";

export interface EditCreditCardInput {
  id: string;
  userId: string;
  walletId: string;
  name: string;
  brand: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  limitUsed: number;
}

interface EditCreditCardDependencies {
  creditCardRepository: CreditCardRepository;
}

export function makeEditCreditCardUseCase({
  creditCardRepository,
}: EditCreditCardDependencies) {
  return async function editCreditCard(input: EditCreditCardInput) {
    validateInput(input);

    const creditCard: CreditCard = {
      id: input.id,
      userId: input.userId,
      walletId: input.walletId,
      name: input.name,
      brand: input.brand,
      limit: input.limit,
      limitUsed: input.limitUsed,
      closingDay: input.closingDay,
      dueDay: input.dueDay,
      remainingLimit: input.limit - input.limitUsed,
    };

    await creditCardRepository.update(input.id, creditCard);

    return creditCard;
  };
}

function validateInput(input: EditCreditCardInput) {
  if (!input.id) {
    throw new Error("Informe o id do cartão.");
  }

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

  if (!Number.isFinite(input.limitUsed) || input.limitUsed < 0) {
    throw new Error("O limite utilizado deve ser maior ou igual a zero.");
  }

  if (input.limitUsed > input.limit) {
    throw new Error("O limite utilizado não pode ser maior que o limite do cartão.");
  }

  if(input.limit < input.limitUsed) {
    throw new Error("O limite utilizado não pode ser maior que o limite do cartão.");
  }
}
