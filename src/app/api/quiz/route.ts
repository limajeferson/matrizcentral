import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  scoreTriagem,
  scoreValidacao,
  type TriagemAnswer,
  type ValidacaoAnswer,
} from "@/lib/quiz-scoring";
import { QUIZ_TRIAGEM } from "@/data/quiz-triagem";
import { QUIZ_LLM_LOCAL, QUIZ_CONFIG } from "@/data/quiz-llm-local";
import { grantBadges } from "@/lib/grant-badges";
import { notifyLevelUpIfNeeded } from "@/lib/notify-level-up";
import { issueCertificateForToken } from "@/lib/issue-certificate";
import { isTokenExpired } from "@/lib/tokens";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const token = body?.token;
  const quizType = body?.quizType;

  if (!token || (quizType !== "triagem" && quizType !== "validacao")) {
    return NextResponse.json({ error: "payload inválido" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  const { data: tokenRow } = await supabase
    .from("tokens")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (!tokenRow || isTokenExpired(tokenRow.valid_until)) {
    return NextResponse.json({ error: "token não encontrado" }, { status: 404 });
  }

  if (quizType === "triagem") {
    if (tokenRow.triaged) {
      return NextResponse.json({ error: "triagem já realizada" }, { status: 409 });
    }

    const answers = (body.answers ?? []) as TriagemAnswer[];
    const rows = answers.map((answer) => ({
      token,
      quiz_type: "triagem" as const,
      question_id: answer.questionId,
      answer: JSON.stringify(answer.selectedOptionIndexes),
    }));
    if (rows.length > 0) {
      await supabase.from("quiz_responses").insert(rows);
    }

    const profileId = scoreTriagem(QUIZ_TRIAGEM, answers);

    const { error: triageError } = await supabase
      .from("tokens")
      .update({ profile_id: profileId, triaged: true, triaged_at: new Date().toISOString() })
      .eq("token", token);
    if (triageError) {
      console.error("Falha ao marcar triagem no token:", triageError);
      return NextResponse.json({ error: "não foi possível salvar a triagem" }, { status: 500 });
    }

    const { data: purchase } = await supabase
      .from("purchases")
      .select("user_id")
      .eq("id", tokenRow.purchase_id)
      .single();

    if (purchase) {
      await supabase.from("xp_events").upsert(
        {
          user_id: purchase.user_id,
          xp_amount: 50,
          action_type: "triagem",
          reference_id: token,
        },
        { onConflict: "user_id,action_type,reference_id", ignoreDuplicates: true }
      );
      await grantBadges(supabase, purchase.user_id);
    }

    return NextResponse.json({ profileId });
  }

  // Validação: a nota é recalculada AQUI, no servidor, a partir das respostas
  // enviadas. Nunca confiar em `passed`/`score` do cliente (forjaria o
  // certificado). O cliente envia apenas `answers: [{ questionId, selected }]`.
  const answers = (body.answers ?? []) as ValidacaoAnswer[];
  const result = scoreValidacao(QUIZ_LLM_LOCAL, answers, QUIZ_CONFIG.passingScore);

  const responseRows = result.graded.map((g) => ({
    token,
    quiz_type: "validacao" as const,
    question_id: g.questionId,
    answer: g.selected,
    is_correct: g.isCorrect,
  }));
  if (responseRows.length > 0) {
    await supabase.from("quiz_responses").insert(responseRows);
  }

  if (result.passed) {
    const { data: purchase } = await supabase
      .from("purchases")
      .select("user_id")
      .eq("id", tokenRow.purchase_id)
      .single();

    if (purchase) {
      const { data: existingXpEvent } = await supabase
        .from("xp_events")
        .select("id")
        .eq("user_id", purchase.user_id)
        .eq("action_type", "validacao")
        .eq("reference_id", token)
        .maybeSingle();

      if (!existingXpEvent) {
        await supabase.from("xp_events").upsert(
          {
            user_id: purchase.user_id,
            xp_amount: 100,
            action_type: "validacao",
            reference_id: token,
          },
          { onConflict: "user_id,action_type,reference_id", ignoreDuplicates: true }
        );
        await grantBadges(supabase, purchase.user_id);
        await notifyLevelUpIfNeeded(supabase, purchase.user_id, 100);
      }

      // Gatilho 2 de emissão do certificado (o outro é concluir missao_final
      // em /api/roadmap/complete). Cobre quem conclui a trilha ANTES do quiz.
      await issueCertificateForToken(supabase, {
        userId: purchase.user_id,
        token,
        profileId: tokenRow.profile_id,
      });
    }
  }

  return NextResponse.json({ ok: true, score: result.scorePercent, passed: result.passed });
}
