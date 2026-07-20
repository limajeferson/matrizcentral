import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isTokenExpired } from "@/lib/tokens";
import { createSession, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/auth-session";
import { createRateLimiter } from "@/lib/rate-limit";

// Rate limit por IP (custo zero): esta rota não tem e-mail no corpo (só o
// token), então não dá pra chavear por e-mail como em /api/resend-access —
// a chave possível aqui é o IP de origem. 1 tentativa a cada 5s por IP é
// suficiente pra frear varredura de tokens sem incomodar uso legítimo — mas
// o estado é em memória por instância (ver `createRateLimiter`), não
// compartilhado entre instâncias serverless, então é mitigação de abuso,
// não garantia distribuída.
const limiter = createRateLimiter(5_000);

/**
 * Ponte de resgate: quem comprou pelo fluxo antigo só tem o token da URL, não
 * conta. Esta rota resolve token → compra → usuário e cria a sessão de cookie
 * (mesmo padrão de `/entrar/verificar` e `/api/checkout-login`) para que ele
 * passe a acessar o leitor logado. NÃO invalida o token — `/dashboard/[token]`
 * ainda depende dele até a aposentadoria completa do fluxo de token. É o
 * endpoint mais poderoso do conjunto (troca token por sessão de 30 dias), por
 * isso tem rate limit por IP e Content-Type estrito (evita POST cross-site
 * via form, que ignoraria o preflight de CORS de um `fetch` com JSON).
 */
export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return NextResponse.json({ ok: false, error: "Content-Type inválido" }, { status: 415 });
  }

  // `req.ip` é preenchido pela própria Vercel (não vem de header do cliente);
  // `x-forwarded-for` é fornecido pelo requisitante e pode ser forjado — só
  // serve como fallback fora da Vercel (dev local, outro host).
  const ip =
    req.ip ||
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "desconhecido";
  if (!limiter.check(ip, Date.now())) {
    return NextResponse.json(
      { ok: false, error: "Muitas tentativas. Aguarde um instante e tente de novo." },
      { status: 429 }
    );
  }

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

  try {
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
  } catch (err) {
    // Token válido, mas o banco falhou ao criar a sessão — não é "token
    // inválido" (isso confundiria um cliente pagante), é um erro nosso.
    console.error("Falha ao criar sessão no resgate:", err);
    return NextResponse.json(
      { ok: false, error: "Não foi possível confirmar seu acesso agora. Tente novamente." },
      { status: 500 }
    );
  }
}
