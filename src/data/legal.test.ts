import { describe, expect, it } from "vitest";
import {
  IDENTITY_PLACEHOLDER,
  buildSellerIdentity,
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

describe("buildSellerIdentity", () => {
  const fullEnv = {
    MC_SELLER_LEGAL_NAME: "Fulano de Tal",
    MC_SELLER_TAX_ID: "000.000.000-00",
    MC_SELLER_ADDRESS: "Rua X, 1 — Cidade/UF — CEP 00000-000",
  };

  it("monta a identidade a partir de um env completo", () => {
    const identity = buildSellerIdentity(fullEnv);
    expect(identity.legalName).toBe("Fulano de Tal");
    expect(identity.taxId).toBe("000.000.000-00");
    expect(identity.address).toBe("Rua X, 1 — Cidade/UF — CEP 00000-000");
  });

  it("cai no placeholder quando falta uma variavel", () => {
    const identity = buildSellerIdentity({
      MC_SELLER_LEGAL_NAME: "Fulano de Tal",
      MC_SELLER_ADDRESS: "Rua X, 1 — Cidade/UF — CEP 00000-000",
    });
    expect(identity.taxId).toBe(IDENTITY_PLACEHOLDER);
  });

  it("cai no placeholder quando a variavel esta vazia ou so com espacos", () => {
    const identity = buildSellerIdentity({
      ...fullEnv,
      MC_SELLER_LEGAL_NAME: "   ",
    });
    expect(identity.legalName).toBe(IDENTITY_PLACEHOLDER);
  });

  it("env completo alimenta isIdentityComplete como true", () => {
    expect(isIdentityComplete(buildSellerIdentity(fullEnv))).toBe(true);
  });

  it("env incompleto alimenta isIdentityComplete como false", () => {
    expect(isIdentityComplete(buildSellerIdentity({}))).toBe(false);
  });
});
