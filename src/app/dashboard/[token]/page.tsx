import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isTokenExpired } from "@/lib/tokens";
import RoadmapCard from "@/components/dashboard/RoadmapCard";
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
        Complete primeiro a{" "}
        <a href={`/quiz/${params.token}`} className="text-violet-600 underline">
          triagem de perfil
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

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <CategoryBadge variant="xp" className="text-sm">
        ⭐ {totalXp} XP
      </CategoryBadge>

      <GlassCard className="p-6">
        <div className="mb-2 flex items-center gap-2">
          <CategoryBadge variant="roadmap">Perfil</CategoryBadge>
        </div>
        <h1 className="text-2xl font-bold text-zinc-900">{profile.name}</h1>
        <p className="text-zinc-600">{profile.description}</p>
      </GlassCard>

      <GlassCard className="p-6">
        <RoadmapCard roadmap={profile.study_roadmap} />
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

      <div>
        <div className="mb-4 flex items-center gap-2">
          <CategoryBadge variant="quiz">Validação</CategoryBadge>
          <h2 className="text-xl font-bold text-zinc-900">Quiz de Validação</h2>
        </div>
        <QuizValidacaoContainer token={params.token} />
      </div>
    </div>
  );
}
