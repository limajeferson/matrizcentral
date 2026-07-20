import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFrom = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: () => ({ from: mockFrom }),
}));
const mockTryConsume = vi.fn();
vi.mock("./entitlement-access", () => ({ tryConsume: (...a: unknown[]) => mockTryConsume(...a) }));

import { canRead } from "./reader-data";
import type { ReaderDoc } from "@/data/reader-docs";

const EBOOK: ReaderDoc = {
  slug: "guia", contentId: "ebook-llm-local", title: "Guia",
  bodyPath: "x.md", kind: "ebook", startIncluded: true,
};
const RELATORIO: ReaderDoc = { ...EBOOK, contentId: "rel-1", kind: "relatorio" };

/** Mock de `from("purchases").select(...).eq(...)` devolvendo `rows`. */
function mockPurchases(rows: { status: string }[] | null, error: unknown = null) {
  mockFrom.mockReturnValue({
    select: () => ({ eq: () => Promise.resolve({ data: rows, error }) }),
  });
}

beforeEach(() => {
  mockFrom.mockReset();
  mockTryConsume.mockReset();
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

  it("libera o ebook com uma compra paga", async () => {
    mockPurchases([{ status: "paid" }]);
    expect(await canRead("u1", EBOOK)).toEqual({ allowed: true, reason: "purchase" });
  });

  it("libera o ebook se ao menos UMA compra segue paga (reembolso parcial do historico)", async () => {
    mockPurchases([{ status: "refunded" }, { status: "paid" }]);
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

  it("relatorio delega a tryConsume", async () => {
    mockPurchases([{ status: "paid" }]);
    mockTryConsume.mockResolvedValue({ allowed: true, reason: "advanced" });
    expect(await canRead("u1", RELATORIO)).toEqual({ allowed: true, reason: "advanced" });
    expect(mockTryConsume).toHaveBeenCalledWith("u1", "rel-1", true);
  });

  it("relatorio: revogacao vence tryConsume", async () => {
    mockPurchases([{ status: "refunded" }]);
    mockTryConsume.mockResolvedValue({ allowed: true, reason: "advanced" });
    expect((await canRead("u1", RELATORIO)).reason).toBe("revoked");
    expect(mockTryConsume).not.toHaveBeenCalled();
  });
});
