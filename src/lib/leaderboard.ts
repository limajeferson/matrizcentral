export function monthStartIso(now: Date): string {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

export function aggregateMonthlyXp(
  events: { user_id: string; xp_amount: number; created_at: string }[],
  monthStartIso: string,
): Map<string, number> {
  const totals = new Map<string, number>();
  for (const e of events) {
    if (e.created_at < monthStartIso) continue;
    totals.set(e.user_id, (totals.get(e.user_id) ?? 0) + e.xp_amount);
  }
  return totals;
}

export type RankRow = { rank: number; name: string; xp: number };
export function rankLeaderboard(
  totals: { userId: string; name: string; xp: number }[],
  limit: number,
): RankRow[] {
  return [...totals]
    .sort((a, b) => b.xp - a.xp)
    .slice(0, limit)
    .map((t, i) => ({ rank: i + 1, name: t.name, xp: t.xp }));
}
