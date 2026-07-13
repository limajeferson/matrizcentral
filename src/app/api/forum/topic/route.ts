import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-session";
import { getAccessContext } from "@/lib/entitlement-access";
import { isSubscriber, validateTopicInput } from "@/lib/forum";
import { createTopic } from "@/lib/forum-data";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  const { access } = await getAccessContext(user.id);
  if (!isSubscriber(access)) return NextResponse.json({ error: "é preciso um passe ativo" }, { status: 403 });
  const body = await req.json().catch(() => null);
  const v = validateTopicInput({ title: body?.title, body: body?.body });
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });
  const id = await createTopic(user.id, body.title, body.body);
  if (!id) return NextResponse.json({ error: "não foi possível criar o tópico" }, { status: 500 });
  return NextResponse.json({ id });
}
