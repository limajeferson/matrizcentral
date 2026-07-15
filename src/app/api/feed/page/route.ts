import { NextRequest, NextResponse } from "next/server";
import { listPosts } from "@/lib/feed-posts";
import { postEntries } from "@/lib/feed-timeline";

const PAGE = 15;

/**
 * Próxima página do timeline. Pagina APENAS posts (fluxo ilimitado de usuários);
 * threads e conteúdo do hub são finitos e vão na 1ª carga do server component.
 * `before` = cursor ISO (created_at do post mais antigo já exibido).
 */
export async function GET(req: NextRequest) {
  const before = req.nextUrl.searchParams.get("before") || undefined;
  const posts = await listPosts(PAGE, before);
  const nextCursor = posts.length === PAGE ? posts[posts.length - 1].created_at : null;
  return NextResponse.json({ entries: postEntries(posts), nextCursor });
}
