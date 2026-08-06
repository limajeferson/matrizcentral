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
 * Campos sensíveis (nome civil, CPF, endereço) NÃO moram aqui — este módulo
 * é importado por client components (OfferPricing, ContatoForm) e o Next.js
 * troca env sem NEXT_PUBLIC_ por `undefined` no bundle do cliente. Por isso
 * a montagem é uma função pura que recebe o env por parâmetro: quem lê
 * `process.env` de verdade é `seller-identity.server.ts` (server-only).
 */
export function buildSellerIdentity(env: Record<string, string | undefined>): SellerIdentity {
  const pick = (v: string | undefined): string => {
    const trimmed = v?.trim();
    return trimmed ? trimmed : IDENTITY_PLACEHOLDER;
  };

  return {
    legalName: pick(env.MC_SELLER_LEGAL_NAME),
    taxIdLabel: SELLER.taxIdLabel,
    taxId: pick(env.MC_SELLER_TAX_ID),
    address: pick(env.MC_SELLER_ADDRESS),
    email: SELLER.email,
    supportResponseDays: SELLER.supportResponseDays,
    accessReleaseText: SELLER.accessReleaseText,
  };
}

/**
 * Campos NÃO sensíveis da identificação do fornecedor (Decreto 7.962/2013,
 * art. 2º). Nome civil, CPF e endereço ficam de fora de propósito: vivem em
 * variável de ambiente de servidor (ver seller-identity.server.ts) porque
 * este arquivo é importado por client components e não pode ler
 * `process.env` sem vazar `undefined` no bundle do cliente.
 */
export const SELLER: Pick<
  SellerIdentity,
  "taxIdLabel" | "email" | "supportResponseDays" | "accessReleaseText"
> = {
  taxIdLabel: "CPF",
  email: "contato@matrizcentral.com.br",
  supportResponseDays: 5,
  accessReleaseText: "imediatamente após a confirmação do pagamento",
};
