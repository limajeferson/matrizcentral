import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types";
import { evaluateBadges, type UserGamificationStats } from "@/lib/badges";
import { CONTENT_HUB, type ContentType } from "@/data/content-hub";

async function buildStats(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<UserGamificationStats> {
  const { data: userRow } = await supabase
    .from("users")
    .select("total_xp")
    .eq("id", userId)
    .single();

  const { data: purchases } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", userId);

  const purchaseIds = (purchases ?? []).map((p) => p.id);

  const tokenRows = purchaseIds.length
    ? (await supabase.from("tokens").select("token").in("purchase_id", purchaseIds)).data
    : [];

  const tokens = (tokenRows ?? []).map((t) => t.token);

  const completions = tokens.length
    ? (await supabase.from("content_completions").select("content_id").in("token", tokens)).data
    : [];

  const contentTypeById = new Map(CONTENT_HUB.map((item) => [item.id, item.type]));
  const contentCompletedByType: Partial<Record<ContentType, number>> = {};
  for (const completion of completions ?? []) {
    const type = contentTypeById.get(completion.content_id);
    if (!type) continue;
    contentCompletedByType[type] = (contentCompletedByType[type] ?? 0) + 1;
  }

  const roadmapRows = tokens.length
    ? (await supabase.from("roadmap_progress").select("stage_key").in("token", tokens)).data
    : [];

  const roadmapStagesCompleted = (roadmapRows ?? []).map((r) => r.stage_key);

  const { data: validacaoEvents } = await supabase
    .from("xp_events")
    .select("id")
    .eq("user_id", userId)
    .eq("action_type", "validacao")
    .limit(1);

  return {
    totalXp: userRow?.total_xp ?? 0,
    contentCompletedByType,
    roadmapStagesCompleted,
    quizValidacaoPassed: (validacaoEvents ?? []).length > 0,
    purchaseCount: purchaseIds.length,
  };
}

export async function grantBadges(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<string[]> {
  const stats = await buildStats(supabase, userId);
  const eligibleBadgeIds = evaluateBadges(stats);

  if (eligibleBadgeIds.length === 0) {
    return [];
  }

  const { data: alreadyEarned } = await supabase
    .from("badges_earned")
    .select("badge_id")
    .eq("user_id", userId);

  const earnedIds = new Set((alreadyEarned ?? []).map((b) => b.badge_id));
  const newBadgeIds = eligibleBadgeIds.filter((id) => !earnedIds.has(id));

  if (newBadgeIds.length === 0) {
    return [];
  }

  await supabase
    .from("badges_earned")
    .insert(newBadgeIds.map((badgeId) => ({ user_id: userId, badge_id: badgeId })));

  return newBadgeIds;
}
