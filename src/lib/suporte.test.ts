import { describe, it, expect } from "vitest";
import { validateContactInput } from "./suporte";

describe("validateContactInput", () => {
  it("e-mail inválido → erro", () => expect(validateContactInput({ email: "x", message: "mensagem longa o suficiente" }).ok).toBe(false));
  it("mensagem curta → erro", () => expect(validateContactInput({ email: "a@b.com", message: "oi" }).ok).toBe(false));
  it("válido → ok", () => expect(validateContactInput({ email: "a@b.com", message: "preciso de ajuda com o acesso" }).ok).toBe(true));
});
