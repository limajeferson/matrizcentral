import { describe, it, expect } from "vitest";
import { safeNextPath } from "./safe-redirect";

describe("safeNextPath", () => {
  it("aceita path interno", () => {
    expect(safeNextPath("/conta")).toBe("/conta");
    expect(safeNextPath("/dashboard/ABC123")).toBe("/dashboard/ABC123");
  });
  it("usa fallback para nulo/vazio", () => {
    expect(safeNextPath(null)).toBe("/conta");
    expect(safeNextPath(undefined)).toBe("/conta");
    expect(safeNextPath("")).toBe("/conta");
  });
  it("rejeita destino externo", () => {
    expect(safeNextPath("https://evil.com")).toBe("/conta");
    expect(safeNextPath("//evil.com")).toBe("/conta");
    expect(safeNextPath("/\\evil.com")).toBe("/conta");
  });
  it("respeita fallback custom", () => {
    expect(safeNextPath(null, "/entrar")).toBe("/entrar");
  });
});
