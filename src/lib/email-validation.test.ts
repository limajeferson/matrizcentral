import { describe, expect, it } from "vitest";
import { isValidEmail } from "@/lib/email-validation";

describe("isValidEmail", () => {
  it("aceita e-mails válidos", () => {
    expect(isValidEmail("ana@exemplo.com")).toBe(true);
    expect(isValidEmail("j.silva+news@sub.dominio.com.br")).toBe(true);
  });

  it("rejeita e-mails inválidos", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("semarroba.com")).toBe(false);
    expect(isValidEmail("a@b")).toBe(false);
    expect(isValidEmail("a @b.com")).toBe(false);
    expect(isValidEmail("a@b.com ")).toBe(false);
  });
});
