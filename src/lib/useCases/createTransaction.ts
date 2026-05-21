import { db } from "@/lib/db/indexedDb";
import { createTransactionRecord } from "@/lib/repositories/transactionsRepository";
import { getMainWalletByUser, updateWalletBalance } from "@/lib/repositories/walletsRepository";
import type { Transaction, TransactionStatus, TransactionType } from "@/lib/types";

export interface CreateTransactionInput {
  userId: string;
  walletId: string;
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  date: string;
  value: number;
}

export async function createTransaction(input: CreateTransactionInput) {
  validateInput(input);

  const transaction: Transaction = {
    id: crypto.randomUUID(),
    userId: input.userId,
    walletId: input.walletId,
    type: input.type,
    status: input.status,
    description: input.description.trim() || "Sem descrição",
    date: input.date,
    value: input.value,
  };

  await db.transaction("rw", db.transactions, db.wallets, async () => {
    await createTransactionRecord(transaction);

    if (transaction.status === "pendente") {
      return;
    }

    const wallet = await db.wallets.get(transaction.walletId);
    if (!wallet) {
      const fallback = await getMainWalletByUser(transaction.userId);
      if (!fallback) {
        throw new Error("Carteira não encontrada.");
      }
      const nextBalance = calculateWalletBalance(fallback.balance, transaction);
      await updateWalletBalance(fallback.id, nextBalance);
      return;
    }

    const nextBalance = calculateWalletBalance(wallet.balance, transaction);
    await updateWalletBalance(wallet.id, nextBalance);
  });
}

function calculateWalletBalance(balance: number, transaction: Transaction) {
  return transaction.type === "entrada"
    ? balance + transaction.value
    : balance - transaction.value;
}

function validateInput(input: CreateTransactionInput) {
  if (!input.walletId) {
    throw new Error("Selecione uma carteira.");
  }

  if (!input.date) {
    throw new Error("Informe a data da movimentação.");
  }

  if (!Number.isFinite(input.value) || input.value <= 0) {
    throw new Error("O valor deve ser maior que zero.");
  }
}
