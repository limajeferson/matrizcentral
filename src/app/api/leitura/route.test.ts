import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync } from "fs";
import path from "path";
import { NextRequest } from "next/server";
import { parseMarkdown } from "@/lib/markdown";
import { splitIntoSections } from "@/lib/reader";

let sessionUser: { id: string; email: string } | null;
vi.mock("@/lib/auth-session", () => ({
  getSessionUser: async () => sessionUser,
}));

const mockCanRead = vi.fn();
const mockRecordRead = vi.fn();
vi.mock("@/lib/reader-data", () => ({
  canRead: (...a: unknown[]) => mockCanRead(...a),
  recordRead: (...a: unknown[]) => mockRecordRead(...a),
}));

const CONTENT_ID = "ebook-llm-local";
const BODY_PATH = "content/ebooks/ebook_llm_local_matrizcentral.md";

// Mesmo arquivo que a rota lê em produção — deriva o slug/index reais em vez
// de hardcodar (evita teste frágil se o ebook mudar) e, de brinde, exercita
// o parsing real (parseMarkdown + splitIntoSections) contra conteúdo real.
const source = readFileSync(path.join(process.cwd(), BODY_PATH), "utf-8");
const REAL_SECTIONS = splitIntoSections(parseMarkdown(source));
const REAL_SECTION = REAL_SECTIONS[2];

function req(body: unknown) {
  return new NextRequest("http://localhost/api/leitura", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/leitura", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionUser = { id: "user-1", email: "a@b.com" };
    mockCanRead.mockResolvedValue({ allowed: true, reason: "purchase" });
  });

  it("401 sem sessão", async () => {
    sessionUser = null;
    const { POST } = await import("./route");
    const res = await POST(
      req({ contentId: CONTENT_ID, slug: REAL_SECTION.slug, index: REAL_SECTION.index })
    );
    expect(res.status).toBe(401);
    expect(mockRecordRead).not.toHaveBeenCalled();
  });

  it("403 e NÃO grava quando o usuário está logado mas sem direito ao conteúdo", async () => {
    mockCanRead.mockResolvedValue({ allowed: false, reason: "no-purchase" });
    const { POST } = await import("./route");
    const res = await POST(
      req({ contentId: CONTENT_ID, slug: REAL_SECTION.slug, index: REAL_SECTION.index })
    );
    const json = await res.json();
    expect(res.status).toBe(403);
    expect(mockRecordRead).not.toHaveBeenCalled();
    // não vaza o motivo cru (dicionário fixo, ver src/app/biblioteca/[slug]/page.tsx)
    expect(JSON.stringify(json)).not.toMatch(/no-purchase/);
  });

  it("400 quando contentId está fora do catálogo", async () => {
    const { POST } = await import("./route");
    const res = await POST(req({ contentId: "nao-existe", slug: "x", index: 0 }));
    expect(res.status).toBe(400);
    expect(mockCanRead).not.toHaveBeenCalled();
    expect(mockRecordRead).not.toHaveBeenCalled();
  });

  it.each([-1, NaN, "1", 1.5, undefined])("400 quando index é inválido (%p)", async (badIndex) => {
    const { POST } = await import("./route");
    const res = await POST(req({ contentId: CONTENT_ID, slug: REAL_SECTION.slug, index: badIndex }));
    expect(res.status).toBe(400);
    expect(mockRecordRead).not.toHaveBeenCalled();
  });

  it("400 quando o slug não existe no documento", async () => {
    const { POST } = await import("./route");
    const res = await POST(req({ contentId: CONTENT_ID, slug: "secao-que-nao-existe-no-doc", index: 0 }));
    expect(res.status).toBe(400);
    expect(mockRecordRead).not.toHaveBeenCalled();
  });

  it("400 quando o index não bate com o da seção encontrada pelo slug (não confia no cliente)", async () => {
    const { POST } = await import("./route");
    const res = await POST(
      req({ contentId: CONTENT_ID, slug: REAL_SECTION.slug, index: REAL_SECTION.index + 1 })
    );
    expect(res.status).toBe(400);
    expect(mockRecordRead).not.toHaveBeenCalled();
  });

  it("caminho feliz: grava a leitura com os valores certos", async () => {
    const { POST } = await import("./route");
    const res = await POST(
      req({ contentId: CONTENT_ID, slug: REAL_SECTION.slug, index: REAL_SECTION.index })
    );
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json).toEqual({ ok: true });
    expect(mockCanRead).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ contentId: CONTENT_ID })
    );
    expect(mockRecordRead).toHaveBeenCalledWith(
      "user-1",
      CONTENT_ID,
      REAL_SECTION.slug,
      REAL_SECTION.index
    );
  });

  it("rate limit: responde ok silencioso e NÃO grava", async () => {
    const { POST } = await import("./route");
    // primeira chamada consome a janela do rate limiter para este usuário
    await POST(req({ contentId: CONTENT_ID, slug: REAL_SECTION.slug, index: REAL_SECTION.index }));
    mockRecordRead.mockClear();
    // segunda chamada, na mesma janela de 2s, deve ser barrada
    const res = await POST(
      req({ contentId: CONTENT_ID, slug: REAL_SECTION.slug, index: REAL_SECTION.index })
    );
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json).toEqual({ ok: true });
    expect(mockRecordRead).not.toHaveBeenCalled();
  });
});
