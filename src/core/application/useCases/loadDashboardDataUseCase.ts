import type { DashboardBootstrapService } from "@/core/application/ports/dashboardBootstrapService";
import type {
  CreditCardRepository,
  TransactionRepository,
  WalletRepository,
} from "@/core/application/ports/financialRepositories";
import { WalletDto } from "@/core/application/dto/wallet";
import { TransactionDto } from "@/core/application/dto/transaction";
import { CreditCardDto } from "@/core/application/dto/creditCard";

export interface DashboardDataOutput {
  wallets: WalletDto[];
  transactions: TransactionDto[];
  creditCards: CreditCardDto[];
}

interface LoadDashboardDataDependencies {
  bootstrapService: DashboardBootstrapService;
  walletRepository: WalletRepository;
  transactionRepository: TransactionRepository;
  creditCardRepository: CreditCardRepository;
}

export function makeLoadDashboardDataUseCase({
  bootstrapService,
  walletRepository,
  transactionRepository,
  creditCardRepository,
}: LoadDashboardDataDependencies) {
  return async function loadDashboardData(userId: string): Promise<DashboardDataOutput> {
    await bootstrapService.ensureUserInitialized(userId);

    const [wallets, transactions, creditCards] = await Promise.all([
      walletRepository.listByUser(userId),
      transactionRepository.listByUserOrderedDesc(userId),
      creditCardRepository.listByUser(userId),
    ]);

    return {
      wallets,
      transactions,
      creditCards,
    };
  };
}
