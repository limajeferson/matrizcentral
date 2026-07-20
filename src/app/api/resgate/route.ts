import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isTokenExpired } from "@/lib/tokens";
import { createSession, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/auth-session";

/**
 * Ponte de resgate: quem comprou pelo fluxo antigo só tem o token da URL, não
 * conta. Esta rota resolve token → compra → usuário e cria a sessão de cookie
 * (mesmo padrão de `/entrar/verificar` e `/api/checkout-login`) para que ele
 * passe a acessar o leitor logado. NÃO invalida o token — `/dashboard/[token]`
 * ainda depende dele até a aposentadoria completa do fluxo de token.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : null;
  if (!token) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { data: tokenRow } = await supabase
    .from("tokens")
    .select("valid_until, purchase_id")
    .eq("token", token)
    .maybeSingle();

  if (!tokenRow || isTokenExpired(tokenRow.valid_until)) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const { data: purchase } = await supabase
    .from("purchases")
    .select("user_id")
    .eq("id", tokenRow.purchase_id)
    .maybeSingle();

  if (!purchase) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const secret = await createSession(purchase.user_id);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return res;
}
