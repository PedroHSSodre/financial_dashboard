import { Transaction } from "@/lib/types";

export function applyTransactionToUsedLimit(usedLimit: number, tx: Pick<Transaction, "value">) {
return usedLimit + tx.value;
}
export function revertTransactionFromUsedLimit(usedLimit: number, tx: Pick<Transaction, "value">) {
  return usedLimit - tx.value;
}