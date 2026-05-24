import type { DashboardBootstrapService } from "@/core/application/ports/dashboardBootstrapService";
import type {
  CreditCardRepository,
  TransactionRepository,
  WalletRepository,
} from "@/core/application/ports/financialRepositories";
import type { CreditCard, Transaction, Wallet } from "@/lib/types";

export interface DashboardDataOutput {
  wallets: Wallet[];
  transactions: Transaction[];
  creditCards: CreditCard[];
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
