import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isTokenExpired } from "@/lib/tokens";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const token = body?.token as string | undefined;
  const optIn = body?.optIn as boolean | undefined;
  const displayName = (body?.displayName as string | undefined)?.trim();

  if (!token || typeof optIn !== "boolean") {
    return NextResponse.json({ error: "payload inválido" }, { status: 400 });
  }

  if (optIn && (!displayName || displayName.length < 2)) {
    return NextResponse.json(
      { error: "informe um nome de exibição com pelo menos 2 caracteres" },
      { status: 400 }
    );
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

  await supabase
    .from("users")
    .update({
      leaderboard_opt_in: optIn,
      display_name: optIn ? displayName : null,
    })
    .eq("id", purchase.user_id);

  return NextResponse.json({ ok: true });
}
