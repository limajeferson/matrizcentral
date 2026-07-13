import { getSupabaseServerClient } from "@/lib/supabase/server";
import { resolveAccess, type AccessLevel } from "@/lib/entitlements";
import { canConsume, cycleKeyFor } from "@/lib/consumption";

export async function resolveUserIdByToken(token: string): Promise<string | null> {
  const supabase = getSupabaseServerClient();
  const { data: t } = await supabase.from("tokens").select("purchase_id").eq("token", token).maybeSingle();
  if (!t) return null;
  const { data: p } = await supabase.from("purchases").select("user_id").eq("id", t.purchase_id).maybeSingle();
  return p?.user_id ?? null;
}

export async function getAccessContext(userId: string): Promise<{
  access: AccessLevel; startsAt: Date | null; unlockedContentIds: string[]; unlockedCycleKeys: string[];
}> {
  const supabase = getSupabaseServerClient();
  const { data: ents } = await supabase
    .from("entitlements").select("plan, starts_at, expires_at").eq("user_id", userId);
  const access = resolveAccess(ents ?? []);
  // starts_at do entitlement vigente de nível `access` (o mais recente), para o ciclo.
  const active = (ents ?? [])
    .filter((e) => e.plan === access && new Date(e.expires_at).getTime() > Date.now())
    .sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime())[0];
  const startsAt = active ? new Date(active.starts_at) : null;
  const { data: unlocks } = await supabase
    .from("content_unlocks").select("content_id, cycle_key").eq("user_id", userId);
  return {
    access, startsAt,
    unlockedContentIds: (unlocks ?? []).map((u) => u.content_id),
    unlockedCycleKeys: (unlocks ?? []).map((u) => u.cycle_key),
  };
}

export async function tryConsume(userId: string, contentId: string, startIncluded: boolean): Promise<{ allowed: boolean; reason: string }> {
  const ctx = await getAccessContext(userId);
  const now = new Date();
  const decision = canConsume({
    access: ctx.access, startIncluded, unlockedContentIds: ctx.unlockedContentIds,
    unlockedCycleKeys: ctx.unlockedCycleKeys, contentId, startsAt: ctx.startsAt, now,
  });
  if (decision.allowed && decision.willUnlock && ctx.startsAt) {
    const supabase = getSupabaseServerClient();
    const cycle_key = cycleKeyFor(ctx.startsAt, now);
    // Idempotente por (user_id, content_id); relê o ciclo para não furar a cota numa corrida.
    await supabase.from("content_unlocks").insert({ user_id: userId, content_id: contentId, cycle_key });
    const { data: sameCycle } = await supabase
      .from("content_unlocks").select("content_id").eq("user_id", userId).eq("cycle_key", cycle_key);
    if ((sameCycle ?? []).length > 1) {
      // corrida: outro desbloqueio no mesmo ciclo — mantém o primeiro, reverte este.
      await supabase.from("content_unlocks").delete().eq("user_id", userId).eq("content_id", contentId);
      // se este não é o desbloqueio "válido" do ciclo, nega.
      const first = (sameCycle ?? []).find((r) => r.content_id !== contentId);
      if (first) return { allowed: false, reason: "cycle-used" };
    }
  }
  return { allowed: decision.allowed, reason: decision.reason };
}
