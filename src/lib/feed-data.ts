import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { ActivityRow } from "@/lib/feed";

export async function getCommunityActivity(limit = 20): Promise<ActivityRow[]> {
  const supabase = getSupabaseServerClient();
  const { data: badges } = await supabase
    .from("badges_earned")
    .select("user_id, badge_id, earned_at")
    .order("earned_at", { ascending: false })
    .limit(limit * 3); // folga para filtrar por opt-in depois

  const rows = badges ?? [];
  if (rows.length === 0) return [];

  const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
  const { data: users } = await supabase
    .from("users")
    .select("id, display_name, leaderboard_opt_in")
    .in("id", userIds);

  const byId = new Map((users ?? []).map((u) => [u.id, u]));
  return rows
    .filter((r) => byId.get(r.user_id)?.leaderboard_opt_in && byId.get(r.user_id)?.display_name)
    .slice(0, limit)
    .map((r) => ({ display_name: byId.get(r.user_id)!.display_name, badge_id: r.badge_id, earned_at: r.earned_at }));
}
