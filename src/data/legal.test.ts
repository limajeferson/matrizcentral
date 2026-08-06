import { describe, expect, it } from "vitest";
import {
  IDENTITY_PLACEHOLDER,
  isIdentityComplete,
  missingIdentityFields,
  type SellerIdentity,
} from "./legal";

const base: SellerIdentity = {
  legalName: "Fulano de Tal",
  taxIdLabel: "CPF",
  taxId: "000.000.000-00",
  address: "Rua X, 1 — Cidade/UF — CEP 00000-000",
  email: "contato@matrizcentral.com.br",
  supportResponseDays: 5,
  accessReleaseText: "imediatamente após a confirmação do pagamento",
};

describe("isIdentityComplete", () => {
  it("aceita identidade totalmente preenchida", () => {
    expect(isIdentityComplete(base)).toBe(true);
  });

  it("rejeita quando um campo esta com o placeholder", () => {
    expect(isIdentityComplete({ ...base, taxId: IDENTITY_PLACEHOLDER })).toBe(false);
  });

  it("rejeita campo vazio ou so com espacos", () => {
    expect(isIdentityComplete({ ...base, address: "   " })).toBe(false);
  });
});

describe("missingIdentityFields", () => {
  it("lista os campos pendentes pelo nome", () => {
    const r = missingIdentityFields({
      ...base,
      legalName: IDENTITY_PLACEHOLDER,
      address: "",
    });
    expect(r).toEqual(["legalName", "address"]);
  });

  it("devolve lista vazia quando esta tudo preenchido", () => {
    expect(missingIdentityFields(base)).toEqual([]);
  });
});
