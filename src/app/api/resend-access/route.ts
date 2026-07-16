import { NextRequest, NextResponse } from "next/server";
import { isValidEmail } from "@/lib/email-validation";
import { resendAccessByEmail } from "@/lib/access";
import { createRateLimiter } from "@/lib/rate-limit";

// Rate limit simples em memória (custo zero): 1 reenvio por e-mail a cada 60s.
// Suficiente contra abuso/spam nesta rota de recuperação.
const limiter = createRateLimiter(60_000);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = body?.email;

  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    return NextResponse.json({ error: "e-mail inválido" }, { status: 400 });
  }

  if (!limiter.check(email, Date.now())) {
    // Resposta genérica: não revela se o e-mail existe nem se está em janela.
    return NextResponse.json({ ok: true });
  }

  // Best-effort e genérico: não vaza se o e-mail comprou ou não.
  await resendAccessByEmail(email);

  return NextResponse.json({ ok: true });
}
