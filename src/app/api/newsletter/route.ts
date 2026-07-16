import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isValidEmail } from "@/lib/email-validation";
import { createRateLimiter } from "@/lib/rate-limit";

const limiter = createRateLimiter(30_000);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = body?.email;

  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    return NextResponse.json({ error: "e-mail inválido" }, { status: 400 });
  }

  if (!limiter.check(email.toLowerCase(), Date.now())) {
    return NextResponse.json({ error: "aguarde um instante e tente de novo" }, { status: 429 });
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .upsert({ email: email.toLowerCase() }, { onConflict: "email", ignoreDuplicates: true });

  if (error) {
    return NextResponse.json(
      { error: "Não foi possível inscrever agora. Tente novamente." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
