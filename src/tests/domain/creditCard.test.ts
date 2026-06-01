import { CreditCard } from "@/core/domain/entities/creditCard";

describe("CreditCard", () => {
  const baseCard = {
    id: "card-id",
    userId: "user-id",
    walletId: "wallet-id",
    name: "Cartao",
    brand: "Visa",
    limit: 2000,
    closingDay: 10,
    dueDay: 20,
    limitUsed: 500,
    remainingLimit: 1500,
  };

  it("deve aplicar compra e recalcular limites", () => {
    const card = CreditCard.create(baseCard);

    card.applyPurchase(200);

    expect(card.limitUsed).toBe(700);
    expect(card.remainingLimit).toBe(1300);
  });

  it("deve reverter compra e recalcular limites", () => {
    const card = CreditCard.create(baseCard);

    card.revertPurchase(300);

    expect(card.limitUsed).toBe(200);
    expect(card.remainingLimit).toBe(1800);
  });

  it("deve falhar quando compra passar do limite restante", () => {
    const card = CreditCard.create(baseCard);

    expect(() => card.applyPurchase(2000)).toThrow(
      "O valor da transação não pode ser maior que o limite restante do cartão.",
    );
  });

  it("deve falhar quando reversao passar do limite usado", () => {
    const card = CreditCard.create(baseCard);

    expect(() => card.revertPurchase(600)).toThrow(
      "O valor da reversão não pode ser maior que o limite utilizado.",
    );
  });

  it("deve falhar quando closingDay for igual ao dueDay", () => {
    expect(() =>
      CreditCard.create({
        ...baseCard,
        closingDay: 20,
        dueDay: 20,
      }),
    ).toThrow("O dia de fechamento e o dia de vencimento não podem ser o mesmo dia.");
  });

  it("deve falhar quando limite usado for maior que limite", () => {
    expect(() =>
      CreditCard.create({
        ...baseCard,
        limitUsed: 2500,
      }),
    ).toThrow("O limite utilizado não pode ser maior que o limite do cartão.");
  });
});
