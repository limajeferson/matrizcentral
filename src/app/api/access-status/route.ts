import { NextRequest, NextResponse } from "next/server";
import { resolveQuizUrlBySessionId } from "@/lib/access";

// Consultada pela página de sucesso (via polling) para revelar o link de
// acesso assim que o webhook terminar de criar o token.
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ ready: false }, { status: 400 });
  }

  const quizUrl = await resolveQuizUrlBySessionId(sessionId);
  return NextResponse.json({ ready: Boolean(quizUrl), quizUrl: quizUrl ?? undefined });
}
