import { CreditCardDomainError } from "../errors/CreditCardDomainError";

export interface CreditCardProps {
    id: string;
    userId: string;
    walletId: string;
    name: string;
    brand: string;
    limit: number;
    closingDay: number;
    dueDay: number;
    limitUsed: number;
    remainingLimit: number;
}

export interface CreateCreditCardProps {    
    id: string;
    userId: string;
    walletId: string;
    name: string;
    brand: string;
    limit: number;
    closingDay: number;
    dueDay: number;
    limitUsed: number;
    remainingLimit: number;
}

export class CreditCard {
    private props: CreditCardProps;

    private constructor(props: CreditCardProps) {
        this.props = props;
    }

    static create(input: CreateCreditCardProps): CreditCard {
        const normalized: CreditCardProps = {
            ...input,
        };

        CreditCard.validate(normalized);
        return new CreditCard(normalized);
    }

    static rehydrate(input: CreditCardProps): CreditCard {
        const normalized: CreditCardProps = {
          ...input,
        };
        CreditCard.validate(normalized);
        return new CreditCard(normalized);
    }

    private static validate(input: CreditCardProps): void {
        if (!input.walletId) {
          throw new CreditCardDomainError("Selecione uma carteira.");
        }

        if (!input.userId) {
          throw new CreditCardDomainError("Informe o usuário do cartão.");
        }
      
        if (!input.closingDay) {
          throw new CreditCardDomainError("Informe o dia de fechamento do cartão.");
        }
      
        if (!Number.isFinite(input.closingDay) || input.closingDay <= 0) {
          throw new CreditCardDomainError("O dia de vencimento deve ser maior que zero.");
        }
      
        if (!Number.isFinite(input.dueDay) || input.dueDay <= 0) {
          throw new CreditCardDomainError("O dia de vencimento deve ser maior que zero.");
        }
      
        if (input.closingDay > input.dueDay) {
          throw new CreditCardDomainError("O dia de fechamento deve ser anterior ao dia de vencimento.");
        }
      
        if (input.closingDay === input.dueDay) {
          throw new CreditCardDomainError("O dia de fechamento e o dia de vencimento não podem ser o mesmo dia.");
        }
      
        if (!input.name) {
          throw new CreditCardDomainError("Informe o nome do cartão.");
        }
      
        if (!input.brand) {
          throw new CreditCardDomainError("Informe a bandeira do cartão.");
        }
      
        if (!Number.isFinite(input.limit) || input.limit <= 0) {
          throw new CreditCardDomainError("O limite deve ser maior que zero.");
        }
      
        if (!Number.isFinite(input.limitUsed) || input.limitUsed < 0) {
          throw new CreditCardDomainError("O limite utilizado deve ser maior ou igual a zero.");
        }
      
        if (input.limitUsed > input.limit) {
          throw new CreditCardDomainError("O limite utilizado não pode ser maior que o limite do cartão.");
        }
      }

    get id(): string {
      return this.props.id;
    }

    get limitUsed(): number {
      return this.props.limitUsed;
    }

    get remainingLimit(): number {
        return this.props.remainingLimit;
    }

    applyPurchase(amount: number): void {
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new CreditCardDomainError("O valor da transação deve ser maior que zero.");
      }

      if (amount > this.props.remainingLimit) {
        throw new CreditCardDomainError(
          "O valor da transação não pode ser maior que o limite restante do cartão.",
        );
      }

      this.props.limitUsed += amount;
      this.props.remainingLimit = this.props.limit - this.props.limitUsed;
    }

    revertPurchase(amount: number): void {
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new CreditCardDomainError("O valor da transação deve ser maior que zero.");
      }

      if (amount > this.props.limitUsed) {
        throw new CreditCardDomainError(
          "O valor da reversão não pode ser maior que o limite utilizado.",
        );
      }

      this.props.limitUsed -= amount;
      this.props.remainingLimit = this.props.limit - this.props.limitUsed;
    }

    toPrimitives(): CreditCardProps {
        return { ...this.props };
    }
}