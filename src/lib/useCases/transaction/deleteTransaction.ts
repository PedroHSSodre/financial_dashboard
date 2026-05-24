import {
    makeDeleteTransactionUseCase,
    type DeleteTransactionInput,
  } from "@/core/application/useCases/transaction/deleteTransactionUseCase";
  import { runDexieFinancialTransaction } from "@/lib/db/dexieUnitOfWork";
  import { DexieTransactionsRepository } from "@/lib/repositories/transactionsRepository";
  import { DexieWalletsRepository } from "@/lib/repositories/walletsRepository";
  import { DexieCreditCardsRepository } from "@/lib/repositories/creditCardsRepository";
  
  const deleteTransactionUseCase = makeDeleteTransactionUseCase({
    transactionRepository: new DexieTransactionsRepository(),
    walletRepository: new DexieWalletsRepository(),
    creditCardRepository: new DexieCreditCardsRepository(),
    runInTransaction: runDexieFinancialTransaction,
  });
  
  export type { DeleteTransactionInput };
  
  export async function deleteTransaction(input: DeleteTransactionInput) {
    await deleteTransactionUseCase(input);
  }
  