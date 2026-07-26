import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { createRateLimiter } from "@/lib/rate-limit";
import { validateTrackInput } from "@/lib/funnel";

export const dynamic = "force-dynamic";

const ANON_COOKIE = "mc_anon";
const ANON_MAX_AGE = 60 * 60 * 24 * 365;
// 1 evento por segundo por chave: mata loop/curl sem perder o funil. A chave é
// IP+evento (não anonId): sem cookie, cada request sem `mc_anon` cunhava um
// UUID novo e o limiter nunca via a mesma chave duas vezes — não limitava
// nada. IP+evento também evita descartar dois eventos DIFERENTES do mesmo
// visitante que aconteçam no mesmo segundo (ex.: oferta_view -> checkout_start
// de quem clica rápido), que a chave antiga (só anonId) apagava.
const limiter = createRateLimiter(1_000);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = validateTrackInput(body);
    // Métrica nunca quebra a experiência: erro de payload responde 204 e some.
    if (!parsed.ok) return new NextResponse(null, { status: 204 });

    // `x-forwarded-for` é fornecido pelo requisitante e pode ser forjado; para
    // rate limit de abuso (não controle de acesso) isso é aceitável.
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "desconhecido";
    if (!limiter.check(`${ip}:${parsed.value.event}`, Date.now())) {
      return new NextResponse(null, { status: 204 });
    }

    const jar = cookies();
    let anonId = jar.get(ANON_COOKIE)?.value;
    const isNew = !anonId;
    if (!anonId) anonId = globalThis.crypto.randomUUID();

    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from("funnel_events").insert({
      event: parsed.value.event,
      anon_id: anonId,
      path: parsed.value.path,
      referrer: parsed.value.referrer,
      meta: parsed.value.meta,
    });
    // Falha de RLS/env/schema cache não pode ser indistinguível de "sem
    // tráfego" — logar pra aparecer nos logs da Vercel (docs/LICOES.md L-041/L-043).
    if (error) console.error("[api/track]", error.message);

    const res = new NextResponse(null, { status: 204 });
    if (isNew) {
      res.cookies.set(ANON_COOKIE, anonId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: ANON_MAX_AGE,
      });
    }
    return res;
  } catch (error) {
    // Métrica nunca quebra a experiência do usuário: sempre 204, mas o erro
    // vai pro log em vez de sumir em silêncio.
    console.error("[api/track]", error instanceof Error ? error.message : error);
    return new NextResponse(null, { status: 204 });
  }
}
