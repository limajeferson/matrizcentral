import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isTokenExpired } from "@/lib/tokens";
import { CONTENT_HUB } from "@/data/content-hub";
import { grantContentXp } from "@/lib/content-xp";

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

  const xpAwarded = await grantContentXp(
    supabase,
    token,
    tokenRow.purchase_id,
    contentId,
    contentItem.xpReward
  );

  return NextResponse.json({ xpAwarded });
}
