import { describe, it, expect } from "vitest";
import {
  generateAuthSecret,
  hashAuthSecret,
  magicLinkExpiry,
  sessionExpiry,
  isExpired,
} from "./auth-tokens";

describe("generateAuthSecret", () => {
  it("gera base64url de 43 chars", () => {
    expect(generateAuthSecret()).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });
  it("gera valores únicos", () => {
    const set = new Set(Array.from({ length: 200 }, () => generateAuthSecret()));
    expect(set.size).toBe(200);
  });
});

describe("hashAuthSecret", () => {
  it("é determinístico e hex de 64 chars", () => {
    const h = hashAuthSecret("abc");
    expect(h).toBe(hashAuthSecret("abc"));
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });
  it("muda com input diferente", () => {
    expect(hashAuthSecret("abc")).not.toBe(hashAuthSecret("abd"));
  });
});

describe("expiração", () => {
  const base = new Date("2026-01-01T00:00:00.000Z");
  it("magicLinkExpiry = base + 15 min", () => {
    expect(magicLinkExpiry(base).toISOString()).toBe("2026-01-01T00:15:00.000Z");
  });
  it("sessionExpiry = base + 30 dias", () => {
    expect(sessionExpiry(base).toISOString()).toBe("2026-01-31T00:00:00.000Z");
  });
});

describe("isExpired", () => {
  const now = new Date("2026-01-01T00:00:00.000Z");
  it("true no passado", () => {
    expect(isExpired("2025-12-31T23:59:59.000Z", now)).toBe(true);
  });
  it("false no futuro", () => {
    expect(isExpired("2026-01-01T00:00:01.000Z", now)).toBe(false);
  });
});
