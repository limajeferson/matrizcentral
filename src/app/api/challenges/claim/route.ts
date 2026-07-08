import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isTokenExpired } from "@/lib/tokens";
import { getCurrentChallenge, getIsoWeekKey } from "@/lib/challenges";
import { grantBadges } from "@/lib/grant-badges";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const token = body?.token as string | undefined;

  if (!token) {
    return NextResponse.json({ error: "payload inválido" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { data: tokenRow } = await supabase
    .from("tokens")
    .select("purchase_id, valid_until")
    .eq("token", token)
    .maybeSingle();

  if (!tokenRow || isTokenExpired(tokenRow.valid_until)) {
    return NextResponse.json({ error: "token não encontrado" }, { status: 404 });
  }

  const { data: purchase } = await supabase
    .from("purchases")
    .select("user_id")
    .eq("id", tokenRow.purchase_id)
    .single();

  if (!purchase) {
    return NextResponse.json({ error: "compra não encontrada" }, { status: 404 });
  }

  const now = new Date();
  const weekKey = getIsoWeekKey(now);
  const challenge = getCurrentChallenge(now);

  const weekStart = new Date(now);
  weekStart.setUTCDate(weekStart.getUTCDate() - 7);

  const { data: relevantEvents } = await supabase
    .from("xp_events")
    .select("id, action_type, created_at")
    .eq("user_id", purchase.user_id)
    .eq("action_type", challenge.targetActionType)
    .gte("created_at", weekStart.toISOString());

  const progress = (relevantEvents ?? []).length;

  if (progress < challenge.targetCount) {
    return NextResponse.json(
      { error: "desafio ainda não concluído", progress, target: challenge.targetCount },
      { status: 409 }
    );
  }

  const { data: existingClaim } = await supabase
    .from("challenge_claims")
    .select("id")
    .eq("user_id", purchase.user_id)
    .eq("week_key", weekKey)
    .maybeSingle();

  if (existingClaim) {
    return NextResponse.json({ error: "desafio já resgatado esta semana" }, { status: 409 });
  }

  await supabase.from("challenge_claims").insert({
    user_id: purchase.user_id,
    week_key: weekKey,
    challenge_id: challenge.id,
  });

  await supabase.from("xp_events").insert({
    user_id: purchase.user_id,
    xp_amount: challenge.xpReward,
    action_type: "desafio",
    reference_id: `${weekKey}:${challenge.id}`,
  });

  await grantBadges(supabase, purchase.user_id);

  return NextResponse.json({ ok: true, xpAwarded: challenge.xpReward });
}
