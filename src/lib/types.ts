export type TransactionType = "entrada" | "saida";

export type TransactionStatus = "pendente" | "efetivada";

export interface UserProfile {
  name: string;
  email: string;
}

export interface Wallet {
  id: string;
  userId: string;
  name: string;
  balance: number;
  currency: "BRL";
}

export interface Transaction {
  id: string;
  userId: string;
  walletId: string;
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  date: string;
  value: number;
}

export interface CreditCard {
  id: string;
  userId: string;
  walletId: string;
  name: string;
  brand: string;
  limit: number;
  limitUsed: number;
  closingDay: number;
  dueDay: number;
}

export interface DashboardData {
  userId: string;
  wallets: Wallet[];
  transactions: Transaction[];
  creditCards: CreditCard[];
}
