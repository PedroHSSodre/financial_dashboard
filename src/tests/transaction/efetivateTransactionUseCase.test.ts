import {
  makeEfetivateTransactionUseCase,
  type EfetivateTransactionInput,
} from "@/core/application/useCases/transaction/efetivateTransactionUseCase";
import type {
  CreditCardRepository,
  TransactionRepository,
  WalletRepository,
} from "@/core/application/ports/financialRepositories";

function makeSut() {
  const transactionRepository: TransactionRepository = {
    listByUserOrderedDesc: jest.fn(),
    create: jest.fn(),
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

  const runInTransactionMock = jest.fn(async (operation: () => Promise<unknown>) => operation());
  const runInTransaction = <T>(operation: () => Promise<T>) => {
    return runInTransactionMock(operation) as Promise<T>;
  };

  const efetivateTransaction = makeEfetivateTransactionUseCase({
    transactionRepository,
    walletRepository,
    creditCardRepository,
    runInTransaction,
  });

  const validInput: EfetivateTransactionInput = {
    id: "tx-id",
    userId: "user-id",
    walletId: "wallet-id",
    type: "entrada",
    status: "pendente",
    description: "Pagamento",
    date: "2026-05-24",
    value: 300,
    isCreditCard: false,
    creditCardId: undefined,
  };

  return {
    efetivateTransaction,
    transactionRepository,
    walletRepository,
    creditCardRepository,
    runInTransactionMock,
    validInput,
  };
}

describe("makeEfetivateTransactionUseCase", () => {
  it("deve efetivar transacao pendente e atualizar saldo da carteira", async () => {
    const {
      efetivateTransaction,
      transactionRepository,
      walletRepository,
      runInTransactionMock,
      validInput,
    } = makeSut();

    (walletRepository.getById as jest.Mock).mockResolvedValue({
      id: "wallet-id",
      userId: "user-id",
      name: "Carteira principal",
      balance: 100,
      currency: "BRL",
    });

    await efetivateTransaction(validInput);

    expect(runInTransactionMock).toHaveBeenCalledTimes(1);
    expect(transactionRepository.efetivate).toHaveBeenCalledWith("tx-id");
    expect(walletRepository.updateBalance).toHaveBeenCalledWith("wallet-id", 400);
  });

  it("deve falhar quando transacao ja estiver efetivada", async () => {
    const { efetivateTransaction, transactionRepository, walletRepository, validInput } = makeSut();

    await expect(efetivateTransaction({ ...validInput, status: "efetivada" })).rejects.toThrow(
      "Transação já efetivada.",
    );

    expect(transactionRepository.efetivate).not.toHaveBeenCalled();
    expect(walletRepository.updateBalance).not.toHaveBeenCalled();
  });

  it("deve falhar quando carteira nao for encontrada", async () => {
    const { efetivateTransaction, walletRepository, validInput } = makeSut();

    (walletRepository.getById as jest.Mock).mockResolvedValue(undefined);

    await expect(efetivateTransaction(validInput)).rejects.toThrow("Carteira não encontrada.");
    expect(walletRepository.updateBalance).not.toHaveBeenCalled();
  });

  it("deve efetivar transacao de cartao e atualizar limite do cartao", async () => {
    const { efetivateTransaction, walletRepository, creditCardRepository, validInput } = makeSut();

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
      limitUsed: 400,
      closingDay: 10,
      dueDay: 20,
      remainingLimit: 1600,
    });

    await efetivateTransaction({
      ...validInput,
      type: "saida",
      isCreditCard: true,
      creditCardId: "card-id",
      value: 250,
    });

    expect(creditCardRepository.updateRemainingLimit).toHaveBeenCalledWith("card-id", 1350);
    expect(creditCardRepository.updateUsedLimit).toHaveBeenCalledWith("card-id", 650);
    expect(walletRepository.updateBalance).toHaveBeenCalledWith("wallet-id", 750);
  });

  it("deve falhar quando transacao de cartao nao informar creditCardId", async () => {
    const { efetivateTransaction, walletRepository, transactionRepository, validInput } = makeSut();

    (walletRepository.getById as jest.Mock).mockResolvedValue({
      id: "wallet-id",
      userId: "user-id",
      name: "Carteira principal",
      balance: 1000,
      currency: "BRL",
    });

    await expect(
      efetivateTransaction({
        ...validInput,
        type: "saida",
        isCreditCard: true,
        creditCardId: undefined,
      }),
    ).rejects.toThrow("Transacao de cartao exige creditCardId.");
    expect(transactionRepository.efetivate).not.toHaveBeenCalled();
    expect(walletRepository.getById).not.toHaveBeenCalled();
  });

  it("deve falhar quando cartao de credito nao for encontrado", async () => {
    const { efetivateTransaction, walletRepository, creditCardRepository, validInput } = makeSut();

    (walletRepository.getById as jest.Mock).mockResolvedValue({
      id: "wallet-id",
      userId: "user-id",
      name: "Carteira principal",
      balance: 1000,
      currency: "BRL",
    });
    (creditCardRepository.getById as jest.Mock).mockResolvedValue(undefined);

    await expect(
      efetivateTransaction({
        ...validInput,
        type: "saida",
        isCreditCard: true,
        creditCardId: "card-id",
      }),
    ).rejects.toThrow("Cartão de crédito não encontrado.");
    expect(walletRepository.updateBalance).not.toHaveBeenCalled();
  });
});
