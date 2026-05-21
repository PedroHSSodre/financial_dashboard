import { db } from "@/lib/db/indexedDb";
import type { Wallet } from "@/lib/types";

export async function listWalletsByUser(userId: string): Promise<Wallet[]> {
  return db.wallets.where("userId").equals(userId).toArray();
}

export async function getMainWalletByUser(
  userId: string,
): Promise<Wallet | undefined> {
  const wallets = await listWalletsByUser(userId);
  return wallets[0];
}

export async function updateWalletBalance(
  walletId: string,
  nextBalance: number,
): Promise<void> {
  await db.wallets.update(walletId, { balance: nextBalance });
}
