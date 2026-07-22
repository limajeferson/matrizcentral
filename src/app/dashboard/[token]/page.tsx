import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isTokenExpired } from "@/lib/tokens";
import { getLevelProgress } from "@/lib/levels";
import RoadmapCard from "@/components/dashboard/RoadmapCard";
import JornadaToc from "@/components/dashboard/JornadaToc";
import {
  ROADMAP_STAGE_KEYS,
  ROADMAP_STAGE_LABELS,
  type RoadmapStages,
} from "@/data/roadmap-stages";
import QuizValidacaoContainer from "@/components/quiz/QuizValidacaoContainer";
import GlassCard from "@/components/ui/glass-card";
import CategoryBadge from "@/components/ui/category-badge";
import BadgeShelf from "@/components/dashboard/BadgeShelf";
import ChallengeWidget from "@/components/dashboard/ChallengeWidget";
import { getCurrentChallenge, getIsoWeekKey, getIsoWeekStart } from "@/lib/challenges";
import { IconArrow } from "@/components/ui/icons";

export default async function DashboardPage({ params }: { params: { token: string } }) {
  const supabase = getSupabaseServerClient();
  const { data: tokenRow } = await supabase
    .from("tokens")
    .select("*")
    .eq("token", params.token)
    .maybeSingle();

  if (!tokenRow || isTokenExpired(tokenRow.valid_until)) {
    return <p className="max-w-md mx-auto p-8 text-center">Token inválido ou expirado.</p>;
  }

  if (!tokenRow.triaged || !tokenRow.profile_id) {
    return (
      <p className="max-w-md mx-auto p-8 text-center">
        Complete primeiro o{" "}
        <a href={`/quiz/${params.token}`} className="text-violet-600 underline">
          Diagnóstico Inicial
        </a>
        .
      </p>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", tokenRow.profile_id)
    .single();

  if (!profile) {
    return <p className="max-w-md mx-auto p-8 text-center">Perfil não encontrado.</p>;
  }

  const { data: purchase } = await supabase
    .from("purchases")
    .select("user_id")
    .eq("id", tokenRow.purchase_id)
    .single();

  let totalXp = 0;
  if (purchase) {
    const { data: userRow } = await supabase
      .from("users")
      .select("total_xp")
      .eq("id", purchase.user_id)
      .single();

    totalXp = userRow?.total_xp ?? 0;
  }

  const levelProgress = getLevelProgress(totalXp);

  const { data: progressRows } = await supabase
    .from("roadmap_progress")
    .select("stage_key")
    .eq("token", params.token);

  const completedStages = (progressRows ?? []).map((row: { stage_key: string }) => row.stage_key);

  let earnedBadgeIds: string[] = [];
  if (purchase) {
    const { data: badgeRows } = await supabase
      .from("badges_earned")
      .select("badge_id")
      .eq("user_id", purchase.user_id);

    earnedBadgeIds = (badgeRows ?? []).map((row) => row.badge_id);
  }

  const now = new Date();
  const currentChallenge = getCurrentChallenge(now);
  const weekKey = getIsoWeekKey(now);
  let challengeProgress = 0;
  let challengeClaimed = false;

  if (purchase) {
    const weekStart = getIsoWeekStart(now);

    const { data: relevantEvents } = await supabase
      .from("xp_events")
      .select("id")
      .eq("user_id", purchase.user_id)
      .eq("action_type", currentChallenge.targetActionType)
      .gte("created_at", weekStart.toISOString());

    challengeProgress = (relevantEvents ?? []).length;

    const { data: claimRow } = await supabase
      .from("challenge_claims")
      .select("id")
      .eq("user_id", purchase.user_id)
      .eq("week_key", weekKey)
      .maybeSingle();

    challengeClaimed = !!claimRow;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <GlassCard className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <CategoryBadge variant="xp">
            Nível {levelProgress.level} — {levelProgress.name}
          </CategoryBadge>
          <span className="text-xs text-muted-foreground">{totalXp} XP total</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-violet-600 transition-all"
            style={{ width: `${levelProgress.progressPercent}%` }}
          />
        </div>
        {levelProgress.nextLevelName ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {levelProgress.xpToNext} XP para o nível {levelProgress.level + 1} —{" "}
            {levelProgress.nextLevelName}
          </p>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">Nível máximo alcançado!</p>
        )}
      </GlassCard>

      <BadgeShelf earnedBadgeIds={earnedBadgeIds} />

      <ChallengeWidget
        token={params.token}
        title={currentChallenge.title}
        description={currentChallenge.description}
        xpReward={currentChallenge.xpReward}
        progress={challengeProgress}
        target={currentChallenge.targetCount}
        alreadyClaimed={challengeClaimed}
      />

      <GlassCard className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <CategoryBadge variant="roadmap">Sua Trilha Recomendada</CategoryBadge>
        </div>
        <dl className="space-y-4">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Objetivo principal
            </dt>
            <dd className="text-lg font-bold text-foreground">{profile.description}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Ponto de partida
            </dt>
            <dd className="text-muted-foreground">
              {ROADMAP_STAGE_LABELS[ROADMAP_STAGE_KEYS[0]]}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Tempo estimado
            </dt>
            <dd className="text-muted-foreground">≈ 45–60 minutos nos primeiros passos</dd>
          </div>
        </dl>
      </GlassCard>

      <div className="flex items-start gap-6">
        <JornadaToc completedStages={completedStages} />
        <GlassCard className="min-w-0 flex-1 p-6">
          <RoadmapCard
            roadmap={profile.study_roadmap as RoadmapStages}
            completedStages={completedStages}
            token={params.token}
          />
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <div className="mb-2">
          <CategoryBadge variant="ebook">Ebook</CategoryBadge>
        </div>
        <h2 className="mb-3 font-bold text-foreground">Seu primeiro ebook</h2>
        <a
          href={`/entrar/resgate?token=${params.token}`}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2 font-semibold text-white transition hover:bg-violet-700"
        >
          Ler o guia
          <IconArrow size={16} />
        </a>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="mb-2">
          <CategoryBadge variant="hub">Hub de conteúdo</CategoryBadge>
        </div>
        <h2 className="mb-3 font-bold text-foreground">Relatórios, podcasts e vídeos</h2>
        <p className="mb-3 text-muted-foreground">
          Aprofunde-se em IA local no seu ritmo — cada conteúdo concluído gera XP.
        </p>
        <a
          href={`/dashboard/${params.token}/conteudo`}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2 font-semibold text-white transition hover:bg-violet-700"
        >
          Explorar hub de conteúdo
          <IconArrow size={16} />
        </a>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="mb-2">
          <CategoryBadge variant="xp">Ranking</CategoryBadge>
        </div>
        <h2 className="mb-3 font-bold text-foreground">Veja sua posição</h2>
        <a
          href={`/dashboard/${params.token}/ranking`}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2 font-semibold text-white transition hover:bg-violet-700"
        >
          Ver ranking
          <IconArrow size={16} />
        </a>
      </GlassCard>

      <div>
        <div className="mb-4 flex items-center gap-2">
          <CategoryBadge variant="quiz">Validação</CategoryBadge>
          <h2 className="text-xl font-bold text-foreground">Validação de Conhecimento</h2>
        </div>
        <QuizValidacaoContainer token={params.token} />
      </div>
    </div>
  );
}
