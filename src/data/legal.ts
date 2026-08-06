export interface SellerIdentity {
  /** Razão social (PJ) ou nome civil completo (PF). */
  legalName: string;
  taxIdLabel: "CNPJ" | "CPF";
  taxId: string;
  /** Endereço físico completo: logradouro, número, cidade/UF, CEP. */
  address: string;
  email: string;
  /** Prazo máximo de resposta do suporte, em dias (Decreto 7.962, art. 4º, I). */
  supportResponseDays: number;
  /** Quando o acesso é liberado (Decreto 7.962, art. 2º, VI). */
  accessReleaseText: string;
}

/**
 * Sentinela para campo que depende do usuário. Escolhido para ser
 * IMPOSSÍVEL de confundir com dado real se vazar para a tela.
 */
export const IDENTITY_PLACEHOLDER = "__PREENCHER__";

const IDENTITY_REQUIRED: (keyof SellerIdentity)[] = [
  "legalName",
  "taxId",
  "address",
  "email",
];

export function missingIdentityFields(s: SellerIdentity): string[] {
  return IDENTITY_REQUIRED.filter((k) => {
    const v = s[k];
    return typeof v !== "string" || v.trim() === "" || v === IDENTITY_PLACEHOLDER;
  });
}

export function isIdentityComplete(s: SellerIdentity): boolean {
  return missingIdentityFields(s).length === 0;
}

/**
 * 🔒 DEPENDE DO USUÁRIO: legalName, taxId e address.
 * O Claude não preenche esses campos — são dados pessoais/cadastrais reais.
 * Enquanto estiverem com IDENTITY_PLACEHOLDER, o bloco de identificação
 * NÃO é renderizado (ver SellerIdentityBlock, Task 5) — melhor não exibir
 * do que exibir identificação falsa.
 */
export const SELLER: SellerIdentity = {
  legalName: IDENTITY_PLACEHOLDER,
  taxIdLabel: "CPF",
  taxId: IDENTITY_PLACEHOLDER,
  address: IDENTITY_PLACEHOLDER,
  email: "contato@matrizcentral.com.br",
  supportResponseDays: 5,
  accessReleaseText: "imediatamente após a confirmação do pagamento",
};
