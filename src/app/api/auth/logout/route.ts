import { NextResponse } from "next/server";
import { revokeCurrentSession, SESSION_COOKIE } from "@/lib/auth-session";

export async function POST() {
  await revokeCurrentSession();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
