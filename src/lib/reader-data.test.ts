import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFrom = vi.fn();
const mockGetSupabaseServerClient = vi.fn(() => ({ from: mockFrom }));
vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: () => mockGetSupabaseServerClient(),
}));
const mockTryConsume = vi.fn();
vi.mock("./entitlement-access", () => ({ tryConsume: (...a: unknown[]) => mockTryConsume(...a) }));

import { canRead, recordRead } from "./reader-data";
import { EBOOK_PRODUCT_ID, ADVANCED_PASS_PRODUCT_ID, type ReaderDoc } from "@/data/reader-docs";

const EBOOK: ReaderDoc = {
  slug: "guia", contentId: "ebook-llm-local", title: "Guia",
  bodyPath: "x.md", kind: "ebook", startIncluded: true,
};
const RELATORIO: ReaderDoc = { ...EBOOK, contentId: "rel-1", kind: "relatorio" };

// Usado nos testes de "relatorio" (irrelevante ali se é passe ou não — qualquer
// compra paga libera o fluxo de tryConsume). NÃO usar como "outra compra" nos
// testes de revogação do ebook: passes liberam o ebook (ver abaixo), então
// esses testes usam um produto que não é passe (`NON_PASS_PRODUCT_ID`).
const OTHER_PRODUCT_ID = ADVANCED_PASS_PRODUCT_ID;
const NON_PASS_PRODUCT_ID = "algum_outro_produto";

/** Mock de `from("purchases").select(...).eq(...)` devolvendo `rows`. */
function mockPurchases(
  rows: { status: string; product_id?: string }[] | null,
  error: unknown = null,
) {
  mockFrom.mockReturnValue({
    select: () => ({ eq: () => Promise.resolve({ data: rows, error }) }),
  });
}

beforeEach(() => {
  mockFrom.mockReset();
  mockTryConsume.mockReset();
  mockGetSupabaseServerClient.mockReset();
  mockGetSupabaseServerClient.mockImplementation(() => ({ from: mockFrom }));
});

describe("canRead", () => {
  it("nega quando todas as compras foram reembolsadas (revogacao real)", async () => {
    mockPurchases([{ status: "refunded" }]);
    expect(await canRead("u1", EBOOK)).toEqual({ allowed: false, reason: "revoked" });
  });

  it("nega quando a compra virou disputa", async () => {
    mockPurchases([{ status: "disputed" }]);
    expect((await canRead("u1", EBOOK)).allowed).toBe(false);
  });

  it("libera o ebook com uma compra paga DO EBOOK", async () => {
    mockPurchases([{ status: "paid", product_id: EBOOK_PRODUCT_ID }]);
    expect(await canRead("u1", EBOOK)).toEqual({ allowed: true, reason: "purchase" });
  });

  it("nega o ebook reembolsado mesmo com OUTRA compra paga (revogacao e por produto, nao por usuario)", async () => {
    mockPurchases([
      { status: "refunded", product_id: EBOOK_PRODUCT_ID },
      { status: "paid", product_id: NON_PASS_PRODUCT_ID },
    ]);
    expect((await canRead("u1", EBOOK)).allowed).toBe(false);
  });

  it("passe advanced pago libera o ebook sem compra do Start", async () => {
    mockPurchases([{ status: "paid", product_id: ADVANCED_PASS_PRODUCT_ID }]);
    expect(await canRead("u1", EBOOK)).toEqual({ allowed: true, reason: "purchase" });
  });

  it("passe reembolsado e sem compra do ebook nega", async () => {
    mockPurchases([{ status: "refunded", product_id: ADVANCED_PASS_PRODUCT_ID }]);
    expect((await canRead("u1", EBOOK)).allowed).toBe(false);
  });

  it("libera o ebook pago mesmo com OUTRA compra reembolsada", async () => {
    mockPurchases([
      { status: "paid", product_id: EBOOK_PRODUCT_ID },
      { status: "refunded", product_id: OTHER_PRODUCT_ID },
    ]);
    expect((await canRead("u1", EBOOK)).allowed).toBe(true);
  });

  it("nega quando nao ha compra nenhuma", async () => {
    mockPurchases([]);
    expect((await canRead("u1", EBOOK)).allowed).toBe(false);
  });

  it("fail-closed: erro de banco nega", async () => {
    mockPurchases(null, { message: "boom" });
    expect(await canRead("u1", EBOOK)).toEqual({ allowed: false, reason: "error" });
  });

  it("fail-closed: data null sem error explicito tambem nega (reason error)", async () => {
    mockPurchases(null, null);
    expect(await canRead("u1", EBOOK)).toEqual({ allowed: false, reason: "error" });
  });

  it("relatorio delega a tryConsume quando ha compra paga (de qualquer produto)", async () => {
    mockPurchases([{ status: "paid", product_id: OTHER_PRODUCT_ID }]);
    mockTryConsume.mockResolvedValue({ allowed: true, reason: "advanced" });
    expect(await canRead("u1", RELATORIO)).toEqual({ allowed: true, reason: "advanced" });
    expect(mockTryConsume).toHaveBeenCalledWith("u1", "rel-1", true);
  });

  it("relatorio: sem NENHUMA compra paga (so pending) nega no-purchase sem chamar tryConsume", async () => {
    mockPurchases([{ status: "pending", product_id: OTHER_PRODUCT_ID }]);
    mockTryConsume.mockResolvedValue({ allowed: true, reason: "advanced" });
    expect(await canRead("u1", RELATORIO)).toEqual({ allowed: false, reason: "no-purchase" });
    expect(mockTryConsume).not.toHaveBeenCalled();
  });

  it("relatorio: revogacao vence tryConsume", async () => {
    mockPurchases([{ status: "refunded", product_id: OTHER_PRODUCT_ID }]);
    mockTryConsume.mockResolvedValue({ allowed: true, reason: "advanced" });
    expect((await canRead("u1", RELATORIO)).reason).toBe("revoked");
    expect(mockTryConsume).not.toHaveBeenCalled();
  });
});

describe("recordRead", () => {
  it("nunca bloqueia a leitura: resolve normalmente mesmo se getSupabaseServerClient lancar", async () => {
    mockGetSupabaseServerClient.mockImplementation(() => {
      throw new Error("boom");
    });
    await expect(recordRead("u1", "ebook-llm-local", "intro", 0)).resolves.toBeUndefined();
  });

  it("por padrao grava em reading_events E faz upsert em reading_progress", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const upsert = vi.fn().mockResolvedValue({ error: null });
    mockFrom.mockImplementation((table: string) =>
      table === "reading_events" ? { insert } : { upsert },
    );

    await recordRead("u1", "ebook-llm-local", "intro", 0);

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: "u1", content_id: "ebook-llm-local", section_slug: "intro", section_index: 0 }),
    );
    expect(upsert).toHaveBeenCalledTimes(1);
  });

  it("com skipProgress: grava reading_events mas NAO faz upsert em reading_progress", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const upsert = vi.fn().mockResolvedValue({ error: null });
    mockFrom.mockImplementation((table: string) =>
      table === "reading_events" ? { insert } : { upsert },
    );

    await recordRead("u1", "ebook-llm-local", "intro", 0, { skipProgress: true });

    expect(insert).toHaveBeenCalledTimes(1);
    expect(upsert).not.toHaveBeenCalled();
  });
});
