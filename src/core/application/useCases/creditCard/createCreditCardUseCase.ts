import type { CreditCardRepository } from "@/core/application/ports/financialRepositories";
import { CreditCard } from "@/core/domain/entities/creditCard";

export interface CreateCreditCardInput {
  userId: string;
  walletId: string;
  name: string;
  brand: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  limitUsed: number;
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
    const creditCard = CreditCard.create({
      id: generateId(),
      userId: input.userId,
      walletId: input.walletId,
      name: input.name,
      brand: input.brand,
      limit: input.limit,
      closingDay: input.closingDay,
      dueDay: input.dueDay,
      limitUsed: input.limitUsed,
      remainingLimit: input.limit - input.limitUsed,
    });

    await creditCardRepository.create(creditCard.toPrimitives());

    return creditCard.toPrimitives();
  };
}
