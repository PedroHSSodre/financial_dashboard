import type {
  Transaction,
  TransactionStatus,
  TransactionType,
} from "@/lib/types";
import type {
  TransactionRepository,
  WalletRepository,
} from "@/core/application/ports/financialRepositories";
import { applyTransactionToBalance } from "@/core/domain/services/walletBalance";

export interface CreateTransactionInput {
  userId: string;
  walletId: string;
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  date: string;
  value: number;
}

interface CreateTransactionDependencies {
  transactionRepository: TransactionRepository;
  walletRepository: WalletRepository;
  runInTransaction<T>(operation: () => Promise<T>): Promise<T>;
  generateId(): string;
}

export function makeCreateTransactionUseCase({
  transactionRepository,
  walletRepository,
  runInTransaction,
  generateId,
}: CreateTransactionDependencies) {
  return async function createTransaction(input: CreateTransactionInput) {
    validateInput(input);

    const transaction: Transaction = {
      id: generateId(),
      userId: input.userId,
      walletId: input.walletId,
      type: input.type,
      status: input.status,
      description: input.description.trim() || "Sem descrição",
      date: input.date,
      value: input.value,
    };

    await runInTransaction(async () => {
      await transactionRepository.create(transaction);

      if (transaction.status === "pendente") {
        return;
      }

      const wallet =
        (await walletRepository.getById(transaction.walletId)) ??
        (await walletRepository.getMainByUser(transaction.userId));

      if (!wallet) {
        throw new Error("Carteira não encontrada.");
      }

      const nextBalance = applyTransactionToBalance(wallet.balance, transaction);
      await walletRepository.updateBalance(wallet.id, nextBalance);
    });
  };
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
