import {
  makeEfetivateTransactionUseCase,
  type EfetivateTransactionInput,
} from "@/core/application/useCases/transaction/efetivateTransactionUseCase";
import type {
  TransactionRepository,
  WalletRepository,
} from "@/core/application/ports/financialRepositories";

function makeSut() {
  const transactionRepository: TransactionRepository = {
    listByUserOrderedDesc: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    efetivate: jest.fn(),
  };

  const walletRepository: WalletRepository = {
    listByUser: jest.fn(),
    getMainByUser: jest.fn(),
    getById: jest.fn(),
    updateBalance: jest.fn(),
  };

  const runInTransactionMock = jest.fn(async (operation: () => Promise<unknown>) => operation());
  const runInTransaction = <T>(operation: () => Promise<T>) => {
    return runInTransactionMock(operation) as Promise<T>;
  };

  const efetivateTransaction = makeEfetivateTransactionUseCase({
    transactionRepository,
    walletRepository,
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
  };

  return {
    efetivateTransaction,
    transactionRepository,
    walletRepository,
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
});
