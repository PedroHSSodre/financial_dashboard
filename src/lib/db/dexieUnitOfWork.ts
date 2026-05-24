import { db } from "@/lib/db/indexedDb";

export async function runDexieFinancialTransaction<T>(
  operation: () => Promise<T>,
): Promise<T> {
  return db.transaction(
    "rw",
    db.transactions,
    db.wallets,
    db.creditCards,
    operation,
  );
}
