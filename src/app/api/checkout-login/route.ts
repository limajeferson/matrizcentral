import { NextRequest, NextResponse } from "next/server";
import { resolveUserBySessionId } from "@/lib/access";
import { createSession, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/auth-session";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const sessionId = body?.sessionId;
  if (!sessionId || typeof sessionId !== "string") {
    return NextResponse.json({ error: "sessionId obrigatório" }, { status: 400 });
  }

  const resolved = await resolveUserBySessionId(sessionId);
  if (!resolved) {
    // Webhook ainda pode estar processando: o cliente tenta de novo.
    return NextResponse.json({ ready: false });
  }

  const secret = await createSession(resolved.userId);
  const res = NextResponse.json({ ready: true });
  res.cookies.set(SESSION_COOKIE, secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return res;
}
