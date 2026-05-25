import { makeGetTransactionUseCase } from "@/core/application/useCases/transaction/getTransactionUseCase";
import { DexieTransactionsRepository } from "@/lib/repositories/transactionsRepository";
import { DexieWalletsRepository } from "@/lib/repositories/walletsRepository";
import { DexieCreditCardsRepository } from "@/lib/repositories/creditCardsRepository";

const getTransactionUseCase = makeGetTransactionUseCase({
  transactionRepository: new DexieTransactionsRepository(),
  walletRepository: new DexieWalletsRepository(),
  creditCardRepository: new DexieCreditCardsRepository(),
});

export async function getTransaction(transactionId: string) {
  return await getTransactionUseCase(transactionId);
}
