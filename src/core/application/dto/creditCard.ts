export interface CreditCardDto {
    id: string;
    userId: string;
    walletId: string;
    name: string;
    brand: string;
    limit: number;
    limitUsed: number;
    closingDay: number;
    dueDay: number;
    remainingLimit: number;
}