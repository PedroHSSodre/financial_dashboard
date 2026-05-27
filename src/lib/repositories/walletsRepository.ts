import { db } from "@/lib/db/indexedDb";
import { WalletDto } from "@/core/application/dto/wallet";
import type { WalletRepository } from "@/core/application/ports/financialRepositories";

export class DexieWalletsRepository implements WalletRepository {
  async listByUser(userId: string): Promise<WalletDto[]> {
    return db.wallets.where("userId").equals(userId).toArray();
  }

  async getMainByUser(userId: string): Promise<WalletDto | undefined> {
    const wallets = await this.listByUser(userId);
    return wallets[0];
  }

  async getById(walletId: string): Promise<WalletDto | undefined> {
    return db.wallets.get(walletId);
  }

  async updateBalance(walletId: string, nextBalance: number): Promise<void> {
    await db.wallets.update(walletId, { balance: nextBalance });
  }
}