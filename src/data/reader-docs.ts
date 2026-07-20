import { CONTENT_HUB } from "./content-hub";

/**
 * `product_id` gravado em `purchases` pelo webhook da Stripe para a compra do
 * ebook (ver `PRODUTO_1.productId` em `src/lib/stripe.ts` e o `metadata.product_id`
 * setado em `src/app/api/checkout/route.ts`). NÃO importar `@/lib/stripe` aqui:
 * esse módulo instancia `new Stripe(process.env.STRIPE_SECRET_KEY!)` no topo,
 * o que já causa falha de build ao coletar `/api/checkout` (ver CLAUDE.md) —
 * duplicar a constante evita esse acoplamento.
 */
export const EBOOK_PRODUCT_ID = "ebook_llm_local";

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

/** Ids válidos para o livro-razão de leitura (impede poluir `reading_events`). */
export const READER_CONTENT_IDS: ReadonlySet<string> = new Set(
  READER_DOCS.map((d) => d.contentId),
);
