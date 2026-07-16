import { getSupabaseServerClient } from "@/lib/supabase/server";
import { monthStartIso, aggregateMonthlyXp, rankLeaderboard, type RankRow } from "@/lib/leaderboard";

export async function getMonthlyLeaderboard(now: Date, limit = 10): Promise<RankRow[]> {
  const supabase = getSupabaseServerClient();
  const ms = monthStartIso(now);

  const { data: events } = await supabase
    .from("xp_events")
    .select("user_id, xp_amount, created_at")
    .gte("created_at", ms);

  const totalsByUser = aggregateMonthlyXp(events ?? [], ms);
  const userIds = Array.from(totalsByUser.keys());
  if (userIds.length === 0) return [];

  const { data: users } = await supabase
    .from("users")
    .select("id, display_name")
    .in("id", userIds);

  const totals = (users ?? [])
    .filter((u) => u.display_name != null)
    .map((u) => ({
      userId: u.id,
      name: u.display_name as string,
      xp: totalsByUser.get(u.id) ?? 0,
    }));

  return rankLeaderboard(totals, limit);
}
