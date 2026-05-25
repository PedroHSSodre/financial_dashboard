import { CreditCardRepository, WalletRepository, TransactionRepository } from "../../ports/financialRepositories";

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
        const transaction = await transactionRepository.getById(transactionId);
        if (!transaction) {
            throw new Error("Transação não encontrada.");
        }
        const wallet = await walletRepository.getById(transaction.walletId);
        if (!wallet) {
            throw new Error("Carteira não encontrada.");
        }

        if(!transaction.isCreditCard) {
            return {
                ...transaction,
                wallet,
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
            ...transaction,
            wallet,
            creditCard,
        };
    }
}