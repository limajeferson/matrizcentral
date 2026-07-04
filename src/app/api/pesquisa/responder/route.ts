import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isTokenExpired } from "@/lib/tokens";
import { CONTENT_HUB } from "@/data/content-hub";
import { grantContentXp } from "@/lib/content-xp";

export interface SurveyTally {
  optionId: string;
  count: number;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const token = body?.token;
  const surveyId = body?.surveyId;
  const optionId = body?.optionId;

  if (!token || !surveyId || !optionId) {
    return NextResponse.json({ error: "payload inválido" }, { status: 400 });
  }

  const survey = CONTENT_HUB.find((item) => item.id === surveyId && item.type === "pesquisa");
  if (!survey || !survey.surveyOptions?.some((option) => option.id === optionId)) {
    return NextResponse.json({ error: "pesquisa ou opção inválida" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  const { data: tokenRow } = await supabase
    .from("tokens")
    .select("purchase_id, valid_until")
    .eq("token", token)
    .maybeSingle();

  if (!tokenRow || isTokenExpired(tokenRow.valid_until)) {
    return NextResponse.json({ error: "token inválido ou expirado" }, { status: 404 });
  }

  const { data: existingResponse } = await supabase
    .from("survey_responses")
    .select("id")
    .eq("token", token)
    .eq("survey_id", surveyId)
    .maybeSingle();

  if (!existingResponse) {
    await supabase.from("survey_responses").insert({ token, survey_id: surveyId, option_id: optionId });
  }

  await grantContentXp(supabase, token, tokenRow.purchase_id, surveyId, survey.xpReward);

  const { data: allResponses } = await supabase
    .from("survey_responses")
    .select("option_id")
    .eq("survey_id", surveyId);

  const tally: SurveyTally[] = survey.surveyOptions.map((option) => ({
    optionId: option.id,
    count: (allResponses ?? []).filter((row: { option_id: string }) => row.option_id === option.id).length,
  }));

  return NextResponse.json({ tally });
}
