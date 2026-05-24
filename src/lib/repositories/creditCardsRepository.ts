import { db } from "@/lib/db/indexedDb";
import type { CreditCardRepository } from "@/core/application/ports/financialRepositories";
import type { CreditCard } from "@/lib/types";

export class DexieCreditCardsRepository implements CreditCardRepository {
  async listByUser(userId: string): Promise<CreditCard[]> {
    return db.creditCards.where("userId").equals(userId).toArray();
  }

  async create(creditCard: CreditCard): Promise<CreditCard> {
    await db.creditCards.add(creditCard);
    return creditCard;
  }
}

const repository = new DexieCreditCardsRepository();

export async function listCreditCardsByUser(
  userId: string,
): Promise<CreditCard[]> {
  return repository.listByUser(userId);
}

export async function createCreditCardRecord(
  creditCard: CreditCard,
): Promise<void> {
  await repository.create(creditCard);
}