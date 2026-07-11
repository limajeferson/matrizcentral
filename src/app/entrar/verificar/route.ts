import { NextRequest, NextResponse } from "next/server";
import {
  verifyMagicLink,
  createSession,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth-session";
import { safeNextPath } from "@/lib/safe-redirect";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("c");
  const next = safeNextPath(req.nextUrl.searchParams.get("next"));

  if (!secret) {
    return NextResponse.redirect(new URL("/entrar?erro=link", req.url));
  }

  const user = await verifyMagicLink(secret);
  if (!user) {
    return NextResponse.redirect(new URL("/entrar?erro=link", req.url));
  }

  const sessionSecret = await createSession(user.id);
  const res = NextResponse.redirect(new URL(next, req.url));
  res.cookies.set(SESSION_COOKIE, sessionSecret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return res;
}
