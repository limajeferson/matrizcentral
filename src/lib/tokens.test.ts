import { describe, expect, it } from "vitest";
import {
  generateToken,
  tokenAccessExpiry,
  refundWindowExpiry,
  isTokenExpired,
} from "./tokens";

describe("generateToken", () => {
  it("gera um token de 10 caracteres alfanuméricos maiúsculos", () => {
    const token = generateToken();
    expect(token).toMatch(/^[0-9A-Z]{10}$/);
  });

  it("gera tokens diferentes em chamadas sucessivas", () => {
    const tokens = new Set(Array.from({ length: 50 }, () => generateToken()));
    expect(tokens.size).toBe(50);
  });
});

describe("tokenAccessExpiry", () => {
  it("retorna uma data 365 dias no futuro", () => {
    const from = new Date("2026-01-01T00:00:00.000Z");
    const expiry = tokenAccessExpiry(from);
    const diffDays = (expiry.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBe(365);
  });
});

describe("refundWindowExpiry", () => {
  it("retorna uma data 30 dias no futuro", () => {
    const from = new Date("2026-01-01T00:00:00.000Z");
    const expiry = refundWindowExpiry(from);
    const diffDays = (expiry.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBe(30);
  });
});

describe("isTokenExpired", () => {
  it("retorna true para data no passado", () => {
    expect(isTokenExpired("2020-01-01T00:00:00.000Z")).toBe(true);
  });

  it("retorna false para data no futuro", () => {
    const future = new Date(Date.now() + 1000 * 60 * 60 * 24 * 10);
    expect(isTokenExpired(future)).toBe(false);
  });
});
