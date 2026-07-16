import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

let sessionUser: { id: string; email: string } | null;
vi.mock("@/lib/auth-session", () => ({
  getSessionUser: async () => sessionUser,
}));

function buildSupabaseMock(opts: { updateError?: unknown; claimed?: unknown } = {}) {
  const inserted: Record<string, unknown[]> = { xp_events: [] };
  const updated: Record<string, unknown>[] = [];
  const from = (table: string) => {
    if (table === "users") {
      return {
        update: (payload: Record<string, unknown>) => {
          // Update do perfil (sem diagnosed_at): grava e checa erro.
          if (!("diagnosed_at" in payload)) {
            return {
              eq: async () => {
                updated.push(payload);
                return { data: null, error: opts.updateError ?? null };
              },
            };
          }
          // Claim atômico (com diagnosed_at): só "ganha" quem o mock indicar.
          return {
            eq: () => ({
              is: () => ({
                select: () => ({
                  maybeSingle: async () => ({ data: opts.claimed ?? null, error: null }),
                }),
              }),
            }),
          };
        },
      };
    }
    if (table === "xp_events") {
      return {
        insert: async (rows: unknown) => {
          inserted.xp_events.push(rows);
          return { data: null, error: null };
        },
        upsert: async (rows: unknown) => {
          inserted.xp_events.push(rows);
          return { data: null, error: null };
        },
      };
    }
    return {};
  };
  return { from, inserted, updated };
}

let mockSupabase: ReturnType<typeof buildSupabaseMock>;
vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: () => mockSupabase,
}));

function req(body: unknown) {
  return new NextRequest("http://localhost/api/diagnostico", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/diagnostico", () => {
  beforeEach(() => vi.clearAllMocks());

  it("401 sem sessão", async () => {
    sessionUser = null;
    mockSupabase = buildSupabaseMock();
    const { POST } = await import("./route");
    const res = await POST(req({ answers: [{ questionId: 1, selectedOptionIndexes: [0] }] }));
    expect(res.status).toBe(401);
  });

  it("400 com respostas inválidas", async () => {
    sessionUser = { id: "u1", email: "a@b.com" };
    mockSupabase = buildSupabaseMock();
    const { POST } = await import("./route");
    const res = await POST(req({ answers: "nope" }));
    expect(res.status).toBe(400);
  });

  it("primeiro diagnóstico: grava perfil + XP e retorna profileId", async () => {
    sessionUser = { id: "u1", email: "a@b.com" };
    mockSupabase = buildSupabaseMock({ claimed: { id: "u1" } });
    const { POST } = await import("./route");
    // Q1/opção 0 ("Todos os dias") pontua profissional_produtividade.
    const res = await POST(req({ answers: [{ questionId: 1, selectedOptionIndexes: [0] }] }));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.profileId).toBe("profissional_produtividade");
    expect(mockSupabase.updated[0]).toMatchObject({ profile_id: "profissional_produtividade" });
    expect(mockSupabase.inserted.xp_events).toHaveLength(1);
  });

  it("500 (sem fingir sucesso) quando o update do perfil falha", async () => {
    sessionUser = { id: "u1", email: "a@b.com" };
    mockSupabase = buildSupabaseMock({ updateError: { message: "boom" } });
    const { POST } = await import("./route");
    const res = await POST(req({ answers: [{ questionId: 1, selectedOptionIndexes: [0] }] }));
    expect(res.status).toBe(500);
    expect(mockSupabase.inserted.xp_events).toHaveLength(0);
  });

  it("re-diagnóstico: atualiza perfil sem conceder XP novo", async () => {
    sessionUser = { id: "u1", email: "a@b.com" };
    mockSupabase = buildSupabaseMock({ claimed: null });
    const { POST } = await import("./route");
    const res = await POST(req({ answers: [{ questionId: 1, selectedOptionIndexes: [0] }] }));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.profileId).toBe("profissional_produtividade");
    expect(mockSupabase.updated[0]).toMatchObject({ profile_id: "profissional_produtividade" });
    expect(mockSupabase.inserted.xp_events).toHaveLength(0);
  });
});
