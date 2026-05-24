import type {
  Transaction,
  TransactionStatus,
  TransactionType,
} from "@/lib/types";
import type {
  TransactionRepository,
  WalletRepository,
} from "@/core/application/ports/financialRepositories";

export interface EfetivateTransactionInput {
  id: string;
  userId: string;
  walletId: string;
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  date: string;
  value: number;
}

interface EfetivateTransactionDependencies {
  transactionRepository: TransactionRepository;
  walletRepository: WalletRepository;
  runInTransaction<T>(operation: () => Promise<T>): Promise<T>;
}

export function makeEfetivateTransactionUseCase({
  transactionRepository,
  walletRepository,
  runInTransaction,
}: EfetivateTransactionDependencies) {
  return async function efetivateTransaction(input: EfetivateTransactionInput) {

    await runInTransaction(async () => {
      if (input.status !== "pendente") {
        throw new Error("Transação já efetivada.");
      }

      await transactionRepository.efetivate(input.id);

      const wallet = await walletRepository.getById(input.walletId);
      if (!wallet) {
        throw new Error("Carteira não encontrada.");
      }
      
      const nextBalance = calculateWalletBalance(wallet.balance, input);
      await walletRepository.updateBalance(wallet.id, nextBalance);
    });
  };
}

function calculateWalletBalance(balance: number, transaction: Transaction) {
  return transaction.type === "entrada"
    ? balance + transaction.value
    : balance - transaction.value;
}