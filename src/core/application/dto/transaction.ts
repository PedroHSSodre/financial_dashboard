import { CreditCardDto } from "./creditCard";
import { WalletDto } from "./wallet";

export type TransactionType = "entrada" | "saida";
export type TransactionStatus = "pendente" | "efetivada";

export type TransactionDetailsDto = {
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
  creditCard?: CreditCardDto;
  wallet?: WalletDto;
};

export interface TransactionDto {
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
  