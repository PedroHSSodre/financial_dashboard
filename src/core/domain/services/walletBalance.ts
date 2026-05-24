import { Transaction } from "@/lib/types";

export function applyTransactionToBalance(balance: number, tx: Pick<Transaction, "type" | "value">) {
    return tx.type === "entrada" ? balance + tx.value : balance - tx.value;
  }
export function revertTransactionFromBalance(balance: number, tx: Pick<Transaction, "type" | "value">) {
  return tx.type === "entrada" ? balance - tx.value : balance + tx.value;
}
