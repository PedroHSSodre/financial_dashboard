import type { CreditCard, Transaction, Wallet } from "@/lib/types";

export interface TransactionRepository {
  listByUserOrderedDesc(userId: string): Promise<Transaction[]>;
  create(transaction: Transaction): Promise<Transaction>;
  delete(transactionId: string): Promise<void>;
  efetivate(transactionId: string): Promise<void>;
}

export interface WalletRepository {
  listByUser(userId: string): Promise<Wallet[]>;
  getMainByUser(userId: string): Promise<Wallet | undefined>;
  getById(walletId: string): Promise<Wallet | undefined>;
  updateBalance(walletId: string, nextBalance: number): Promise<void>;
}

export interface CreditCardRepository {
  listByUser(userId: string): Promise<CreditCard[]>;
  create(creditCard: CreditCard): Promise<CreditCard>;
  getById(creditCardId: string): Promise<CreditCard | undefined>;
  updateLimit(creditCardId: string, nextLimit: number): Promise<void>;
  updateUsedLimit(creditCardId: string, nextUsedLimit: number): Promise<void>;
}
