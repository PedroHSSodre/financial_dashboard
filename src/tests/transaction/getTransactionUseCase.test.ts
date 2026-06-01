import { makeGetTransactionUseCase } from "@/core/application/useCases/transaction/getTransactionUseCase";
import type {
  CreditCardRepository,
  TransactionRepository,
  WalletRepository,
} from "@/core/application/ports/financialRepositories";

function makeSut() {
  const transactionRepository: TransactionRepository = {
    listByUserOrderedDesc: jest.fn(),
    create: jest.fn(async (transaction) => transaction),
    delete: jest.fn(),
    efetivate: jest.fn(),
    getById: jest.fn(),
  };

  const walletRepository: WalletRepository = {
    listByUser: jest.fn(),
    getMainByUser: jest.fn(),
    getById: jest.fn(),
    updateBalance: jest.fn(),
  };

  const creditCardRepository: CreditCardRepository = {
    listByUser: jest.fn(),
    create: jest.fn(async (creditCard) => creditCard),
    getById: jest.fn(),
    updateRemainingLimit: jest.fn(),
    updateUsedLimit: jest.fn(),
    update: jest.fn(),
  };

  const getTransaction = makeGetTransactionUseCase({
    transactionRepository,
    walletRepository,
    creditCardRepository,
  });

  return {
    getTransaction,
    transactionRepository,
    walletRepository,
    creditCardRepository,
  };
}

describe("makeGetTransactionUseCase", () => {
  it("deve retornar transacao com carteira quando nao for de cartao", async () => {
    const { getTransaction, transactionRepository, walletRepository, creditCardRepository } = makeSut();

    (transactionRepository.getById as jest.Mock).mockResolvedValue({
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
    });
    (walletRepository.getById as jest.Mock).mockResolvedValue({
      id: "wallet-id",
      userId: "user-id",
      name: "Carteira principal",
      balance: 1000,
      currency: "BRL",
    });

    const result = await getTransaction("tx-id");

    expect(result.wallet).toEqual(
      expect.objectContaining({
        id: "wallet-id",
      }),
    );
    expect(result.creditCard).toBeUndefined();
    expect(creditCardRepository.getById).not.toHaveBeenCalled();
  });

  it("deve retornar transacao com carteira e cartao quando for compra no cartao", async () => {
    const { getTransaction, transactionRepository, walletRepository, creditCardRepository } = makeSut();

    (transactionRepository.getById as jest.Mock).mockResolvedValue({
      id: "tx-id",
      userId: "user-id",
      walletId: "wallet-id",
      type: "saida",
      status: "efetivada",
      description: "Compra",
      date: "2026-05-20",
      value: 200,
      isCreditCard: true,
      creditCardId: "card-id",
    });
    (walletRepository.getById as jest.Mock).mockResolvedValue({
      id: "wallet-id",
      userId: "user-id",
      name: "Carteira principal",
      balance: 1000,
      currency: "BRL",
    });
    (creditCardRepository.getById as jest.Mock).mockResolvedValue({
      id: "card-id",
      userId: "user-id",
      walletId: "wallet-id",
      name: "Card",
      brand: "Visa",
      limit: 2000,
      limitUsed: 300,
      closingDay: 10,
      dueDay: 20,
      remainingLimit: 1700,
    });

    const result = await getTransaction("tx-id");

    expect(result.wallet).toBeDefined();
    expect(result.creditCard).toEqual(
      expect.objectContaining({
        id: "card-id",
      }),
    );
  });

  it("deve falhar quando transacao nao for encontrada", async () => {
    const { getTransaction, transactionRepository } = makeSut();
    (transactionRepository.getById as jest.Mock).mockResolvedValue(undefined);

    await expect(getTransaction("tx-id")).rejects.toThrow("Transação não encontrada.");
  });

  it("deve falhar quando carteira nao for encontrada", async () => {
    const { getTransaction, transactionRepository, walletRepository } = makeSut();

    (transactionRepository.getById as jest.Mock).mockResolvedValue({
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
    });
    (walletRepository.getById as jest.Mock).mockResolvedValue(undefined);

    await expect(getTransaction("tx-id")).rejects.toThrow("Carteira não encontrada.");
  });

  it("deve falhar quando transacao de cartao nao informar creditCardId", async () => {
    const { getTransaction, transactionRepository, walletRepository } = makeSut();

    (transactionRepository.getById as jest.Mock).mockResolvedValue({
      id: "tx-id",
      userId: "user-id",
      walletId: "wallet-id",
      type: "saida",
      status: "efetivada",
      description: "Compra",
      date: "2026-05-20",
      value: 200,
      isCreditCard: true,
      creditCardId: undefined,
    });
    (walletRepository.getById as jest.Mock).mockResolvedValue({
      id: "wallet-id",
      userId: "user-id",
      name: "Carteira principal",
      balance: 1000,
      currency: "BRL",
    });

    await expect(getTransaction("tx-id")).rejects.toThrow("Cartão de crédito não informado.");
  });

  it("deve falhar quando cartao nao for encontrado", async () => {
    const { getTransaction, transactionRepository, walletRepository, creditCardRepository } = makeSut();

    (transactionRepository.getById as jest.Mock).mockResolvedValue({
      id: "tx-id",
      userId: "user-id",
      walletId: "wallet-id",
      type: "saida",
      status: "efetivada",
      description: "Compra",
      date: "2026-05-20",
      value: 200,
      isCreditCard: true,
      creditCardId: "card-id",
    });
    (walletRepository.getById as jest.Mock).mockResolvedValue({
      id: "wallet-id",
      userId: "user-id",
      name: "Carteira principal",
      balance: 1000,
      currency: "BRL",
    });
    (creditCardRepository.getById as jest.Mock).mockResolvedValue(undefined);

    await expect(getTransaction("tx-id")).rejects.toThrow("Cartão de crédito não encontrado.");
  });
});
