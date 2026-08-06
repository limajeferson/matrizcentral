import { describe, it, expect } from "vitest";
import { formatBrlFromCents, purchaseSummaryBlock } from "./email";

describe("formatBrlFromCents", () => {
  it("formata centavos em BRL com separador de milhar", () => {
    expect(formatBrlFromCents(4700)).toBe("R$ 47,00");
    expect(formatBrlFromCents(129990)).toBe("R$ 1.299,90");
    expect(formatBrlFromCents(123456789)).toBe("R$ 1.234.567,89");
  });

  it("preserva os centavos com zero à esquerda", () => {
    expect(formatBrlFromCents(105)).toBe("R$ 1,05");
    expect(formatBrlFromCents(5)).toBe("R$ 0,05");
  });

  it("retorna null quando não há valor confiável (nunca imprime algo errado)", () => {
    expect(formatBrlFromCents(null)).toBeNull();
    expect(formatBrlFromCents(undefined)).toBeNull();
    expect(formatBrlFromCents(Number.NaN)).toBeNull();
  });

  it("zero é valor válido (cupom de 100%), não ausência de valor", () => {
    expect(formatBrlFromCents(0)).toBe("R$ 0,00");
  });
});

describe("purchaseSummaryBlock", () => {
  const SITE = "https://www.matrizcentral.com.br";

  it("inclui o valor pago quando o amount_total é conhecido", () => {
    const html = purchaseSummaryBlock("acesso à Matriz Central", 4700, SITE);
    expect(html).toContain("Valor pago: R$ 47,00.");
  });

  it("omite a linha do valor quando o amount_total vem nulo", () => {
    const html = purchaseSummaryBlock("acesso à Matriz Central", null, SITE);
    expect(html).not.toContain("Valor pago");
    expect(html).toContain("Item adquirido");
  });

  it("traz a condicionante dos dias 8 a 30, alinhada com os Termos", () => {
    const html = purchaseSummaryBlock("acesso à Matriz Central", 4700, SITE);
    expect(html).toContain("7 primeiros dias");
    expect(html).toContain("sem precisar justificar");
    expect(html).toMatch(/8º ao 30º dia/);
  });

  it("linka os termos com a URL absoluta do site", () => {
    expect(purchaseSummaryBlock("x", 100, SITE)).toContain(
      `${SITE}/legal/termos#garantia`
    );
  });

  it("sem URL base, some o link em vez de sair 'undefined/legal/termos'", () => {
    const html = purchaseSummaryBlock("x", 100, undefined);
    expect(html).not.toContain("undefined");
    expect(html).not.toContain("Condições completas");
    expect(html).toContain("Item adquirido: x.");
  });
});
