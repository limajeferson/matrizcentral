import { getSupabaseServerClient } from "@/lib/supabase/server";
import { tryConsume } from "./entitlement-access";
import { EBOOK_PRODUCT_ID, type ReaderDoc } from "@/data/reader-docs";

export type ReadDecision = { allowed: boolean; reason: string };

const REVOKED = new Set(["refunded", "disputed"]);

export async function canRead(userId: string, doc: ReaderDoc): Promise<ReadDecision> {
  const supabase = getSupabaseServerClient();
  const { data: purchases, error } = await supabase
    .from("purchases").select("status, product_id").eq("user_id", userId);

  // Fail-closed: sem leitura confiável do estado da compra, não libera.
  if (error || !purchases) {
    console.error("canRead: falha ao ler purchases", error);
    return { allowed: false, reason: "error" };
  }

  // Intenção direta: sem NENHUMA linha em `purchases`, é "sem compra" — não
  // "revogado" (esse é só alcançável quando existiu compra e ela morreu toda).
  if (purchases.length === 0) return { allowed: false, reason: "no-purchase" };

  const active = purchases.filter((p) => !REVOKED.has(p.status));
  // Tinha compra, e toda ela foi revogada → acesso revogado (não "sem compra").
  if (active.length === 0) {
    return { allowed: false, reason: "revoked" };
  }

  // Pré-condição comum a QUALQUER kind, antes do ramo por tipo de doc: precisa
  // existir ao menos uma compra com status "paid" — não basta "não revogada"
  // (o default da coluna é "pending", que sem isto passava direto pro relatorio
  // e chegava até o tryConsume sem nunca ter sido paga).
  const hasAnyPaid = active.some((p) => p.status === "paid");
  if (!hasAnyPaid) return { allowed: false, reason: "no-purchase" };

  if (doc.kind === "ebook") {
    // Revogação é por PRODUTO, não por usuário: uma compra paga de OUTRO
    // produto (ex.: passe advanced) não libera o ebook se a compra do ebook
    // em si foi reembolsada — precisa da compra paga *do ebook*.
    const ebookPaid = active.some(
      (p) => p.status === "paid" && p.product_id === EBOOK_PRODUCT_ID,
    );
    return ebookPaid
      ? { allowed: true, reason: "purchase" }
      : { allowed: false, reason: "no-purchase" };
  }
  return tryConsume(userId, doc.contentId, doc.startIncluded);
}

export async function getProgress(
  userId: string, contentId: string,
): Promise<{ slug: string; index: number } | null> {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("reading_progress").select("section_slug, section_index")
    .eq("user_id", userId).eq("content_id", contentId).maybeSingle();
  return data ? { slug: data.section_slug, index: data.section_index } : null;
}

/** Grava retomada (upsert) e o evento de auditoria (append-only).
 *  Falha aqui NUNCA bloqueia a leitura — só registra. Por isso o corpo inteiro
 *  roda em try/catch: `getSupabaseServerClient()` pode lançar (usa
 *  `process.env.X!`) e a desestruturação do `Promise.all` lança se algum
 *  resultado vier `undefined` — sem o catch, qualquer um dos dois derrubaria
 *  a leitura do usuário, quebrando a promessa do comentário acima. */
export async function recordRead(
  userId: string, contentId: string, slug: string, index: number,
): Promise<void> {
  try {
    const supabase = getSupabaseServerClient();
    const row = { user_id: userId, content_id: contentId, section_slug: slug, section_index: index };
    const [{ error: pErr }, { error: eErr }] = await Promise.all([
      supabase.from("reading_progress").upsert(
        { ...row, updated_at: new Date().toISOString() },
        { onConflict: "user_id,content_id" },
      ),
      supabase.from("reading_events").insert(row),
    ]);
    // `reading_progress` é cosmético (só afeta "retomar de onde parei"); já
    // `reading_events` é a prova de consumo usada em garantia comercial e
    // defesa de chargeback — perdê-la silenciosamente é perda de AUDITORIA,
    // não um detalhe de UX, por isso o prefixo distinto e alertável.
    if (pErr) console.error("recordRead: falha ao gravar progresso (cosmético)", pErr);
    if (eErr) console.error("AUDIT-LOSS: falha ao gravar reading_events (prova de consumo)", eErr);
  } catch (err) {
    // Não dá pra saber qual das duas gravações falhou (ou se falhou antes de
    // tentar) — trata como perda de auditoria por segurança (pior caso).
    console.error("AUDIT-LOSS: recordRead lançou inesperadamente", err);
  }
}
