import {
  formatCurrencyBRL,
  formatDateBR,
  getStatusLabel,
  getTransactionTypeLabel,
} from "@/lib/format";

describe("format", () => {
  it("deve formatar moeda para BRL", () => {
    expect(formatCurrencyBRL(1234.56)).toContain("R$");
  });

  it("deve formatar data no formato brasileiro quando entrada for YYYY-MM-DD", () => {
    expect(formatDateBR("2026-05-24")).toBe("24/05/2026");
  });

  it("deve formatar label de tipo da transacao", () => {
    expect(getTransactionTypeLabel("entrada")).toBe("Entrada");
    expect(getTransactionTypeLabel("saida")).toBe("Saída");
  });

  it("deve formatar label de status da transacao", () => {
    expect(getStatusLabel("efetivada")).toBe("Efetivada");
    expect(getStatusLabel("pendente")).toBe("Pendente");
  });
});
