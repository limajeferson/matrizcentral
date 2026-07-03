import { readFile } from "fs/promises";
import path from "path";
import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isTokenExpired } from "@/lib/tokens";
import { CONTENT_HUB } from "@/data/content-hub";
import GlassCard from "@/components/ui/glass-card";
import CategoryBadge from "@/components/ui/category-badge";
import CompleteContentButton from "@/components/content/CompleteContentButton";

function renderMarkdown(source: string) {
  return source.split("\n").map((line, index) => {
    if (line.startsWith("# ")) {
      return (
        <h1 key={index} className="mt-6 text-2xl font-bold text-zinc-900">
          {line.slice(2)}
        </h1>
      );
    }
    if (line.startsWith("## ")) {
      return (
        <h2 key={index} className="mt-5 text-xl font-bold text-zinc-900">
          {line.slice(3)}
        </h2>
      );
    }
    if (line.startsWith("### ")) {
      return (
        <h3 key={index} className="mt-4 text-lg font-semibold text-zinc-900">
          {line.slice(4)}
        </h3>
      );
    }
    if (line.startsWith("- ")) {
      return (
        <li key={index} className="ml-5 list-disc text-zinc-700">
          {line.slice(2)}
        </li>
      );
    }
    if (line.trim() === "") {
      return null;
    }
    return (
      <p key={index} className="mt-2 text-zinc-700">
        {line}
      </p>
    );
  });
}

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

  const { data: existingCompletion } = await supabase
    .from("content_completions")
    .select("id")
    .eq("token", params.token)
    .eq("content_id", item.id)
    .maybeSingle();

  const body = item.bodyPath
    ? await readFile(path.join(process.cwd(), item.bodyPath), "utf-8")
    : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <CategoryBadge variant="hub">{item.title}</CategoryBadge>
      <p className="text-sm text-zinc-500">
        {item.durationMinutes} min · +{item.xpReward} XP
      </p>

      {body && (
        <GlassCard className="p-6">
          <div>{renderMarkdown(body)}</div>
        </GlassCard>
      )}

      {!body && item.embedUrl === null && (
        <GlassCard className="p-6 text-center">
          <p className="font-semibold text-amber-600">Em breve 🎧</p>
          <p className="mt-1 text-zinc-600">{item.description}</p>
        </GlassCard>
      )}

      {!body && item.embedUrl && (
        <GlassCard className="p-6">
          <iframe src={item.embedUrl} className="aspect-video w-full rounded-xl" allowFullScreen />
        </GlassCard>
      )}

      <CompleteContentButton
        token={params.token}
        contentId={item.id}
        initiallyCompleted={!!existingCompletion}
      />
    </div>
  );
}
