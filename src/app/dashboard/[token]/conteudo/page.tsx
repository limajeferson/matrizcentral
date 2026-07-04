import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isTokenExpired } from "@/lib/tokens";
import { CONTENT_HUB, type ContentType } from "@/data/content-hub";
import GlassCard from "@/components/ui/glass-card";
import CategoryBadge from "@/components/ui/category-badge";

const TYPE_LABEL: Record<ContentType, string> = {
  relatorio: "📄 Relatório",
  podcast: "🎙️ Podcast",
  video: "🎬 Vídeo",
  pesquisa: "📊 Pesquisa",
};

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

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <CategoryBadge variant="hub">Hub de conteúdo</CategoryBadge>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900">Aprenda no seu ritmo</h1>
        <p className="text-zinc-600">
          Relatórios, podcasts, vídeos e pesquisas com a comunidade sobre IA local — cada conteúdo
          concluído gera XP.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {CONTENT_HUB.map((item) => {
          const done = completedIds.has(item.id);
          const comingSoon =
            item.embedUrl === null && item.type !== "relatorio" && item.type !== "pesquisa";

          return (
            <Link key={item.id} href={`/dashboard/${params.token}/conteudo/${item.id}`}>
              <GlassCard className="h-full p-5 transition hover:-translate-y-0.5">
                <div className="mb-2 flex items-center justify-between">
                  <CategoryBadge variant="hub">{TYPE_LABEL[item.type]}</CategoryBadge>
                  {done && <span className="text-sm font-semibold text-emerald-600">✔ concluído</span>}
                </div>
                <h2 className="font-bold text-zinc-900">{item.title}</h2>
                <p className="mt-1 text-sm text-zinc-600">{item.description}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
                  <span>{item.durationMinutes} min · +{item.xpReward} XP</span>
                  {comingSoon && <span className="font-semibold text-amber-600">em breve</span>}
                </div>
              </GlassCard>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
