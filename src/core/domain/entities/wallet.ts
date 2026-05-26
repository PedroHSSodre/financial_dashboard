import { WalletDomainError } from "../errors/WalletDomainError";
import type { TransactionProps } from "./transaction";

export interface WalletProps {
  id: string;
  userId: string;
  name: string;
  balance: number;
  currency: "BRL";
}

export class Wallet {
  private props: WalletProps;

  private constructor(props: WalletProps) {
    this.props = props;
  }

  static rehydrate(input: WalletProps): Wallet {
    Wallet.validate(input);
    return new Wallet({ ...input });
  }

  private static validate(input: WalletProps): void {
    if (!input.id) {
      throw new WalletDomainError("Carteira não encontrada.");
    }

    if (!input.userId) {
      throw new WalletDomainError("Usuário da carteira é obrigatório.");
    }

    if (!Number.isFinite(input.balance)) {
      throw new WalletDomainError("Saldo da carteira inválido.");
    }
  }

  get id(): string {
    return this.props.id;
  }

  get balance(): number {
    return this.props.balance;
  }

  applyTransaction(tx: Pick<TransactionProps, "type" | "value">): void {
    if (!Number.isFinite(tx.value) || tx.value <= 0) {
      throw new WalletDomainError("O valor deve ser maior que zero.");
    }

    this.props.balance =
      tx.type === "entrada" ? this.props.balance + tx.value : this.props.balance - tx.value;
  }

  revertTransaction(tx: Pick<TransactionProps, "type" | "value">): void {
    if (!Number.isFinite(tx.value) || tx.value <= 0) {
      throw new WalletDomainError("O valor deve ser maior que zero.");
    }

    this.props.balance =
      tx.type === "entrada" ? this.props.balance - tx.value : this.props.balance + tx.value;
  }

  toPrimitives(): WalletProps {
    return { ...this.props };
  }
}
