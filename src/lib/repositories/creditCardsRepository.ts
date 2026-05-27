import { db } from "@/lib/db/indexedDb";
import { CreditCardDto } from "@/core/application/dto/creditCard";
import type { CreditCardRepository } from "@/core/application/ports/financialRepositories";

export class DexieCreditCardsRepository implements CreditCardRepository {
  async listByUser(userId: string): Promise<CreditCardDto[]> {
    return db.creditCards.where("userId").equals(userId).toArray();
  }

  async create(creditCard: CreditCardDto): Promise<CreditCardDto> {
    await db.creditCards.add(creditCard);
    return creditCard;
  }

  async getById(creditCardId: string): Promise<CreditCardDto | undefined> {
    return db.creditCards.get(creditCardId);
  }

  async updateRemainingLimit(creditCardId: string, nextLimit: number): Promise<void> {
    await db.creditCards.update(creditCardId, { remainingLimit: nextLimit });
  }

  async updateUsedLimit(creditCardId: string, nextUsedLimit: number): Promise<void> {
    await db.creditCards.update(creditCardId, { limitUsed: nextUsedLimit });
  }

  async update(creditCardId: string, creditCard: CreditCardDto): Promise<void> {
    await db.creditCards.update(creditCardId, creditCard);
  }
}