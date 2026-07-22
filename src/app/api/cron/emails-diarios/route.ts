import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { computeDueEmails } from "@/lib/email-cycle";
import { sendNewCycleEmail, sendExpiryEmail } from "@/lib/email";
import { CAPACITY_PATHS, type CapacityTier } from "@/lib/capacity";

/** Valida o valor cru do banco contra os 3 tiers — nunca `as CapacityTier` cego. */
function toCapacityTier(value: string | null | undefined): CapacityTier | undefined {
  return value != null && value in CAPACITY_PATHS ? (value as CapacityTier) : undefined;
}

export async function GET(req: NextRequest) {
  // Se CRON_SECRET não estiver setado, nega tudo (evita passar com "Bearer undefined").
  if (!process.env.CRON_SECRET || req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }

  const supabase = getSupabaseServerClient();
  const now = new Date();

  const { data: ents } = await supabase
    .from("entitlements").select("user_id, plan, starts_at, expires_at").gt("expires_at", now.toISOString());
  const { data: sent } = await supabase.from("sent_emails").select("user_id, email_type, reference");

  const due = computeDueEmails(ents ?? [], sent ?? [], now);
  if (due.length === 0) return NextResponse.json({ sent: 0 });

  const userIds = Array.from(new Set(due.map((d) => d.user_id)));
  const { data: users } = await supabase.from("users").select("id, email, capacity_tier").in("id", userIds);
  const userById = new Map((users ?? []).map((u) => [u.id, u]));

  let count = 0;
  for (const d of due) {
    const u = userById.get(d.user_id);
    const to = u?.email;
    if (!to) continue;
    try {
      if (d.email_type === "novo_ciclo") await sendNewCycleEmail({ to, tier: toCapacityTier(u?.capacity_tier) });
      else await sendExpiryEmail({ to, daysLeft: d.reference === "expiry-1d" ? 1 : 7 });
      // Grava DEPOIS do envio (falha → retenta amanhã; unique evita duplicata).
      await supabase.from("sent_emails").insert({ user_id: d.user_id, email_type: d.email_type, reference: d.reference });
      count++;
    } catch (err) {
      console.error("Falha ao enviar e-mail de ciclo:", d, err);
    }
  }
  return NextResponse.json({ sent: count });
}
