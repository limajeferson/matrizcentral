import { readFile } from "fs/promises";
import path from "path";
import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isTokenExpired } from "@/lib/tokens";
import { CONTENT_HUB } from "@/data/content-hub";
import GlassCard from "@/components/ui/glass-card";
import CategoryBadge from "@/components/ui/category-badge";
import CompleteContentButton from "@/components/content/CompleteContentButton";
import ContentGate from "@/components/auth/ContentGate";
import { resolveUserIdByToken, tryConsume } from "@/lib/entitlement-access";
import PesquisaForm from "@/components/content/PesquisaForm";
import PesquisaResults from "@/components/content/PesquisaResults";
import Markdown from "@/components/ui/Markdown";
import { ArticleToc } from "@/components/app/content/ArticleToc";
import { ShareLinks } from "@/components/app/content/ShareLinks";
import { VideoPlayer } from "@/components/app/content/VideoPlayer";
import { MusicPlayerCard } from "@/components/app/content/MusicPlayerCard";
import { extractHeadings, parseMarkdown } from "@/lib/markdown";

export default async function ConteudoDetailPage({
  params,
}: {
  params: { token: string; id: string };
}) {
  const item = CONTENT_HUB.find((entry) => entry.id === params.id);
  if (!item) {
    notFound();
  }

  const supabase = getSupabaseServerClient();
  const { data: tokenRow } = await supabase
    .from("tokens")
    .select("valid_until")
    .eq("token", params.token)
    .maybeSingle();

  if (!tokenRow || isTokenExpired(tokenRow.valid_until)) {
    return <p className="max-w-md mx-auto p-8 text-center">Token inválido ou expirado.</p>;
  }

  const userId = await resolveUserIdByToken(params.token);
  const decision = userId
    ? await tryConsume(userId, item.id, item.startIncluded === true)
    : { allowed: false, reason: "gated" };

  if (!decision.allowed) {
    const nextPath = `/dashboard/${params.token}/conteudo/${item.id}`;
    return (
      <div className="mx-auto max-w-3xl space-y-6 p-6">
        <CategoryBadge variant="hub">{item.title}</CategoryBadge>
        <p className="text-sm text-muted-foreground">{item.description}</p>
        <ContentGate
          title={item.title}
          nextPath={nextPath}
          reason={decision.reason}
        />
      </div>
    );
  }

  const { data: existingCompletion } = await supabase
    .from("content_completions")
    .select("id")
    .eq("token", params.token)
    .eq("content_id", item.id)
    .maybeSingle();

  const body = item.bodyPath
    ? await readFile(path.join(process.cwd(), item.bodyPath), "utf-8")
    : null;
  const headings = body ? extractHeadings(parseMarkdown(body)) : [];
  const base = process.env.NEXT_PUBLIC_URL ?? "https://www.matrizcentral.com.br";

  if (item.type === "pesquisa" && item.surveyOptions) {
    const { data: existingResponse } = await supabase
      .from("survey_responses")
      .select("id")
      .eq("token", params.token)
      .eq("survey_id", item.id)
      .maybeSingle();

    let results: React.ReactNode = null;
    if (existingResponse) {
      const { data: allResponses } = await supabase
        .from("survey_responses")
        .select("option_id")
        .eq("survey_id", item.id);

      const counts: Record<string, number> = {};
      for (const row of allResponses ?? []) {
        counts[row.option_id] = (counts[row.option_id] ?? 0) + 1;
      }
      results = <PesquisaResults options={item.surveyOptions} counts={counts} />;
    }

    return (
      <div className="mx-auto max-w-3xl space-y-6 p-6">
        <CategoryBadge variant="hub">{item.title}</CategoryBadge>
        <p className="text-sm text-muted-foreground">+{item.xpReward} XP ao responder</p>

        <GlassCard className="p-6">
          {results ?? (
            <PesquisaForm token={params.token} surveyId={item.id} options={item.surveyOptions} />
          )}
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <CategoryBadge variant="hub">{item.title}</CategoryBadge>
      <p className="text-sm text-muted-foreground">
        {item.durationMinutes} min · +{item.xpReward} XP
      </p>

      {body && (
        <>
          <ArticleToc headings={headings} />
          <GlassCard className="p-6">
            <Markdown source={body} />
          </GlassCard>
        </>
      )}

      {!body && (
        item.type === "video" ? (
          <VideoPlayer title={item.title} embedUrl={item.embedUrl} durationMinutes={item.durationMinutes} />
        ) : item.type === "podcast" ? (
          <MusicPlayerCard
            title={item.title}
            description={item.description}
            embedUrl={item.embedUrl}
            durationMinutes={item.durationMinutes}
          />
        ) : item.embedUrl === null ? (
          <GlassCard className="p-6 text-center">
            <p className="font-semibold text-amber-600">Em breve</p>
            <p className="mt-1 text-muted-foreground">{item.description}</p>
          </GlassCard>
        ) : (
          <GlassCard className="p-6">
            <iframe src={item.embedUrl} className="aspect-video w-full rounded-xl" allowFullScreen />
          </GlassCard>
        )
      )}

      <CompleteContentButton
        token={params.token}
        contentId={item.id}
        initiallyCompleted={!!existingCompletion}
      />

      <ShareLinks url={base} text={item.title} />
    </div>
  );
}
