import { getSupabaseServerClient } from "@/lib/supabase/server";
import { tryConsume } from "./entitlement-access";
import type { ReaderDoc } from "@/data/reader-docs";

export type ReadDecision = { allowed: boolean; reason: string };

const REVOKED = new Set(["refunded", "disputed"]);

export async function canRead(userId: string, doc: ReaderDoc): Promise<ReadDecision> {
  const supabase = getSupabaseServerClient();
  const { data: purchases, error } = await supabase
    .from("purchases").select("status").eq("user_id", userId);

  // Fail-closed: sem leitura confiável do estado da compra, não libera.
  if (error || !purchases) {
    console.error("canRead: falha ao ler purchases", error);
    return { allowed: false, reason: "error" };
  }

  const active = purchases.filter((p) => !REVOKED.has(p.status));
  // Tinha compra, e toda ela foi revogada → acesso revogado (não "sem compra").
  if (purchases.length > 0 && active.length === 0) {
    return { allowed: false, reason: "revoked" };
  }
  if (active.length === 0) return { allowed: false, reason: "no-purchase" };

  if (doc.kind === "ebook") {
    return active.some((p) => p.status === "paid")
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
 *  Falha aqui NUNCA bloqueia a leitura — só registra. */
export async function recordRead(
  userId: string, contentId: string, slug: string, index: number,
): Promise<void> {
  const supabase = getSupabaseServerClient();
  const row = { user_id: userId, content_id: contentId, section_slug: slug, section_index: index };
  const [{ error: pErr }, { error: eErr }] = await Promise.all([
    supabase.from("reading_progress").upsert(
      { ...row, updated_at: new Date().toISOString() },
      { onConflict: "user_id,content_id" },
    ),
    supabase.from("reading_events").insert(row),
  ]);
  if (pErr) console.error("recordRead: progresso", pErr);
  if (eErr) console.error("recordRead: evento", eErr);
}
