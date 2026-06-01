import { Wallet } from "@/core/domain/entities/wallet";

describe("Wallet", () => {
  const baseWallet = {
    id: "wallet-id",
    userId: "user-id",
    name: "Carteira principal",
    balance: 1000,
    currency: "BRL" as const,
  };

  it("deve somar saldo ao aplicar entrada", () => {
    const wallet = Wallet.rehydrate(baseWallet);

    wallet.applyTransaction({ type: "entrada", value: 250 });

    expect(wallet.balance).toBe(1250);
  });

  it("deve subtrair saldo ao aplicar saida", () => {
    const wallet = Wallet.rehydrate(baseWallet);

    wallet.applyTransaction({ type: "saida", value: 400 });

    expect(wallet.balance).toBe(600);
  });

  it("deve reverter entrada subtraindo saldo", () => {
    const wallet = Wallet.rehydrate(baseWallet);

    wallet.revertTransaction({ type: "entrada", value: 200 });

    expect(wallet.balance).toBe(800);
  });

  it("deve reverter saida somando saldo", () => {
    const wallet = Wallet.rehydrate(baseWallet);

    wallet.revertTransaction({ type: "saida", value: 300 });

    expect(wallet.balance).toBe(1300);
  });

  it("deve falhar quando valor for invalido", () => {
    const wallet = Wallet.rehydrate(baseWallet);

    expect(() => wallet.applyTransaction({ type: "entrada", value: 0 })).toThrow(
      "O valor deve ser maior que zero.",
    );
  });

  it("deve falhar ao reidratar carteira sem usuario", () => {
    expect(() =>
      Wallet.rehydrate({
        ...baseWallet,
        userId: "",
      }),
    ).toThrow("Usuário da carteira é obrigatório.");
  });
});
