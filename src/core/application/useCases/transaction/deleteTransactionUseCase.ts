import type { TransactionStatus, TransactionType } from "@/lib/types";
import type {
  TransactionRepository,
  WalletRepository,
} from "@/core/application/ports/financialRepositories";
import { revertTransactionFromBalance } from "@/core/domain/services/walletBalance";

export interface DeleteTransactionInput {
  id: string;
  userId: string;
  walletId: string;
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  date: string;
  value: number;
}

interface DeleteTransactionDependencies {
  transactionRepository: TransactionRepository;
  walletRepository: WalletRepository;
  runInTransaction<T>(operation: () => Promise<T>): Promise<T>;
}

export function makeDeleteTransactionUseCase({
  transactionRepository,
  walletRepository,
  runInTransaction,
}: DeleteTransactionDependencies) {
  return async function deleteTransaction(input: DeleteTransactionInput) {

    await runInTransaction(async () => {
      await transactionRepository.delete(input.id);

      if (input.status === "pendente") {
        return;
      }

      const wallet = await walletRepository.getById(input.walletId);
      if (!wallet) {
        throw new Error("Carteira não encontrada.");
      }
      
      const nextBalance = revertTransactionFromBalance(wallet.balance, input);
      await walletRepository.updateBalance(wallet.id, nextBalance);
    });
  };
}
