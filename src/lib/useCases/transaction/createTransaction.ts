import {
  makeCreateTransactionUseCase,
  type CreateTransactionInput,
} from "@/core/application/useCases/transaction/createTransactionUseCase";
import { runDexieFinancialTransaction } from "@/lib/db/dexieUnitOfWork";
import { DexieTransactionsRepository } from "@/lib/repositories/transactionsRepository";
import { DexieWalletsRepository } from "@/lib/repositories/walletsRepository";

const createTransactionUseCase = makeCreateTransactionUseCase({
  transactionRepository: new DexieTransactionsRepository(),
  walletRepository: new DexieWalletsRepository(),
  runInTransaction: runDexieFinancialTransaction,
  generateId: () => crypto.randomUUID(),
});

export type { CreateTransactionInput };

export async function createTransaction(input: CreateTransactionInput) {
  await createTransactionUseCase(input);
}
