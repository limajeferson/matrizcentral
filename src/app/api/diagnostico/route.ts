import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-session";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { scoreTriagem } from "@/lib/quiz-scoring";
import { QUIZ_TRIAGEM } from "@/data/quiz-triagem";
import { parseTriagemAnswers } from "@/lib/diagnosis";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "não autenticado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const answers = parseTriagemAnswers(body?.answers);
  if (!answers) {
    return NextResponse.json({ error: "respostas inválidas" }, { status: 400 });
  }

  const profileId = scoreTriagem(QUIZ_TRIAGEM, answers);
  const supabase = getSupabaseServerClient();

  // Grava o perfil na CONTA e CHECA o erro — nunca finge sucesso (era a
  // causa-raiz do loop pós-compra no fluxo antigo).
  const { error: updateError } = await supabase
    .from("users")
    .update({ profile_id: profileId, diagnosed_at: new Date().toISOString() })
    .eq("id", user.id);
  if (updateError) {
    console.error("Falha ao gravar diagnóstico na conta:", updateError);
    return NextResponse.json({ error: "não foi possível salvar" }, { status: 500 });
  }

  // XP de diagnóstico, idempotente por usuário (só a primeira vez).
  const { data: existingXp } = await supabase
    .from("xp_events")
    .select("id")
    .eq("user_id", user.id)
    .eq("action_type", "triagem")
    .maybeSingle();
  if (!existingXp) {
    await supabase.from("xp_events").insert({
      user_id: user.id,
      xp_amount: 50,
      action_type: "triagem",
      reference_id: user.id,
    });
  }

  return NextResponse.json({ profileId });
}
