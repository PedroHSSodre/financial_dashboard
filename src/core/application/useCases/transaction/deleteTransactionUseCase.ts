import { Wallet } from "@/core/domain/entities/wallet";
import type {
  TransactionRepository,
  WalletRepository,
  CreditCardRepository,
} from "@/core/application/ports/financialRepositories";
import { Transaction, TransactionProps } from "@/core/domain/entities/transaction";
import { CreditCard } from "@/core/domain/entities/creditCard";

export type DeleteTransactionInput = TransactionProps;

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
    const transaction = Transaction.rehydrate({
      id: input.id,
      userId: input.userId,
      walletId: input.walletId,
      type: input.type,
      status: input.status,
      description: input.description,
      date: input.date,
      value: input.value,
      isCreditCard: input.isCreditCard,
      creditCardId: input.creditCardId,
    });
    const tx = transaction.toPrimitives();

    await runInTransaction(async () => {
      await transactionRepository.delete(transaction.id);

      if (transaction.isPending()) {
        return;
      }

      const wallet = await walletRepository.getById(transaction.walletId);
      if (!wallet) {
        throw new Error("Carteira não encontrada.");
      }
      
      const walletEntity = Wallet.rehydrate(wallet);
      if(!transaction.isCreditCard) {
        walletEntity.revertTransaction(tx);
        await walletRepository.updateBalance(walletEntity.id, walletEntity.balance);
        return;
      }

      if(!transaction.creditCardId) {
        throw new Error("Cartão de crédito não informado.");
      }
      
      const creditCard = await creditCardRepository.getById(transaction.creditCardId);
      if(!creditCard) {
        throw new Error("Cartão de crédito não encontrado.");
      }

      const creditCardEntity = CreditCard.rehydrate(creditCard);
      creditCardEntity.revertPurchase(transaction.value);
      walletEntity.revertTransaction(tx);

      await creditCardRepository.updateRemainingLimit(creditCardEntity.id, creditCardEntity.remainingLimit);
      await creditCardRepository.updateUsedLimit(creditCardEntity.id, creditCardEntity.limitUsed);
      await walletRepository.updateBalance(walletEntity.id, walletEntity.balance);
    });
  };
}
