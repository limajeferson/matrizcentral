import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { WaitlistPlanId } from "@/types";
import { createRateLimiter } from "@/lib/rate-limit";

const VALID_PLAN_IDS: WaitlistPlanId[] = ["mensal_97", "anual_497"];
const limiter = createRateLimiter(30_000);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = body?.email;
  const planId = body?.planId;

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "email é obrigatório" }, { status: 400 });
  }

  if (!limiter.check(email.toLowerCase(), Date.now())) {
    return NextResponse.json({ error: "aguarde um instante e tente de novo" }, { status: 429 });
  }

  if (!VALID_PLAN_IDS.includes(planId)) {
    return NextResponse.json({ error: "plano inválido" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("plan_waitlist").insert({ email, plan_id: planId });

  if (error) {
    return NextResponse.json(
      { error: "Não foi possível registrar seu interesse. Tente novamente." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
