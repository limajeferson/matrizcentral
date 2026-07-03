import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isTokenExpired } from "@/lib/tokens";
import RoadmapCard from "@/components/dashboard/RoadmapCard";
import QuizValidacaoContainer from "@/components/quiz/QuizValidacaoContainer";

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
        <a href={`/quiz/${params.token}`} className="text-blue-600 underline">
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
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="inline-block bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-lg font-bold text-yellow-900">
        ⭐ {totalXp} XP
      </div>

      <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
        <h1 className="font-bold text-green-900">Seu perfil: {profile.name}</h1>
        <p className="text-green-800">{profile.description}</p>
      </div>

      <RoadmapCard roadmap={profile.study_roadmap} />

      <div className="bg-blue-50 p-6 rounded-lg">
        <h2 className="font-bold mb-2">Seu primeiro ebook</h2>
        <a
          href={`/api/download?token=${params.token}`}
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded"
        >
          📥 Baixar Ebook LLM Local
        </a>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Quiz de Validação</h2>
        <QuizValidacaoContainer token={params.token} />
      </div>
    </div>
  );
}
