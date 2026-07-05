import { describe, expect, it } from "vitest";
import {
  MONTHLY_AI_SUBSCRIPTIONS_BRL,
  annualSpendBRL,
  formatBRL,
} from "@/lib/annual-spend";

describe("annual-spend", () => {
  it("calcula o gasto anual a partir do mensal padrão", () => {
    expect(annualSpendBRL()).toBe(MONTHLY_AI_SUBSCRIPTIONS_BRL * 12);
  });

  it("aceita mensal customizado", () => {
    expect(annualSpendBRL(100)).toBe(1200);
  });

  it("formata em BRL sem centavos", () => {
    const formatted = formatBRL(2640);
    expect(formatted).toContain("R$");
    expect(formatted).toContain("2.640");
    expect(formatted).not.toContain(",00");
  });
});
