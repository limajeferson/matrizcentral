import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { sendNewContentEmail } from "@/lib/email";
import { toCapacityTier } from "@/lib/capacity";

export async function POST(req: NextRequest) {
  if (!process.env.CRON_SECRET || req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const contentTitle = body?.contentTitle;
  if (!contentTitle || typeof contentTitle !== "string") {
    return NextResponse.json({ error: "contentTitle é obrigatório" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const now = new Date().toISOString();
  const { data: ents } = await supabase
    .from("entitlements").select("user_id").eq("plan", "advanced").gt("expires_at", now);
  const userIds = Array.from(new Set((ents ?? []).map((e) => e.user_id)));
  if (userIds.length === 0) return NextResponse.json({ sent: 0 });

  const { data: users } = await supabase.from("users").select("email, capacity_tier").in("id", userIds);
  let count = 0;
  for (const u of users ?? []) {
    try { await sendNewContentEmail({ to: u.email, contentTitle, tier: toCapacityTier(u.capacity_tier) }); count++; }
    catch (err) { console.error("Falha ao avisar novo conteúdo:", u.email, err); }
  }
  return NextResponse.json({ sent: count });
}
