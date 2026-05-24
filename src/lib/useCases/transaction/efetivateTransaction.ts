import {
    type EfetivateTransactionInput,
    makeEfetivateTransactionUseCase,
  } from "@/core/application/useCases/transaction/efetivateTransactionUseCase";
  import { runDexieFinancialTransaction } from "@/lib/db/dexieUnitOfWork";
  import { DexieTransactionsRepository } from "@/lib/repositories/transactionsRepository";
  import { DexieWalletsRepository } from "@/lib/repositories/walletsRepository";
  
  const efetivateTransactionUseCase = makeEfetivateTransactionUseCase({
    transactionRepository: new DexieTransactionsRepository(),
    walletRepository: new DexieWalletsRepository(),
    runInTransaction: runDexieFinancialTransaction,
  });
  
  export type { EfetivateTransactionInput };
  
  export async function efetivateTransaction(input: EfetivateTransactionInput) {
    await efetivateTransactionUseCase(input);
  }
  