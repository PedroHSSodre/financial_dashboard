import type { TransactionStatus, TransactionType } from "@/lib/types";
import type {
  TransactionRepository,
  WalletRepository,
  CreditCardRepository,
} from "@/core/application/ports/financialRepositories";
import { revertTransactionFromBalance } from "@/core/domain/services/walletBalance";
import { revertTransactionFromUsedLimit } from "@/core/domain/services/creditCardBalance";

export interface DeleteTransactionInput {
  id: string;
  userId: string;
  walletId: string;
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  date: string;
  value: number;
  isCreditCard: boolean;
  creditCardId?: string;
}

interface DeleteTransactionDependencies {
  transactionRepository: TransactionRepository;
  creditCardRepository: CreditCardRepository;
  walletRepository: WalletRepository;
  runInTransaction<T>(operation: () => Promise<T>): Promise<T>;
}

export function makeDeleteTransactionUseCase({
  transactionRepository,
  walletRepository, 
  creditCardRepository,
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
      
      if(!input.isCreditCard) {
        const nextBalance = revertTransactionFromBalance(wallet.balance, input);
        await walletRepository.updateBalance(wallet.id, nextBalance);
        return;
      }

      if(!input.creditCardId) {
        throw new Error("Cartão de crédito não informado.");
      }
      
      const creditCard = await creditCardRepository.getById(input.creditCardId);
      if(!creditCard) {
        throw new Error("Cartão de crédito não encontrado.");
      }

      const nextLimit = revertTransactionFromBalance(creditCard.limit, input);
      await creditCardRepository.updateLimit(creditCard.id, nextLimit);

      const nextUsedLimit = revertTransactionFromUsedLimit(creditCard.limitUsed, input);
      await creditCardRepository.updateUsedLimit(creditCard.id, nextUsedLimit);

      const nextBalance = revertTransactionFromBalance(wallet.balance, input);
      await walletRepository.updateBalance(wallet.id, nextBalance);
    });
  };
}
