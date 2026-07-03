import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { scoreTriagem, type TriagemAnswer } from "@/lib/quiz-scoring";
import { QUIZ_TRIAGEM } from "@/data/quiz-triagem";

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

  if (!tokenRow) {
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

    await supabase
      .from("tokens")
      .update({ profile_id: profileId, triaged: true, triaged_at: new Date().toISOString() })
      .eq("token", token);

    const { data: purchase } = await supabase
      .from("purchases")
      .select("user_id")
      .eq("id", tokenRow.purchase_id)
      .single();

    if (purchase) {
      await supabase.from("xp_events").insert({
        user_id: purchase.user_id,
        xp_amount: 50,
        action_type: "triagem",
        reference_id: token,
      });
    }

    return NextResponse.json({ profileId });
  }

  const score = body.score as number;
  const passed = body.passed as boolean;

  if (passed) {
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
        await supabase.from("xp_events").insert({
          user_id: purchase.user_id,
          xp_amount: 100,
          action_type: "validacao",
          reference_id: token,
        });
      }
    }
  }

  return NextResponse.json({ ok: true, score, passed });
}
