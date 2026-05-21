import { db } from "@/lib/db/indexedDb";
import type { Transaction } from "@/lib/types";

export async function listTransactionsByUser(
  userId: string,
): Promise<Transaction[]> {
  return db.transactions.where("userId").equals(userId).toArray();
}

export async function listTransactionsByUserOrderedDesc(
  userId: string,
): Promise<Transaction[]> {
  const transactions = await listTransactionsByUser(userId);
  return transactions.sort(
    (left, right) =>
      new Date(right.date).getTime() - new Date(left.date).getTime(),
  );
}

export async function createTransactionRecord(
  transaction: Transaction,
): Promise<void> {
  await db.transactions.add(transaction);
}
