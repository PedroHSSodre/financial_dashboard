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

export interface CreateTransactionInput {
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
    validateInput(input);

    const transaction: Transaction = {
      id: generateId(),
      userId: input.userId,
      walletId: input.walletId,
      type: input.type,
      status: input.status,
      description: input.description.trim() || "Sem descrição",
      date: input.date,
      value: input.value,
      isCreditCard: input.isCreditCard,
      creditCardId: input.isCreditCard ? input.creditCardId : undefined,
    };

    await runInTransaction(async () => {
      await transactionRepository.create(transaction);

      if (transaction.status === "pendente") {
        return;
      }

      const wallet =
        (await walletRepository.getById(transaction.walletId)) ??
        (await walletRepository.getMainByUser(transaction.userId));

      if (!wallet) {
        throw new Error("Carteira não encontrada.");
      }

      if(!transaction.isCreditCard) {
        const nextBalance = applyTransactionToBalance(wallet.balance, transaction);
        await walletRepository.updateBalance(wallet.id, nextBalance);
        return;
      }

      if(!transaction.creditCardId) {
        throw new Error("Cartão de crédito não informado.");
      }

      const creditCard = await creditCardRepository.getById(transaction.creditCardId);
      
      if (!creditCard) {
        throw new Error("Cartão de crédito não encontrado.");
      }

      if(transaction.value > creditCard.remainingLimit) {
        throw new Error("O valor da transação não pode ser maior que o limite restante do cartão.");
      }

      const nextLimit = applyTransactionToBalance(creditCard.limit - creditCard.limitUsed, transaction);
      await creditCardRepository.updateRemainingLimit(creditCard.id, nextLimit);

      const nextUsedLimit = applyTransactionToUsedLimit(creditCard.limitUsed, transaction);
      await creditCardRepository.updateUsedLimit(creditCard.id, nextUsedLimit);

      const nextBalance = applyTransactionToBalance(wallet.balance, transaction);
      await walletRepository.updateBalance(wallet.id, nextBalance);
    });
  };
}

function validateInput(input: CreateTransactionInput) {
  if (!input.walletId) {
    throw new Error("Selecione uma carteira.");
  }

  if (!input.date) {
    throw new Error("Informe a data da movimentação.");
  }

  if (!Number.isFinite(input.value) || input.value <= 0) {
    throw new Error("O valor deve ser maior que zero.");
  }

  if(input.isCreditCard && !input.creditCardId) {
    throw new Error("Informe o cartão de crédito.");
  }
}
