import {
  makeLoadDashboardDataUseCase,
  type DashboardDataOutput,
} from "@/core/application/useCases/loadDashboardDataUseCase";
import type { DashboardBootstrapService } from "@/core/application/ports/dashboardBootstrapService";
import type {
  CreditCardRepository,
  TransactionRepository,
  WalletRepository,
} from "@/core/application/ports/financialRepositories";

function makeSut() {
  const bootstrapService: DashboardBootstrapService = {
    ensureUserInitialized: jest.fn(async () => undefined),
  };

  const walletRepository: WalletRepository = {
    listByUser: jest.fn(),
    getMainByUser: jest.fn(),
    getById: jest.fn(),
    updateBalance: jest.fn(),
  };

  const transactionRepository: TransactionRepository = {
    listByUserOrderedDesc: jest.fn(),
    create: jest.fn(async (transaction) => transaction),
    delete: jest.fn(),
    efetivate: jest.fn(),
    getById: jest.fn(),
  };

  const creditCardRepository: CreditCardRepository = {
    listByUser: jest.fn(),
    create: jest.fn(async (creditCard) => creditCard),
    getById: jest.fn(),
    updateRemainingLimit: jest.fn(),
    updateUsedLimit: jest.fn(),
    update: jest.fn(),
  };

  const loadDashboardData = makeLoadDashboardDataUseCase({
    bootstrapService,
    walletRepository,
    transactionRepository,
    creditCardRepository,
  });

  return {
    loadDashboardData,
    bootstrapService,
    walletRepository,
    transactionRepository,
    creditCardRepository,
  };
}

describe("makeLoadDashboardDataUseCase", () => {
  it("deve inicializar usuario e retornar dados agregados", async () => {
    const {
      loadDashboardData,
      bootstrapService,
      walletRepository,
      transactionRepository,
      creditCardRepository,
    } = makeSut();

    (walletRepository.listByUser as jest.Mock).mockResolvedValue([
      { id: "wallet-id", userId: "user-id", name: "Wallet", balance: 500, currency: "BRL" },
    ]);
    (transactionRepository.listByUserOrderedDesc as jest.Mock).mockResolvedValue([
      {
        id: "tx-id",
        userId: "user-id",
        walletId: "wallet-id",
        type: "entrada",
        status: "efetivada",
        description: "Salario",
        date: "2026-05-20",
        value: 500,
        isCreditCard: false,
        creditCardId: undefined,
      },
    ]);
    (creditCardRepository.listByUser as jest.Mock).mockResolvedValue([
      {
        id: "card-id",
        userId: "user-id",
        walletId: "wallet-id",
        name: "Card",
        brand: "Visa",
        limit: 2000,
        closingDay: 10,
        dueDay: 20,
        limitUsed: 300,
        remainingLimit: 1700,
      },
    ]);

    const result: DashboardDataOutput = await loadDashboardData("user-id");

    expect(bootstrapService.ensureUserInitialized).toHaveBeenCalledWith("user-id");
    expect(walletRepository.listByUser).toHaveBeenCalledWith("user-id");
    expect(transactionRepository.listByUserOrderedDesc).toHaveBeenCalledWith("user-id");
    expect(creditCardRepository.listByUser).toHaveBeenCalledWith("user-id");
    expect(result.wallets).toHaveLength(1);
    expect(result.transactions).toHaveLength(1);
    expect(result.creditCards).toHaveLength(1);
  });
});
