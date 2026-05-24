import { makeLoadDashboardDataUseCase } from "@/core/application/useCases/loadDashboardDataUseCase";
import { DexieCreditCardsRepository } from "@/lib/repositories/creditCardsRepository";
import { DexieTransactionsRepository } from "@/lib/repositories/transactionsRepository";
import { DexieWalletsRepository } from "@/lib/repositories/walletsRepository";
import { DexieDashboardBootstrapService } from "@/lib/services/dashboardBootstrapService";

const loadDashboardDataUseCase = makeLoadDashboardDataUseCase({
  bootstrapService: new DexieDashboardBootstrapService(),
  walletRepository: new DexieWalletsRepository(),
  transactionRepository: new DexieTransactionsRepository(),
  creditCardRepository: new DexieCreditCardsRepository(),
});

export async function loadDashboardData(userId: string) {
  return loadDashboardDataUseCase(userId);
}
