import { TransactionDomainError } from "../errors/TransactionDomainError";
import { TransactionStatus, TransactionType } from "@/core/application/dto/transaction";
export interface TransactionProps {
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

export interface CreateTransactionProps {
  id: string;
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

export class Transaction {
  private props: TransactionProps;

  private constructor(props: TransactionProps) {
    this.props = props;
  }

  static create(input: CreateTransactionProps): Transaction {
    const normalized: TransactionProps = {
      ...input,
      description: (input.description ?? "").trim() || "Sem descrição",
      creditCardId: input.isCreditCard ? input.creditCardId : undefined,
    };

    Transaction.validate(normalized);
    return new Transaction(normalized);
  }

  static rehydrate(input: TransactionProps): Transaction {
    Transaction.validate(input);
    return new Transaction({ ...input });
  }

  private static validate(input: TransactionProps): void {
    if (!input.id) {
      throw new TransactionDomainError("Id da transacao e obrigatorio.");
    }

    if (!input.userId) {
      throw new TransactionDomainError("Usuario da transacao e obrigatorio.");
    }

    if (!input.walletId) {
      throw new TransactionDomainError("Selecione uma carteira.");
    }

    if (!input.date) {
      throw new TransactionDomainError("Informe a data da movimentação.");
    }

    if (!Number.isFinite(input.value) || input.value <= 0) {
      throw new TransactionDomainError("O valor deve ser maior que zero.");
    }

    if (input.isCreditCard && !input.creditCardId) {
      throw new TransactionDomainError("Transacao de cartao exige creditCardId.");
    }

    if (!input.isCreditCard && input.creditCardId) {
      throw new TransactionDomainError("Transacao sem cartao nao pode ter creditCardId.");
    }

    if (input.isCreditCard && input.type !== "saida") {
      throw new TransactionDomainError("Transacao de cartao deve ser do tipo saida.");
    }
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get walletId(): string {
    return this.props.walletId;
  }

  get type(): TransactionType {
    return this.props.type;
  }

  get status(): TransactionStatus {
    return this.props.status;
  }

  get description(): string {
    return this.props.description;
  }

  get date(): string {
    return this.props.date;
  }

  get value(): number {
    return this.props.value;
  }

  get isCreditCard(): boolean {
    return this.props.isCreditCard;
  }

  get creditCardId(): string | undefined {
    return this.props.creditCardId;
  }

  isPending(): boolean {
    return this.props.status === "pendente";
  }

  isEffectivated(): boolean {
    return this.props.status === "efetivada";
  }

  effectivate(): void {
    if (this.props.status !== "pendente") {
      throw new TransactionDomainError("Transação já efetivada.");
    }

    this.props.status = "efetivada";
  }

  toPrimitives(): TransactionProps {
    return { ...this.props };
  }
}
