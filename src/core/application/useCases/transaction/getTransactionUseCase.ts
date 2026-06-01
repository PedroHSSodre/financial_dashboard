import { 
    CreditCardRepository, 
    WalletRepository, 
    TransactionRepository 
} from "@/core/application/ports/financialRepositories";
import { Transaction } from "@/core/domain/entities/transaction";

interface GetTransactionDependencies {
    transactionRepository: TransactionRepository;
    walletRepository: WalletRepository;
    creditCardRepository: CreditCardRepository;
}

export function makeGetTransactionUseCase({
    transactionRepository,
    walletRepository,
    creditCardRepository,
}: GetTransactionDependencies) {
    return async function getTransaction(transactionId: string) {
        const transactionData = await transactionRepository.getById(transactionId);
        if (!transactionData) {
            throw new Error("Transação não encontrada.");
        }
        const transaction = Transaction.rehydrate({
            id: transactionData.id,
            userId: transactionData.userId,
            walletId: transactionData.walletId,
            type: transactionData.type,
            status: transactionData.status,
            description: transactionData.description,
            date: transactionData.date,
            value: transactionData.value,
            isCreditCard: transactionData.isCreditCard,
            creditCardId: transactionData.creditCardId,
        });
        const tx = transaction.toPrimitives();
        const wallet = await walletRepository.getById(transaction.walletId);
        if (!wallet) {
            throw new Error("Carteira não encontrada.");
        }

        if(!transaction.isCreditCard) {
            return {
                ...tx,
                wallet,
                creditCard: undefined,
            };
        }

        if(!transaction.creditCardId) {
            throw new Error("Cartão de crédito não informado.");
        }

        const creditCard = await creditCardRepository.getById(transaction.creditCardId);
        if (!creditCard) {
            throw new Error("Cartão de crédito não encontrado.");
        }
        return {
            ...tx,
            wallet,
            creditCard,
        };
    }
}