import { describe, expect, it } from "vitest";
import { FOCUSABLE_SELECTOR, nextFocusIndex } from "./use-focus-trap";

describe("nextFocusIndex", () => {
  it("avança um item para frente", () => {
    expect(nextFocusIndex(0, 3, 1)).toBe(1);
    expect(nextFocusIndex(1, 3, 1)).toBe(2);
  });

  it("volta um item para trás", () => {
    expect(nextFocusIndex(2, 3, -1)).toBe(1);
    expect(nextFocusIndex(1, 3, -1)).toBe(0);
  });

  it("circula do último para o primeiro", () => {
    expect(nextFocusIndex(2, 3, 1)).toBe(0);
  });

  it("circula do primeiro para o último", () => {
    expect(nextFocusIndex(0, 3, -1)).toBe(2);
  });

  it("entra pela primeira posição quando nada está focado e vai para frente", () => {
    expect(nextFocusIndex(-1, 3, 1)).toBe(0);
  });

  it("entra pela última posição quando nada está focado e vai para trás", () => {
    expect(nextFocusIndex(-1, 3, -1)).toBe(2);
  });

  it("trata índice fora do intervalo como 'nada focado'", () => {
    expect(nextFocusIndex(9, 3, 1)).toBe(0);
    expect(nextFocusIndex(9, 3, -1)).toBe(2);
  });

  it("devolve -1 para lista vazia", () => {
    expect(nextFocusIndex(0, 0, 1)).toBe(-1);
    expect(nextFocusIndex(-1, 0, -1)).toBe(-1);
  });

  it("funciona com um único item (fica nele)", () => {
    expect(nextFocusIndex(0, 1, 1)).toBe(0);
    expect(nextFocusIndex(0, 1, -1)).toBe(0);
  });
});

describe("FOCUSABLE_SELECTOR", () => {
  it("exclui botões desabilitados e tabindex -1", () => {
    expect(FOCUSABLE_SELECTOR).toContain("button:not([disabled])");
    expect(FOCUSABLE_SELECTOR).toContain('[tabindex]:not([tabindex="-1"])');
  });

  it("inclui links, campos e o próprio tabindex", () => {
    expect(FOCUSABLE_SELECTOR).toContain("a[href]");
    expect(FOCUSABLE_SELECTOR).toContain("input:not([disabled])");
    expect(FOCUSABLE_SELECTOR).toContain("textarea:not([disabled])");
  });
});
