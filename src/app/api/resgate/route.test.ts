import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { createSession } from "@/lib/auth-session";

function buildSupabaseMock(
  tokenRow: Record<string, unknown> | null,
  purchaseRow: Record<string, unknown> | null,
  expectedPurchaseId?: string
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
          // Filtra de verdade por id — um teste que consultasse a compra com o
          // id errado (bug no route.ts) deve ver 404, não a linha de outro dono.
          eq: (field: string, value: unknown) => ({
            maybeSingle: async () => ({
              data: field === "id" && value === expectedPurchaseId ? purchaseRow : null,
              error: null,
            }),
          }),
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
  createSession: vi.fn(async () => "sess-secret"),
  SESSION_COOKIE: "mc_session",
  SESSION_MAX_AGE_SECONDS: 100,
}));

// Cada teste usa um IP próprio pra não esbarrar no rate limit (que é
// por-IP e vive no módulo, compartilhado entre os `it`s deste arquivo) —
// exceto o teste dedicado ao rate limit, que reusa o mesmo IP de propósito.
let ipCounter = 0;
function nextIp() {
  ipCounter += 1;
  return `10.0.0.${ipCounter}`;
}

function req(body: unknown, opts: { ip?: string; contentType?: string | null } = {}) {
  const headers: Record<string, string> = { "x-forwarded-for": opts.ip ?? nextIp() };
  if (opts.contentType !== null) {
    headers["content-type"] = opts.contentType ?? "application/json";
  }
  return new NextRequest("http://localhost/api/resgate", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.mocked(createSession).mockClear();
  vi.mocked(createSession).mockImplementation(async () => "sess-secret");
});

describe("POST /api/resgate", () => {
  it("415 quando o Content-Type não é application/json", async () => {
    mockSupabase = buildSupabaseMock(null, null);
    const { POST } = await import("./route");
    const res = await POST(req({ token: "ABC1234567" }, { contentType: "text/plain" }));
    expect(res.status).toBe(415);
    expect(res.cookies.get("mc_session")).toBeUndefined();
  });

  it("429 na segunda tentativa do mesmo IP dentro da janela", async () => {
    mockSupabase = buildSupabaseMock(null, null);
    const { POST } = await import("./route");
    const ip = "10.0.0.999";
    const first = await POST(req({}, { ip }));
    const second = await POST(req({}, { ip }));
    expect(first.status).toBe(400); // sem token, mas passou do rate limit
    expect(second.status).toBe(429);
    expect(second.cookies.get("mc_session")).toBeUndefined();
  });

  it("400 sem token", async () => {
    mockSupabase = buildSupabaseMock(null, null);
    const { POST } = await import("./route");
    const res = await POST(req({}));
    expect(res.status).toBe(400);
    expect(res.cookies.get("mc_session")).toBeUndefined();
  });

  it("404 quando o token não existe", async () => {
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
    expect(res.cookies.get("mc_session")).toBeUndefined();
  });

  it("404 quando o token é válido mas a compra não é encontrada", async () => {
    mockSupabase = buildSupabaseMock(
      { valid_until: "2099-01-01T00:00:00.000Z", purchase_id: "purchase-1" },
      null,
      "purchase-1"
    );
    const { POST } = await import("./route");
    const res = await POST(req({ token: "ABC1234567" }));
    expect(res.status).toBe(404);
    expect(res.cookies.get("mc_session")).toBeUndefined();
  });

  it("500 (não 404) quando o token é válido mas o banco falha ao criar a sessão", async () => {
    mockSupabase = buildSupabaseMock(
      { valid_until: "2099-01-01T00:00:00.000Z", purchase_id: "purchase-1" },
      { user_id: "user-1" },
      "purchase-1"
    );
    vi.mocked(createSession).mockRejectedValueOnce(new Error("db indisponível"));
    const { POST } = await import("./route");
    const res = await POST(req({ token: "ABC1234567" }));
    expect(res.status).toBe(500);
    expect(res.cookies.get("mc_session")).toBeUndefined();
  });

  it("200 + cria sessão do DONO da compra (não de outro usuário) quando o token é válido", async () => {
    mockSupabase = buildSupabaseMock(
      { valid_until: "2099-01-01T00:00:00.000Z", purchase_id: "purchase-1" },
      { user_id: "user-1" },
      "purchase-1"
    );
    const { POST } = await import("./route");
    const res = await POST(req({ token: "ABC1234567" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(createSession).toHaveBeenCalledWith("user-1");
    expect(res.cookies.get("mc_session")?.value).toBe("sess-secret");
  });
});
