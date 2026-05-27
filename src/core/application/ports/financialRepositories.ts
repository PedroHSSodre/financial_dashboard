
import { CreditCardDto } from "../dto/creditCard";
import { TransactionDetailsDto, TransactionDto } from "../dto/transaction";
import { WalletDto } from "../dto/wallet";

export interface TransactionRepository {
  listByUserOrderedDesc(userId: string): Promise<TransactionDto[]>;
  create(transaction: TransactionDto): Promise<TransactionDto>;
  delete(transactionId: string): Promise<void>;
  efetivate(transactionId: string): Promise<void>;
  getById(transactionId: string): Promise<TransactionDetailsDto | undefined>;
}

export interface WalletRepository {
  listByUser(userId: string): Promise<WalletDto[]>;
  getMainByUser(userId: string): Promise<WalletDto | undefined>;
  getById(walletId: string): Promise<WalletDto | undefined>;
  updateBalance(walletId: string, nextBalance: number): Promise<void>;
}

export interface CreditCardRepository {
  listByUser(userId: string): Promise<CreditCardDto[]>;
  create(creditCard: CreditCardDto): Promise<CreditCardDto>;
  getById(creditCardId: string): Promise<CreditCardDto | undefined>;
  updateRemainingLimit(creditCardId: string, nextLimit: number): Promise<void>;
  updateUsedLimit(creditCardId: string, nextUsedLimit: number): Promise<void>;
  update(creditCardId: string, creditCard: CreditCardDto): Promise<void>;
}
