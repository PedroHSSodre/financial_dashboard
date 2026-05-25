import { db } from "@/lib/db/indexedDb";
import type { TransactionRepository } from "@/core/application/ports/financialRepositories";
import type { Transaction } from "@/lib/types";

export class DexieTransactionsRepository implements TransactionRepository {
  async listByUserOrderedDesc(userId: string): Promise<Transaction[]> {
    const transactions = await this.listByUser(userId);
    return transactions.sort(
      (left, right) =>
        new Date(right.date).getTime() - new Date(left.date).getTime(),
    );
  }

  async create(transaction: Transaction): Promise<Transaction> {
    await db.transactions.add(transaction);
    return transaction;
  }

  async delete(transactionId: string): Promise<void> {
    await db.transactions.delete(transactionId);
  }
  async efetivate(transactionId: string): Promise<void> {
    await db.transactions.update(transactionId, { status: "efetivada" });
  }

  private async listByUser(userId: string): Promise<Transaction[]> {
    return db.transactions.where("userId").equals(userId).toArray();
  }

  async getById(transactionId: string): Promise<Transaction | undefined> {
    return db.transactions.get(transactionId);
  }
}