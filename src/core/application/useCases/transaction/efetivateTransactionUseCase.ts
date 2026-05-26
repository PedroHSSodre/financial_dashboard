import type {
  CreditCardRepository,
  TransactionRepository,
  WalletRepository,
} from "@/core/application/ports/financialRepositories";
import { Transaction, TransactionProps } from "@/core/domain/entities/transaction";
import { Wallet } from "@/core/domain/entities/wallet";
import { CreditCard } from "@/core/domain/entities/creditCard";

export type EfetivateTransactionInput = TransactionProps;

interface EfetivateTransactionDependencies {
  transactionRepository: TransactionRepository;
  walletRepository: WalletRepository;
  creditCardRepository: CreditCardRepository;
  runInTransaction<T>(operation: () => Promise<T>): Promise<T>;
}

export function makeEfetivateTransactionUseCase({
  transactionRepository,
  walletRepository,
  creditCardRepository,
  runInTransaction,
}: EfetivateTransactionDependencies) {
  return async function efetivateTransaction(input: EfetivateTransactionInput) {
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
    transaction.effectivate();
    const tx = transaction.toPrimitives();

    await runInTransaction(async () => {
      await transactionRepository.efetivate(transaction.id);

      const wallet = await walletRepository.getById(transaction.walletId);
      if (!wallet) {
        throw new Error("Carteira não encontrada.");
      }

      const walletEntity = Wallet.rehydrate(wallet);
      if(!transaction.isCreditCard) {
        walletEntity.applyTransaction(tx);
        await walletRepository.updateBalance(walletEntity.id, walletEntity.balance);
        return;
      }

      if(!transaction.creditCardId) {
        throw new Error("Cartão de crédito não informado.");
      }

      const creditCard = await creditCardRepository.getById(transaction.creditCardId);
      if (!creditCard) {
        throw new Error("Cartão de crédito não encontrado.");
      }

      const creditCardEntity = CreditCard.rehydrate(creditCard);
      creditCardEntity.applyPurchase(transaction.value);
      walletEntity.applyTransaction(tx);

      await creditCardRepository.updateRemainingLimit(creditCardEntity.id, creditCardEntity.remainingLimit);
      await creditCardRepository.updateUsedLimit(creditCardEntity.id, creditCardEntity.limitUsed);
      await walletRepository.updateBalance(walletEntity.id, walletEntity.balance);
    });
  };
}

