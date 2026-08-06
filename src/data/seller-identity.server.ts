import { buildSellerIdentity, type SellerIdentity } from "@/data/legal";

/**
 * Módulo server-only: separado de `legal.ts` porque `legal.ts` é importado
 * por client components (OfferPricing, ContatoForm) e o Next.js troca env
 * sem NEXT_PUBLIC_ por `undefined` no bundle do cliente. Aqui, e só aqui,
 * lemos `process.env` de verdade para montar os campos sensíveis (nome
 * civil, CPF, endereço) exigidos pelo Decreto 7.962/2013, art. 2º.
 *
 * Não usa o pacote `server-only` (custo zero, sem dependência nova) — a
 * guarda de runtime abaixo cumpre o mesmo papel.
 */
export function getSellerIdentity(): SellerIdentity {
  if (typeof window !== "undefined") {
    throw new Error(
      "seller-identity.server.ts é server-only: não importe getSellerIdentity() em client components."
    );
  }

  return buildSellerIdentity(process.env);
}
