import ContentGate from "@/components/auth/ContentGate";
import type { ActivityItem } from "@/lib/feed";
import type { AccessLevel } from "@/lib/entitlements";
import type { RankRow } from "@/lib/leaderboard";
import SwipeableActivityList from "@/components/app/feed/SwipeableActivityList";
import RankingList from "@/components/app/feed/RankingList";

export type RightSidebarProps = {
  access: AccessLevel;
  /** `formatActivity(getCommunityActivity(20))`, já resolvido pelo server component. */
  activity: ActivityItem[];
  /** `getMonthlyLeaderboard(new Date())`, já resolvido pelo server component. */
  ranking: RankRow[];
  /** Visitante logado? Controla a visibilidade do bloco "Ranking da temporada". */
  loggedIn: boolean;
};

/**
 * "Comunidade": atividade recente (selos conquistados, swipeable), gated a
 * Advanced. "Ranking da temporada": XP mensal, visível a todos os logados.
 */
export function RightSidebar({ access, activity, ranking, loggedIn }: RightSidebarProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Comunidade</h2>
        {access === "advanced" ? (
          <SwipeableActivityList items={activity} />
        ) : (
          <ContentGate title="Atividade da comunidade" nextPath="/feed" />
        )}
      </section>
      {loggedIn ? (
        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Ranking da temporada
          </h2>
          <RankingList rows={ranking} />
        </section>
      ) : null}
    </div>
  );
}

export default RightSidebar;
