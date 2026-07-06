import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isTokenExpired } from "@/lib/tokens";
import RoadmapCard from "@/components/dashboard/RoadmapCard";
import {
  ROADMAP_STAGE_KEYS,
  ROADMAP_STAGE_LABELS,
  type RoadmapStages,
} from "@/data/roadmap-stages";
import QuizValidacaoContainer from "@/components/quiz/QuizValidacaoContainer";
import GlassCard from "@/components/ui/glass-card";
import CategoryBadge from "@/components/ui/category-badge";

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
    const { data: xpEvents } = await supabase
      .from("xp_events")
      .select("xp_amount")
      .eq("user_id", purchase.user_id);

    totalXp = (xpEvents ?? []).reduce(
      (sum: number, event: { xp_amount: number }) => sum + event.xp_amount,
      0
    );
  }

  const { data: progressRows } = await supabase
    .from("roadmap_progress")
    .select("stage_key")
    .eq("token", params.token);

  const completedStages = (progressRows ?? []).map((row: { stage_key: string }) => row.stage_key);

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <CategoryBadge variant="xp" className="text-sm">
        ⭐ {totalXp} XP
      </CategoryBadge>

      <GlassCard className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <CategoryBadge variant="roadmap">Sua Trilha Recomendada</CategoryBadge>
        </div>
        <dl className="space-y-4">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Objetivo principal
            </dt>
            <dd className="text-lg font-bold text-zinc-900">{profile.description}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Ponto de partida
            </dt>
            <dd className="text-zinc-700">
              {ROADMAP_STAGE_LABELS[ROADMAP_STAGE_KEYS[0]]}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Tempo estimado
            </dt>
            <dd className="text-zinc-700">≈ 45–60 minutos nos primeiros passos</dd>
          </div>
        </dl>
      </GlassCard>

      <GlassCard className="p-6">
        <RoadmapCard
          roadmap={profile.study_roadmap as RoadmapStages}
          completedStages={completedStages}
          token={params.token}
        />
      </GlassCard>

      <GlassCard className="p-6">
        <div className="mb-2">
          <CategoryBadge variant="ebook">Ebook</CategoryBadge>
        </div>
        <h2 className="mb-3 font-bold text-zinc-900">Seu primeiro ebook</h2>
        <a
          href={`/api/download?token=${params.token}`}
          className="inline-block rounded-xl bg-violet-600 px-6 py-2 font-semibold text-white transition hover:bg-violet-700"
        >
          📥 Baixar Ebook LLM Local
        </a>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="mb-2">
          <CategoryBadge variant="hub">Hub de conteúdo</CategoryBadge>
        </div>
        <h2 className="mb-3 font-bold text-zinc-900">Relatórios, podcasts e vídeos</h2>
        <p className="mb-3 text-zinc-600">
          Aprofunde-se em IA local no seu ritmo — cada conteúdo concluído gera XP.
        </p>
        <a
          href={`/dashboard/${params.token}/conteudo`}
          className="inline-block rounded-xl bg-violet-600 px-6 py-2 font-semibold text-white transition hover:bg-violet-700"
        >
          🚀 Explorar hub de conteúdo
        </a>
      </GlassCard>

      <div>
        <div className="mb-4 flex items-center gap-2">
          <CategoryBadge variant="quiz">Validação</CategoryBadge>
          <h2 className="text-xl font-bold text-zinc-900">Validação de Conhecimento</h2>
        </div>
        <QuizValidacaoContainer token={params.token} />
      </div>
    </div>
  );
}
