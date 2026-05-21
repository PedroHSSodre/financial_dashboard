import { db } from "@/lib/db/indexedDb";
import type { CreditCard } from "@/lib/types";

export async function listCreditCardsByUser(
  userId: string,
): Promise<CreditCard[]> {
  return db.creditCards.where("userId").equals(userId).toArray();
}
