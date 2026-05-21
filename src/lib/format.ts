import type { TransactionStatus, TransactionType } from "@/lib/types";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR");

export function formatCurrencyBRL(value: number): string {
  return currencyFormatter.format(value);
}

export function formatDateBR(value: string): string {
  return dateFormatter.format(new Date(value));
}

export function getTransactionTypeLabel(type: TransactionType): string {
  return type === "entrada" ? "Entrada" : "Saída";
}

export function getStatusLabel(status: TransactionStatus): string {
  return status === "efetivada" ? "Efetivada" : "Pendente";
}
