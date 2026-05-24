import {
  makeCreateTransactionUseCase,
  type CreateTransactionInput,
} from "@/core/application/useCases/transaction/createTransactionUseCase";
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
  };

  const walletRepository: WalletRepository = {
    listByUser: jest.fn(),
    getMainByUser: jest.fn(),
    getById: jest.fn(),
    updateBalance: jest.fn(),
  };

  const creditCardRepository: CreditCardRepository = {
    listByUser: jest.fn(),
    create: jest.fn(),
    getById: jest.fn(),
    updateLimit: jest.fn(),
    updateUsedLimit: jest.fn(),
  };

  const runInTransactionMock = jest.fn(async (operation: () => Promise<unknown>) => operation());
  const runInTransaction = <T>(operation: () => Promise<T>) => {
    return runInTransactionMock(operation) as Promise<T>;
  };
  const generateId = jest.fn(() => "transaction-id");

  const createTransaction = makeCreateTransactionUseCase({
    transactionRepository,
    walletRepository,
    creditCardRepository,
    runInTransaction,
    generateId,
  });

  const validInput: CreateTransactionInput = {
    userId: "user-id",
    walletId: "wallet-id",
    type: "entrada",
    status: "efetivada",
    description: "  salario  ",
    date: "2026-05-24",
    value: 1000,
    isCreditCard: false,
    creditCardId: undefined,
  };

  return {
    createTransaction,
    transactionRepository,
    walletRepository,
    runInTransactionMock,
    generateId,
    validInput,
  };
}

describe("makeCreateTransactionUseCase", () => {
  it("deve criar transacao efetivada e atualizar saldo da carteira", async () => {
    const {
      createTransaction,
      transactionRepository,
      walletRepository,
      runInTransactionMock,
      generateId,
      validInput,
    } = makeSut();

    (walletRepository.getById as jest.Mock).mockResolvedValue({
      id: "wallet-id",
      userId: "user-id",
      name: "Carteira principal",
      balance: 500,
      currency: "BRL",
    });

    await createTransaction(validInput);

    expect(generateId).toHaveBeenCalledTimes(1);
    expect(runInTransactionMock).toHaveBeenCalledTimes(1);
    expect(transactionRepository.create).toHaveBeenCalledWith({
      id: "transaction-id",
      userId: validInput.userId,
      walletId: validInput.walletId,
      type: validInput.type,
      status: validInput.status,
      description: "salario",
      date: validInput.date,
      value: validInput.value,
      isCreditCard: validInput.isCreditCard,
      creditCardId: validInput.creditCardId,
    });
    expect(walletRepository.updateBalance).toHaveBeenCalledWith("wallet-id", 1500);
  });

  it("deve usar descricao padrao quando descricao vier vazia", async () => {
    const { createTransaction, transactionRepository, walletRepository, validInput } = makeSut();

    (walletRepository.getById as jest.Mock).mockResolvedValue({
      id: "wallet-id",
      userId: "user-id",
      name: "Carteira principal",
      balance: 100,
      currency: "BRL",
    });

    await createTransaction({ ...validInput, description: "   " });

    expect(transactionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ description: "Sem descrição" }),
    );
  });

  it("nao deve atualizar saldo quando transacao estiver pendente", async () => {
    const { createTransaction, transactionRepository, walletRepository, validInput } = makeSut();

    await createTransaction({ ...validInput, status: "pendente" });

    expect(transactionRepository.create).toHaveBeenCalledTimes(1);
    expect(walletRepository.getById).not.toHaveBeenCalled();
    expect(walletRepository.updateBalance).not.toHaveBeenCalled();
  });

  it("deve buscar carteira principal quando nao encontrar por id", async () => {
    const { createTransaction, walletRepository, validInput } = makeSut();

    (walletRepository.getById as jest.Mock).mockResolvedValue(undefined);
    (walletRepository.getMainByUser as jest.Mock).mockResolvedValue({
      id: "wallet-main",
      userId: "user-id",
      name: "Principal",
      balance: 100,
      currency: "BRL",
    });

    await createTransaction({ ...validInput, type: "saida", value: 50 });

    expect(walletRepository.getMainByUser).toHaveBeenCalledWith("user-id");
    expect(walletRepository.updateBalance).toHaveBeenCalledWith("wallet-main", 50);
  });

  it("deve falhar quando nao encontrar nenhuma carteira em transacao efetivada", async () => {
    const { createTransaction, walletRepository, validInput } = makeSut();

    (walletRepository.getById as jest.Mock).mockResolvedValue(undefined);
    (walletRepository.getMainByUser as jest.Mock).mockResolvedValue(undefined);

    await expect(createTransaction(validInput)).rejects.toThrow("Carteira não encontrada.");
    expect(walletRepository.updateBalance).not.toHaveBeenCalled();
  });

  it("deve falhar quando carteira nao for informada", async () => {
    const { createTransaction, validInput, transactionRepository } = makeSut();

    await expect(createTransaction({ ...validInput, walletId: "" })).rejects.toThrow(
      "Selecione uma carteira.",
    );
    expect(transactionRepository.create).not.toHaveBeenCalled();
  });

  it("deve falhar quando data nao for informada", async () => {
    const { createTransaction, validInput, transactionRepository } = makeSut();

    await expect(createTransaction({ ...validInput, date: "" })).rejects.toThrow(
      "Informe a data da movimentação.",
    );
    expect(transactionRepository.create).not.toHaveBeenCalled();
  });

  it("deve falhar quando valor for menor ou igual a zero", async () => {
    const { createTransaction, validInput, transactionRepository } = makeSut();

    await expect(createTransaction({ ...validInput, value: 0 })).rejects.toThrow(
      "O valor deve ser maior que zero.",
    );
    expect(transactionRepository.create).not.toHaveBeenCalled();
  });
});
