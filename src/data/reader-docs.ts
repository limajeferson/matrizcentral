import { CONTENT_HUB } from "./content-hub";

/**
 * `product_id` gravados em `purchases` pelo webhook da Stripe (ver `PLANOS`
 * em `src/lib/stripe.ts`, que IMPORTA estas constantes daqui — não o
 * contrário). Este arquivo é dado puro e não pode importar `@/lib/stripe`:
 * esse módulo instancia `new Stripe(process.env.STRIPE_SECRET_KEY!)` no topo,
 * o que já causa falha de build ao coletar `/api/checkout` (ver CLAUDE.md).
 * Fonte única: mudar aqui já propaga para o checkout/webhook via stripe.ts.
 */
export const EBOOK_PRODUCT_ID = "ebook_llm_local";
export const REGULAR_PASS_PRODUCT_ID = "regular_pass";
export const ADVANCED_PASS_PRODUCT_ID = "advanced_pass";

/**
 * Passes vendem "Tudo do Start" (ver `OfferPricing.tsx`), ou seja, incluem o
 * ebook — mesmo comprados direto, sem compra prévia do Start. Por isso
 * `canRead` libera o ebook também para quem tem um passe pago, além de quem
 * comprou o ebook avulso.
 */
export const PASS_PRODUCT_IDS: ReadonlySet<string> = new Set([
  REGULAR_PASS_PRODUCT_ID,
  ADVANCED_PASS_PRODUCT_ID,
]);

export type ReaderDoc = {
  slug: string;
  contentId: string;
  title: string;
  /** Caminho relativo à raiz do projeto. */
  bodyPath: string;
  kind: "ebook" | "relatorio";
  /** true = incluído no nível "view" (qualquer comprador). */
  startIncluded: boolean;
};

const EBOOK: ReaderDoc = {
  slug: "guia-llm-local",
  contentId: "ebook-llm-local",
  title: "Guia Prático de LLMs Locais",
  bodyPath: "content/ebooks/ebook_llm_local_matrizcentral.md",
  kind: "ebook",
  startIncluded: true, // era o entregável do R$47 (antes via download)
};

const RELATORIOS: ReaderDoc[] = CONTENT_HUB.filter(
  (c): c is typeof c & { bodyPath: string } => c.type === "relatorio" && !!c.bodyPath,
).map((c) => ({
  slug: c.id,
  contentId: c.id,
  title: c.title,
  bodyPath: c.bodyPath,
  kind: "relatorio" as const,
  startIncluded: c.startIncluded === true,
}));

export const READER_DOCS: ReaderDoc[] = [EBOOK, ...RELATORIOS];

export function findDoc(slug: string): ReaderDoc | undefined {
  return READER_DOCS.find((d) => d.slug === slug);
}

/** Mesmo registro, chave por `contentId` — usado por rotas que recebem o
 *  contentId direto (ex.: `/api/leitura`) em vez do slug da URL do leitor. */
export function findDocByContentId(contentId: string): ReaderDoc | undefined {
  return READER_DOCS.find((d) => d.contentId === contentId);
}

/** Ids válidos para o livro-razão de leitura (impede poluir `reading_events`). */
export const READER_CONTENT_IDS: ReadonlySet<string> = new Set(
  READER_DOCS.map((d) => d.contentId),
);
