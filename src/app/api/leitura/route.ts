import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-session";
import { recordRead } from "@/lib/reader-data";
import { READER_CONTENT_IDS } from "@/data/reader-docs";
import { createRateLimiter } from "@/lib/rate-limit";

// Uma seção a cada 2s por usuário: leitura humana passa; varredura sequencial não.
const limiter = createRateLimiter(2000);

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "não autenticado" }, { status: 401 });

    const body = await req.json().catch(() => null);
    const contentId = typeof body?.contentId === "string" ? body.contentId : null;
    const slug = typeof body?.slug === "string" ? body.slug : null;
    const index = Number.isInteger(body?.index) ? (body.index as number) : null;
    if (!contentId || !slug || index === null || index < 0) {
      return NextResponse.json({ error: "payload inválido" }, { status: 400 });
    }
    // Só aceita conteúdo que existe no registro — impede poluir o livro-razão.
    if (!READER_CONTENT_IDS.has(contentId)) {
      return NextResponse.json({ error: "conteúdo desconhecido" }, { status: 400 });
    }
    if (!limiter.check(user.id, Date.now())) {
      return NextResponse.json({ ok: true }); // silencioso: não é erro do usuário
    }
    await recordRead(user.id, contentId, slug, index);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/leitura", e);
    return NextResponse.json({ error: "erro interno" }, { status: 500 });
  }
}
