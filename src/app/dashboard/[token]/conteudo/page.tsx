import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isTokenExpired } from "@/lib/tokens";
import { CONTENT_HUB, type ContentType } from "@/data/content-hub";
import GlassCard from "@/components/ui/glass-card";
import CategoryBadge from "@/components/ui/category-badge";
import { deriveRoadmapView } from "@/lib/roadmap-progress";
import { ROADMAP_STAGE_KEYS, ROADMAP_STAGE_LABELS } from "@/data/roadmap-stages";
import { getRecommendedContent } from "@/lib/content-feed";
import { CONTENT_ICON } from "@/lib/content-icons";
import { IconCheck } from "@/components/ui/icons";

const TYPE_LABEL: Record<ContentType, string> = {
  relatorio: "Relatório",
  podcast: "Podcast",
  video: "Vídeo",
  pesquisa: "Pesquisa",
};

function TypeBadge({ type }: { type: ContentType }) {
  const Icon = CONTENT_ICON[type];
  return (
    <CategoryBadge variant="hub">
      <span className="flex items-center gap-1">
        <Icon size={14} />
        {TYPE_LABEL[type]}
      </span>
    </CategoryBadge>
  );
}

export default async function ConteudoHubPage({ params }: { params: { token: string } }) {
  const supabase = getSupabaseServerClient();
  const { data: tokenRow } = await supabase
    .from("tokens")
    .select("valid_until")
    .eq("token", params.token)
    .maybeSingle();

  if (!tokenRow || isTokenExpired(tokenRow.valid_until)) {
    return <p className="max-w-md mx-auto p-8 text-center">Token inválido ou expirado.</p>;
  }

  const { data: completions } = await supabase
    .from("content_completions")
    .select("content_id")
    .eq("token", params.token);

  const completedIds = new Set((completions ?? []).map((c: { content_id: string }) => c.content_id));

  const { data: progressRows } = await supabase
    .from("roadmap_progress")
    .select("stage_key")
    .eq("token", params.token);

  const completedStages = (progressRows ?? []).map((row: { stage_key: string }) => row.stage_key);
  const roadmapView = deriveRoadmapView(completedStages);
  const activeStageKey =
    roadmapView.activeIndex === -1 ? null : ROADMAP_STAGE_KEYS[roadmapView.activeIndex];

  const recommended = getRecommendedContent(
    CONTENT_HUB,
    activeStageKey,
    Array.from(completedIds)
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <CategoryBadge variant="hub">Hub de conteúdo</CategoryBadge>
        <h1 className="mt-2 text-2xl font-bold text-foreground">Aprenda no seu ritmo</h1>
        <p className="text-muted-foreground">
          Relatórios, podcasts, vídeos e pesquisas com a comunidade sobre IA local — cada conteúdo
          concluído gera XP.
        </p>
      </div>

      {recommended.length > 0 && activeStageKey && (
        <div>
          <CategoryBadge variant="roadmap">
            Recomendado pra você agora — {ROADMAP_STAGE_LABELS[activeStageKey]}
          </CategoryBadge>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {recommended.map((item) => (
              <Link key={item.id} href={`/dashboard/${params.token}/conteudo/${item.id}`}>
                <GlassCard className="h-full border-2 border-violet-500/40 bg-violet-500/10 p-5 transition hover:-translate-y-0.5">
                  <div className="mb-2 flex items-center justify-between">
                    <TypeBadge type={item.type} />
                  </div>
                  <h2 className="font-bold text-foreground">{item.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                  <div className="mt-3 text-xs text-muted-foreground">
                    {item.durationMinutes} min · +{item.xpReward} XP
                  </div>
                </GlassCard>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Explore mais
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
        {CONTENT_HUB.map((item) => {
          const done = completedIds.has(item.id);
          const comingSoon =
            item.embedUrl === null && item.type !== "relatorio" && item.type !== "pesquisa";

          return (
            <Link key={item.id} href={`/dashboard/${params.token}/conteudo/${item.id}`}>
              <GlassCard className="h-full p-5 transition hover:-translate-y-0.5">
                <div className="mb-2 flex items-center justify-between">
                  <TypeBadge type={item.type} />
                  {done && (
                    <span className="flex items-center gap-1 text-sm font-semibold text-emerald-600">
                      <IconCheck size={14} />
                      concluído
                    </span>
                  )}
                </div>
                <h2 className="font-bold text-foreground">{item.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{item.durationMinutes} min · +{item.xpReward} XP</span>
                  {comingSoon && <span className="font-semibold text-amber-600">em breve</span>}
                </div>
              </GlassCard>
            </Link>
          );
        })}
        </div>
      </div>
    </div>
  );
}
