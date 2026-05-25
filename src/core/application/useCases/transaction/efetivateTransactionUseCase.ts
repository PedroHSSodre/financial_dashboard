import type {
  Transaction,
  TransactionStatus,
  TransactionType,
} from "@/lib/types";
import type {
  CreditCardRepository,
  TransactionRepository,
  WalletRepository,
} from "@/core/application/ports/financialRepositories";
import { applyTransactionToBalance } from "@/core/domain/services/walletBalance";
import { applyTransactionToUsedLimit } from "@/core/domain/services/creditCardBalance";

export interface EfetivateTransactionInput {
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

    await runInTransaction(async () => {
      if (input.status !== "pendente") {
        throw new Error("Transação já efetivada.");
      }

      await transactionRepository.efetivate(input.id);

      const wallet = await walletRepository.getById(input.walletId);
      if (!wallet) {
        throw new Error("Carteira não encontrada.");
      }
      
      if(!input.isCreditCard) {
        const nextBalance = applyTransactionToBalance(wallet.balance, input);
        await walletRepository.updateBalance(wallet.id, nextBalance);
        return;
      }

      if(!input.creditCardId) {
        throw new Error("Cartão de crédito não informado.");
      }

      const creditCard = await creditCardRepository.getById(input.creditCardId);
      
      if (!creditCard) {
        throw new Error("Cartão de crédito não encontrado.");
      }

      const nextLimit = applyTransactionToBalance(creditCard.limit, input);
      await creditCardRepository.updateLimit(creditCard.id, nextLimit);

      const nextUsedLimit = applyTransactionToUsedLimit(creditCard.limitUsed, input);
      await creditCardRepository.updateUsedLimit(creditCard.id, nextUsedLimit);

      const nextBalance = applyTransactionToBalance(wallet.balance, input);
      await walletRepository.updateBalance(wallet.id, nextBalance);
    });
  };
}

