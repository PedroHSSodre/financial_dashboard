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
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return dateFormatter.format(new Date(year, month - 1, day));
  }

  return dateFormatter.format(new Date(value));
}

export function getTransactionTypeLabel(type: TransactionType): string {
  return type === "entrada" ? "Entrada" : "Saída";
}

export function getStatusLabel(status: TransactionStatus): string {
  return status === "efetivada" ? "Efetivada" : "Pendente";
}
