import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-session";
import { parseNewPost, createPost } from "@/lib/feed-posts";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "não autenticado" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = parseNewPost(body);
  if (!parsed) return NextResponse.json({ error: "post inválido" }, { status: 400 });
  const post = await createPost(user.id, parsed);
  if (!post) return NextResponse.json({ error: "falha ao publicar" }, { status: 500 });
  return NextResponse.json({ post });
}
