import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isTokenExpired } from "@/lib/tokens";
import { CONTENT_HUB } from "@/data/content-hub";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const token = body?.token;
  const contentId = body?.contentId;

  if (!token || !contentId) {
    return NextResponse.json({ error: "payload inválido" }, { status: 400 });
  }

  const contentItem = CONTENT_HUB.find((item) => item.id === contentId);
  if (!contentItem) {
    return NextResponse.json({ error: "conteúdo não encontrado" }, { status: 400 });
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

  const { data: existingCompletion } = await supabase
    .from("content_completions")
    .select("id")
    .eq("token", token)
    .eq("content_id", contentId)
    .maybeSingle();

  if (existingCompletion) {
    return NextResponse.json({ xpAwarded: 0 });
  }

  await supabase.from("content_completions").insert({ token, content_id: contentId });

  const { data: purchase } = await supabase
    .from("purchases")
    .select("user_id")
    .eq("id", tokenRow.purchase_id)
    .single();

  if (purchase) {
    await supabase.from("xp_events").insert({
      user_id: purchase.user_id,
      xp_amount: contentItem.xpReward,
      action_type: "conteudo",
      reference_id: contentId,
    });
  }

  return NextResponse.json({ xpAwarded: contentItem.xpReward });
}
