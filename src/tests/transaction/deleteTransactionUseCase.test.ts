import {
  makeDeleteTransactionUseCase,
  type DeleteTransactionInput,
} from "@/core/application/useCases/transaction/deleteTransactionUseCase";
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

  const deleteTransaction = makeDeleteTransactionUseCase({
    transactionRepository,
    walletRepository,
    creditCardRepository,
    runInTransaction,
  });

  const validInput: DeleteTransactionInput = {
    id: "tx-id",
    userId: "user-id",
    walletId: "wallet-id",
    type: "saida",
    status: "efetivada",
    description: "Conta de luz",
    date: "2026-05-24",
    value: 200,
    isCreditCard: false,
    creditCardId: undefined,
  };

  return {
    deleteTransaction,
    transactionRepository,
    walletRepository,
    creditCardRepository,
    runInTransactionMock,
    validInput,
  };
}

describe("makeDeleteTransactionUseCase", () => {
  it("deve remover transacao efetivada e reverter saldo da carteira", async () => {
    const {
      deleteTransaction,
      transactionRepository,
      walletRepository,
      runInTransactionMock,
      validInput,
    } = makeSut();

    (walletRepository.getById as jest.Mock).mockResolvedValue({
      id: "wallet-id",
      userId: "user-id",
      name: "Carteira principal",
      balance: 1000,
      currency: "BRL",
    });

    await deleteTransaction(validInput);

    expect(runInTransactionMock).toHaveBeenCalledTimes(1);
    expect(transactionRepository.delete).toHaveBeenCalledWith("tx-id");
    expect(walletRepository.updateBalance).toHaveBeenCalledWith("wallet-id", 1200);
  });

  it("nao deve atualizar saldo ao remover transacao pendente", async () => {
    const { deleteTransaction, transactionRepository, walletRepository, validInput } = makeSut();

    await deleteTransaction({ ...validInput, status: "pendente" });

    expect(transactionRepository.delete).toHaveBeenCalledWith("tx-id");
    expect(walletRepository.getById).not.toHaveBeenCalled();
    expect(walletRepository.updateBalance).not.toHaveBeenCalled();
  });

  it("deve falhar quando carteira nao for encontrada", async () => {
    const { deleteTransaction, walletRepository, validInput } = makeSut();

    (walletRepository.getById as jest.Mock).mockResolvedValue(undefined);

    await expect(deleteTransaction(validInput)).rejects.toThrow("Carteira não encontrada.");
    expect(walletRepository.updateBalance).not.toHaveBeenCalled();
  });

  it("deve remover transacao de cartao e reverter limite usado", async () => {
    const { deleteTransaction, walletRepository, creditCardRepository, validInput } = makeSut();

    (walletRepository.getById as jest.Mock).mockResolvedValue({
      id: "wallet-id",
      userId: "user-id",
      name: "Carteira principal",
      balance: 900,
      currency: "BRL",
    });
    (creditCardRepository.getById as jest.Mock).mockResolvedValue({
      id: "card-id",
      userId: "user-id",
      walletId: "wallet-id",
      name: "Card",
      brand: "Visa",
      limit: 2000,
      limitUsed: 700,
      closingDay: 10,
      dueDay: 20,
      remainingLimit: 1300,
    });

    await deleteTransaction({
      ...validInput,
      type: "saida",
      isCreditCard: true,
      creditCardId: "card-id",
      value: 200,
    });

    expect(creditCardRepository.updateUsedLimit).toHaveBeenCalledWith("card-id", 500);
    expect(creditCardRepository.updateRemainingLimit).toHaveBeenCalledWith("card-id", 1500);
    expect(walletRepository.updateBalance).toHaveBeenCalledWith("wallet-id", 1100);
  });

  it("deve falhar quando transacao de cartao nao informar creditCardId", async () => {
    const { deleteTransaction, walletRepository, transactionRepository, validInput } = makeSut();

    (walletRepository.getById as jest.Mock).mockResolvedValue({
      id: "wallet-id",
      userId: "user-id",
      name: "Carteira principal",
      balance: 900,
      currency: "BRL",
    });

    await expect(
      deleteTransaction({
        ...validInput,
        type: "saida",
        isCreditCard: true,
        creditCardId: undefined,
      }),
    ).rejects.toThrow("Transacao de cartao exige creditCardId.");
    expect(transactionRepository.delete).not.toHaveBeenCalled();
    expect(walletRepository.getById).not.toHaveBeenCalled();
  });

  it("deve falhar quando cartao de credito nao for encontrado", async () => {
    const { deleteTransaction, walletRepository, creditCardRepository, validInput } = makeSut();

    (walletRepository.getById as jest.Mock).mockResolvedValue({
      id: "wallet-id",
      userId: "user-id",
      name: "Carteira principal",
      balance: 900,
      currency: "BRL",
    });
    (creditCardRepository.getById as jest.Mock).mockResolvedValue(undefined);

    await expect(
      deleteTransaction({
        ...validInput,
        type: "saida",
        isCreditCard: true,
        creditCardId: "card-id",
      }),
    ).rejects.toThrow("Cartão de crédito não encontrado.");
    expect(walletRepository.updateBalance).not.toHaveBeenCalled();
  });
});
