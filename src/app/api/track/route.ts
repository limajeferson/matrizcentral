import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { createRateLimiter } from "@/lib/rate-limit";
import { validateTrackInput } from "@/lib/funnel";

export const dynamic = "force-dynamic";

const ANON_COOKIE = "mc_anon";
const ANON_MAX_AGE = 60 * 60 * 24 * 365;
// 1 evento por segundo por visitante: mata loop de render sem perder o funil.
const limiter = createRateLimiter(1_000);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = validateTrackInput(body);
  // Métrica nunca quebra a experiência: erro de payload responde 204 e some.
  if (!parsed.ok) return new NextResponse(null, { status: 204 });

  const jar = cookies();
  let anonId = jar.get(ANON_COOKIE)?.value;
  const isNew = !anonId;
  if (!anonId) anonId = globalThis.crypto.randomUUID();

  if (!limiter.check(anonId, Date.now())) {
    return new NextResponse(null, { status: 204 });
  }

  const supabase = getSupabaseServerClient();
  await supabase.from("funnel_events").insert({
    event: parsed.value.event,
    anon_id: anonId,
    path: parsed.value.path,
    referrer: parsed.value.referrer,
    meta: parsed.value.meta,
  });

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
}
