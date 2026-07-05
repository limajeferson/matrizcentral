import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const token = body?.token as string | undefined;
  const stageKey = body?.stageKey as string | undefined;

  if (!token || !stageKey) {
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

  await supabase.from("roadmap_progress").upsert({ token, stage_key: stageKey });

  const { data: purchase } = await supabase
    .from("purchases")
    .select("user_id")
    .eq("id", tokenRow.purchase_id)
    .single();

  if (purchase) {
    const referenceId = `${token}:${stageKey}`;

    const { data: existingXpEvent } = await supabase
      .from("xp_events")
      .select("id")
      .eq("user_id", purchase.user_id)
      .eq("action_type", "roadmap")
      .eq("reference_id", referenceId)
      .maybeSingle();

    if (!existingXpEvent) {
      await supabase.from("xp_events").insert({
        user_id: purchase.user_id,
        xp_amount: 50,
        action_type: "roadmap",
        reference_id: referenceId,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
