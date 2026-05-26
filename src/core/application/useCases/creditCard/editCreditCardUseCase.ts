import type { CreditCardRepository } from "@/core/application/ports/financialRepositories";
import { CreditCard } from "@/core/domain/entities/creditCard";

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
    if(!input.id) {
      throw new Error("Informe o id do cartão.");
    }

    const creditCard = CreditCard.rehydrate({
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
    });

    await creditCardRepository.update(input.id, creditCard.toPrimitives());

    return creditCard.toPrimitives();
  };
}
