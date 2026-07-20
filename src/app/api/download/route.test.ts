import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

function buildSupabaseMock(tokenRow: Record<string, unknown> | null) {
  const from = (table: string) => {
    if (table === "tokens") {
      return {
        select: () => ({
          eq: () => ({ maybeSingle: async () => ({ data: tokenRow, error: null }) }),
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

function req(token: string) {
  return new NextRequest(`http://localhost/api/download?token=${token}`);
}

describe("GET /api/download (aposentado)", () => {
  it("responde 410 com mensagem e link de resgate quando o token é válido", async () => {
    mockSupabase = buildSupabaseMock({ valid_until: "2099-01-01T00:00:00.000Z" });

    const { GET } = await import("./route");
    const response = await GET(req("ABC1234567"));
    const json = await response.json();

    expect(response.status).toBe(410);
    expect(typeof json.error).toBe("string");
    expect(json.error.length).toBeGreaterThan(0);
    expect(json.resgate).toBe("/entrar/resgate?token=ABC1234567");
    expect(json.entrar).toBe("/entrar");
  });

  it("responde 404 quando o token não existe", async () => {
    mockSupabase = buildSupabaseMock(null);

    const { GET } = await import("./route");
    const response = await GET(req("NAOEXISTE"));

    expect(response.status).toBe(404);
  });

  it("responde 404 quando o token existe mas expirou", async () => {
    mockSupabase = buildSupabaseMock({ valid_until: "2000-01-01T00:00:00.000Z" });

    const { GET } = await import("./route");
    const response = await GET(req("EXPIRADO01"));

    expect(response.status).toBe(404);
  });

  it("responde 400 sem token", async () => {
    mockSupabase = buildSupabaseMock(null);

    const { GET } = await import("./route");
    const response = await GET(new NextRequest("http://localhost/api/download"));

    expect(response.status).toBe(400);
  });
});
