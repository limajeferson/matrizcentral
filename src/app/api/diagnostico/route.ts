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

  // Grava o perfil na conta e CHECA o erro — nunca finge sucesso (era a
  // causa-raiz do loop pós-compra). Re-diagnóstico atualiza o perfil.
  const { error: updateError } = await supabase
    .from("users")
    .update({ profile_id: profileId })
    .eq("id", user.id);
  if (updateError) {
    console.error("Falha ao gravar diagnóstico na conta:", updateError);
    return NextResponse.json({ error: "não foi possível salvar" }, { status: 500 });
  }

  // XP concedido no MÁXIMO uma vez, de forma atômica: só quem "reivindicar"
  // diagnosed_at (null -> agora) num único UPDATE condicional ganha o XP.
  // Duplo-clique concorrente não duplica (mesmo idioma do uso-único do magic
  // link em auth-session).
  const { data: claimed } = await supabase
    .from("users")
    .update({ diagnosed_at: new Date().toISOString() })
    .eq("id", user.id)
    .is("diagnosed_at", null)
    .select("id")
    .maybeSingle();

  if (claimed) {
    const { error: xpError } = await supabase.from("xp_events").upsert(
      {
        user_id: user.id,
        xp_amount: 50,
        action_type: "triagem",
        reference_id: user.id,
      },
      { onConflict: "user_id,action_type,reference_id", ignoreDuplicates: true }
    );
    if (xpError) {
      console.error("Falha ao conceder XP de diagnóstico (perfil já salvo):", xpError);
    }
  }

  return NextResponse.json({ profileId });
}
