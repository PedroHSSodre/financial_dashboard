import { db } from "@/lib/db/indexedDb";
import type { WalletRepository } from "@/core/application/ports/financialRepositories";
import type { Wallet } from "@/lib/types";

export class DexieWalletsRepository implements WalletRepository {
  async listByUser(userId: string): Promise<Wallet[]> {
    return db.wallets.where("userId").equals(userId).toArray();
  }

  async getMainByUser(userId: string): Promise<Wallet | undefined> {
    const wallets = await this.listByUser(userId);
    return wallets[0];
  }

  async getById(walletId: string): Promise<Wallet | undefined> {
    return db.wallets.get(walletId);
  }

  async updateBalance(walletId: string, nextBalance: number): Promise<void> {
    await db.wallets.update(walletId, { balance: nextBalance });
  }
}