import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

function buildSupabaseMock(
  tokenRow: Record<string, unknown> | null,
  purchaseRow: Record<string, unknown> | null
) {
  const from = (table: string) => {
    if (table === "tokens") {
      return {
        select: () => ({
          eq: () => ({ maybeSingle: async () => ({ data: tokenRow, error: null }) }),
        }),
      };
    }
    if (table === "purchases") {
      return {
        select: () => ({
          eq: () => ({ maybeSingle: async () => ({ data: purchaseRow, error: null }) }),
        }),
      };
    }
    throw new Error(`tabela inesperada: ${table}`);
  };
  return { from };
}

let mockSupabase: ReturnType<typeof buildSupabaseMock>;
vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: () => mockSupabase,
}));
vi.mock("@/lib/auth-session", () => ({
  createSession: async () => "sess-secret",
  SESSION_COOKIE: "mc_session",
  SESSION_MAX_AGE_SECONDS: 100,
}));

function req(body: unknown) {
  return new NextRequest("http://localhost/api/resgate", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/resgate", () => {
  it("400 sem token", async () => {
    mockSupabase = buildSupabaseMock(null, null);
    const { POST } = await import("./route");
    const res = await POST(req({}));
    expect(res.status).toBe(400);
  });

  it("404 quando o token não existe ou expirou", async () => {
    mockSupabase = buildSupabaseMock(null, null);
    const { POST } = await import("./route");
    const res = await POST(req({ token: "NAOEXISTE" }));
    expect(res.status).toBe(404);
    expect(res.cookies.get("mc_session")).toBeUndefined();
  });

  it("404 quando o token existe mas expirou", async () => {
    mockSupabase = buildSupabaseMock(
      { valid_until: "2000-01-01T00:00:00.000Z", purchase_id: "purchase-1" },
      null
    );
    const { POST } = await import("./route");
    const res = await POST(req({ token: "EXPIRADO01" }));
    expect(res.status).toBe(404);
  });

  it("200 + cria sessão quando o token é válido", async () => {
    mockSupabase = buildSupabaseMock(
      { valid_until: "2099-01-01T00:00:00.000Z", purchase_id: "purchase-1" },
      { user_id: "user-1" }
    );
    const { POST } = await import("./route");
    const res = await POST(req({ token: "ABC1234567" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(res.cookies.get("mc_session")?.value).toBe("sess-secret");
  });

  it("404 quando o token é válido mas a compra não é encontrada", async () => {
    mockSupabase = buildSupabaseMock(
      { valid_until: "2099-01-01T00:00:00.000Z", purchase_id: "purchase-1" },
      null
    );
    const { POST } = await import("./route");
    const res = await POST(req({ token: "ABC1234567" }));
    expect(res.status).toBe(404);
  });
});
