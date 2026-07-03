import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isTokenExpired } from "@/lib/tokens";

const EBOOK_PATH = path.join(process.cwd(), "content", "ebooks", "ebook_llm_local_matrizcentral.md");

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "token é obrigatório" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { data: tokenRow } = await supabase
    .from("tokens")
    .select("valid_until, purchase_id")
    .eq("token", token)
    .maybeSingle();

  if (!tokenRow || isTokenExpired(tokenRow.valid_until)) {
    return NextResponse.json({ error: "token inválido ou expirado" }, { status: 404 });
  }

  const { data: purchase } = await supabase
    .from("purchases")
    .select("id, downloaded, user_id")
    .eq("id", tokenRow.purchase_id)
    .single();

  if (!purchase) {
    return NextResponse.json({ error: "compra não encontrada" }, { status: 404 });
  }

  if (!purchase.downloaded) {
    await supabase.from("purchases").update({ downloaded: true }).eq("id", purchase.id);
    await supabase.from("xp_events").insert({
      user_id: purchase.user_id,
      xp_amount: 25,
      action_type: "download",
      reference_id: purchase.id,
    });
  }

  const content = await readFile(EBOOK_PATH, "utf-8");

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": 'attachment; filename="llm-local.md"',
    },
  });
}
