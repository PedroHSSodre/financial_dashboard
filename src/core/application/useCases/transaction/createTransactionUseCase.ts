
import type {
  CreditCardRepository,
  TransactionRepository,
  WalletRepository,
} from "@/core/application/ports/financialRepositories";
import { Transaction } from "@/core/domain/entities/transaction";
import { Wallet } from "@/core/domain/entities/wallet";
import { CreditCard } from "@/core/domain/entities/creditCard";
import { TransactionStatus, TransactionType } from "@/core/application/dto/transaction";

export interface CreateTransactionInput {
  userId: string;
  walletId: string;
  type: TransactionType;
  status: TransactionStatus;
  description?: string;
  date: string;
  value: number;
  isCreditCard: boolean;
  creditCardId?: string;
}

interface CreateTransactionDependencies {
  transactionRepository: TransactionRepository;
  walletRepository: WalletRepository;
  creditCardRepository: CreditCardRepository;
  runInTransaction<T>(operation: () => Promise<T>): Promise<T>;
  generateId(): string;
}

export function makeCreateTransactionUseCase({
  transactionRepository,
  walletRepository,
  creditCardRepository,
  runInTransaction,
  generateId,
}: CreateTransactionDependencies) {
  return async function createTransaction(input: CreateTransactionInput) {
    const transaction = Transaction.create({
      id: generateId(),
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
      await transactionRepository.create(tx);

      if (transaction.isPending()) {
        return;
      }

      const wallet =
        (await walletRepository.getById(transaction.walletId)) ??
        (await walletRepository.getMainByUser(transaction.userId));

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
