import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-session";
import { getAccessContext } from "@/lib/entitlement-access";
import { isSubscriber, validateReplyInput } from "@/lib/forum";
import { createReply } from "@/lib/forum-data";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  const { access } = await getAccessContext(user.id);
  if (!isSubscriber(access)) return NextResponse.json({ error: "é preciso um passe ativo" }, { status: 403 });
  const body = await req.json().catch(() => null);
  const topicId = body?.topicId;
  if (!topicId || typeof topicId !== "string") return NextResponse.json({ error: "tópico inválido" }, { status: 400 });
  const v = validateReplyInput({ body: body?.body });
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });
  const ok = await createReply(user.id, topicId, body.body);
  if (!ok) return NextResponse.json({ error: "não foi possível responder" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
