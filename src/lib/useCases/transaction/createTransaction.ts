import {
  makeCreateTransactionUseCase,
  type CreateTransactionInput,
} from "@/core/application/useCases/transaction/createTransactionUseCase";
import { runDexieFinancialTransaction } from "@/lib/db/dexieUnitOfWork";
import { DexieCreditCardsRepository } from "@/lib/repositories/creditCardsRepository";
import { DexieTransactionsRepository } from "@/lib/repositories/transactionsRepository";
import { DexieWalletsRepository } from "@/lib/repositories/walletsRepository";

const createTransactionUseCase = makeCreateTransactionUseCase({
  transactionRepository: new DexieTransactionsRepository(),
  walletRepository: new DexieWalletsRepository(),
  creditCardRepository: new DexieCreditCardsRepository(),
  runInTransaction: runDexieFinancialTransaction,
  generateId: () => crypto.randomUUID(),
});

export type { CreateTransactionInput };

export async function createTransaction(input: CreateTransactionInput) {
  await createTransactionUseCase(input);
}
