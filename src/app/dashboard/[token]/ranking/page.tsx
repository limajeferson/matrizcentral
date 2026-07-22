import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isTokenExpired } from "@/lib/tokens";
import GlassCard from "@/components/ui/glass-card";
import LeaderboardOptIn from "@/components/dashboard/LeaderboardOptIn";

export default async function RankingPage({ params }: { params: { token: string } }) {
  const supabase = getSupabaseServerClient();
  const { data: tokenRow } = await supabase
    .from("tokens")
    .select("purchase_id, valid_until")
    .eq("token", params.token)
    .maybeSingle();

  if (!tokenRow || isTokenExpired(tokenRow.valid_until)) {
    return <p className="max-w-md mx-auto p-8 text-center">Token inválido ou expirado.</p>;
  }

  const { data: purchase } = await supabase
    .from("purchases")
    .select("user_id")
    .eq("id", tokenRow.purchase_id)
    .single();

  const { data: currentUser } = purchase
    ? await supabase
        .from("users")
        .select("display_name, leaderboard_opt_in")
        .eq("id", purchase.user_id)
        .single()
    : { data: null };

  const { data: topUsers } = await supabase
    .from("users")
    .select("id, display_name, total_xp")
    .eq("leaderboard_opt_in", true)
    .order("total_xp", { ascending: false })
    .limit(20);

  const currentUserId = purchase?.user_id;
  const isCurrentUserInList = (topUsers ?? []).some((u) => u.id === currentUserId);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ranking</h1>
        <p className="text-muted-foreground">
          Top 20 alunos que optaram por aparecer publicamente no ranking.
        </p>
      </div>

      {purchase && (
        <LeaderboardOptIn
          token={params.token}
          initialOptIn={currentUser?.leaderboard_opt_in ?? false}
          initialDisplayName={currentUser?.display_name ?? null}
        />
      )}

      <GlassCard className="p-4">
        <ol className="space-y-2">
          {(topUsers ?? []).map((user, index) => (
            <li
              key={user.id}
              className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                user.id === currentUserId ? "bg-violet-500/15 font-semibold" : ""
              }`}
            >
              <span>
                #{index + 1} {user.display_name ?? "Anônimo"}
                {user.id === currentUserId ? " (você)" : ""}
              </span>
              <span>{user.total_xp} XP</span>
            </li>
          ))}
          {(topUsers ?? []).length === 0 && (
            <li className="text-muted-foreground">Ninguém optou por aparecer no ranking ainda.</li>
          )}
        </ol>
        {!isCurrentUserInList && (
          <p className="mt-4 text-sm text-muted-foreground">
            Você não está no ranking público. Ative isso no seu dashboard para aparecer aqui.
          </p>
        )}
      </GlassCard>
    </div>
  );
}
