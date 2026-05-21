import { db } from "@/lib/db/indexedDb";
import type { Wallet } from "@/lib/types";

export const DEFAULT_USER_ID = "user-1";

export async function seedFirstAccess(userId: string = DEFAULT_USER_ID) {
  const walletsCount = await db.wallets.where("userId").equals(userId).count();
  if (walletsCount > 0) {
    return;
  }

  const defaultWallet: Wallet = {
    id: "wallet-1",
    userId,
    name: "Carteira principal",
    balance: 0,
    currency: "BRL",
  };

  await db.wallets.add(defaultWallet);
}
