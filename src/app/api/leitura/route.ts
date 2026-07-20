import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getSessionUser } from "@/lib/auth-session";
import { canRead, recordRead } from "@/lib/reader-data";
import { findDocByContentId, type ReaderDoc } from "@/data/reader-docs";
import { parseMarkdown } from "@/lib/markdown";
import { splitIntoSections, type ReaderSection } from "@/lib/reader";
import { createRateLimiter } from "@/lib/rate-limit";

// Uma seção a cada 2s por usuário: leitura humana passa; varredura sequencial não.
const limiter = createRateLimiter(2000);

// Cache em memória das seções por doc: o markdown só muda em deploy novo, então
// reler+reparsear em toda requisição é custo sem benefício. Mesma ressalva do
// rate-limit acima — cache por instância, não compartilhado entre instâncias
// serverless — mas isso é inofensivo aqui: o pior caso é outra instância
// recomputar a partir do mesmo arquivo estático, nunca servir seção obsoleta.
const sectionsCache = new Map<string, ReaderSection[]>();

async function getDocSections(doc: ReaderDoc): Promise<ReaderSection[]> {
  const cached = sectionsCache.get(doc.bodyPath);
  if (cached) return cached;
  const source = await readFile(path.join(process.cwd(), doc.bodyPath), "utf-8");
  const sections = splitIntoSections(parseMarkdown(source));
  sectionsCache.set(doc.bodyPath, sections);
  return sections;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "não autenticado" }, { status: 401 });

    const body = await req.json().catch(() => null);
    const contentId = typeof body?.contentId === "string" ? body.contentId : null;
    const slug = typeof body?.slug === "string" ? body.slug : null;
    const index = Number.isInteger(body?.index) ? (body.index as number) : null;
    const skipProgress = body?.skipProgress === true;
    if (!contentId || !slug || index === null || index < 0) {
      return NextResponse.json({ error: "payload inválido" }, { status: 400 });
    }

    // Só aceita conteúdo que existe no registro — impede poluir o livro-razão.
    const doc = findDocByContentId(contentId);
    if (!doc) {
      return NextResponse.json({ error: "conteúdo desconhecido" }, { status: 400 });
    }

    // Direito de acesso: sem isso, qualquer usuário logado (sem nunca abrir o
    // leitor) podia gravar prova de leitura de conteúdo que nunca comprou ou
    // que foi reembolsado — essa checagem é o que sustenta a garantia
    // comercial e a defesa de chargeback em cima de `reading_events`.
    const decision = await canRead(user.id, doc);
    if (!decision.allowed) {
      // Mensagem genérica de propósito — não vazar `decision.reason` cru
      // (ver dicionário de motivos em src/app/biblioteca/[slug]/page.tsx).
      return NextResponse.json({ error: "sem acesso a este conteúdo" }, { status: 403 });
    }

    // slug/index precisam corresponder a uma seção real do documento — não dá
    // pra confiar no que o cliente mandou, senão qualquer string vira
    // section_slug no livro-razão.
    const sections = await getDocSections(doc);
    const section = sections.find((s) => s.slug === slug);
    if (!section || section.index !== index) {
      return NextResponse.json({ error: "seção inválida" }, { status: 400 });
    }

    if (!limiter.check(user.id, Date.now())) {
      return NextResponse.json({ ok: true }); // silencioso: não é erro do usuário
    }
    await recordRead(user.id, contentId, slug, index, { skipProgress });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/leitura", e);
    return NextResponse.json({ error: "erro interno" }, { status: 500 });
  }
}
