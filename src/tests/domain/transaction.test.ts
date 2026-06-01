import { Transaction } from "@/core/domain/entities/transaction";

describe("Transaction", () => {
  const baseInput = {
    id: "tx-id",
    userId: "user-id",
    walletId: "wallet-id",
    type: "entrada" as const,
    status: "pendente" as const,
    description: " Salario ",
    date: "2026-05-24",
    value: 100,
    isCreditCard: false,
    creditCardId: undefined,
  };

  it("deve normalizar descricao vazia para valor padrao", () => {
    const transaction = Transaction.create({
      ...baseInput,
      description: "   ",
    });

    expect(transaction.description).toBe("Sem descrição");
  });

  it("deve limpar creditCardId quando nao for compra de cartao", () => {
    const transaction = Transaction.create({
      ...baseInput,
      creditCardId: "card-id",
    });

    expect(transaction.creditCardId).toBeUndefined();
  });

  it("deve falhar quando walletId nao for informado", () => {
    expect(() =>
      Transaction.create({
        ...baseInput,
        walletId: "",
      }),
    ).toThrow("Selecione uma carteira.");
  });

  it("deve falhar quando valor for menor ou igual a zero", () => {
    expect(() =>
      Transaction.create({
        ...baseInput,
        value: 0,
      }),
    ).toThrow("O valor deve ser maior que zero.");
  });

  it("deve falhar quando transacao de cartao nao tiver creditCardId", () => {
    expect(() =>
      Transaction.create({
        ...baseInput,
        type: "saida",
        isCreditCard: true,
        creditCardId: undefined,
      }),
    ).toThrow("Transacao de cartao exige creditCardId.");
  });

  it("deve falhar quando transacao de cartao nao for do tipo saida", () => {
    expect(() =>
      Transaction.create({
        ...baseInput,
        type: "entrada",
        isCreditCard: true,
        creditCardId: "card-id",
      }),
    ).toThrow("Transacao de cartao deve ser do tipo saida.");
  });

  it("deve efetivar transacao pendente", () => {
    const transaction = Transaction.create(baseInput);

    transaction.effectivate();

    expect(transaction.isEffectivated()).toBe(true);
    expect(transaction.isPending()).toBe(false);
    expect(transaction.status).toBe("efetivada");
  });

  it("deve falhar ao efetivar transacao ja efetivada", () => {
    const transaction = Transaction.rehydrate({
      ...baseInput,
      status: "efetivada",
      description: "Pagamento",
    });

    expect(() => transaction.effectivate()).toThrow("Transação já efetivada.");
  });
});
