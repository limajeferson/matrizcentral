import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

function buildSupabaseMock(
  tokenRow: Record<string, unknown> | null,
  existingXpEvent: Record<string, unknown> | null = null,
  progressUpsertError: Record<string, unknown> | null = null,
  validacaoEvents: Record<string, unknown>[] = []
) {
  const inserted: Record<string, unknown>[] = [];

  const from = (table: string) => {
    if (table === "tokens") {
      return {
        select: () => ({
          eq: () => ({ maybeSingle: async () => ({ data: tokenRow, error: null }) }),
          in: async () => ({ data: [], error: null }),
        }),
      };
    }
    if (table === "roadmap_progress") {
      return {
        upsert: async (row: Record<string, unknown>) => {
          if (progressUpsertError) {
            return { data: null, error: progressUpsertError };
          }
          inserted.push(row);
          return { data: null, error: null };
        },
        select: () => ({
          eq: async () => ({ data: [{ stage_key: "missao_final" }], error: null }),
        }),
      };
    }
    if (table === "profiles") {
      return {
        select: () => ({
          eq: () => ({ maybeSingle: async () => ({ data: { name: "Perfil Teste" }, error: null }) }),
        }),
      };
    }
    if (table === "certificates") {
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }),
          }),
        }),
        insert: async (row: Record<string, unknown>) => {
          inserted.push({ __certificate: row });
          return { data: null, error: null };
        },
      };
    }
    if (table === "purchases") {
      return {
        select: () => ({
          eq: () => ({
            single: async () => ({ data: { user_id: "user-1" }, error: null }),
          }),
        }),
      };
    }
    if (table === "xp_events") {
      const chain = {
        eq: () => chain,
        maybeSingle: async () => ({ data: existingXpEvent, error: null }),
        limit: async () => ({ data: validacaoEvents, error: null }),
      };
      return {
        select: () => chain,
        insert: async (row: unknown) => {
          inserted.push({ __xp: row });
          return { data: null, error: null };
        },
      };
    }
    if (table === "users") {
      return {
        select: () => ({
          eq: () => ({
            single: async () => ({ data: { total_xp: 0, email: "user@example.com" }, error: null }),
          }),
        }),
      };
    }
    if (table === "content_completions") {
      return {
        select: () => ({ in: async () => ({ data: [], error: null }) }),
      };
    }
    if (table === "badges_earned") {
      return {
        select: () => ({ eq: async () => ({ data: [], error: null }) }),
        insert: async () => ({ data: null, error: null }),
      };
    }
    throw new Error(`tabela não mockada: ${table}`);
  };

  return { from, inserted };
}

let mockSupabase: ReturnType<typeof buildSupabaseMock>;
vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: () => mockSupabase,
}));

const sendCertificateEmail = vi.fn(async (params: unknown) => {
  void params;
});
vi.mock("@/lib/email", () => ({
  sendCertificateEmail: (params: unknown) => sendCertificateEmail(params),
}));

import { POST } from "./route";

describe("POST /api/roadmap/complete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = buildSupabaseMock({
      token: "ABC123",
      purchase_id: "purchase-1",
      valid_until: "2099-01-01T00:00:00.000Z",
    });
  });

  it("rejeita payload sem token ou stageKey", async () => {
    const req = new NextRequest("http://localhost/api/roadmap/complete", {
      method: "POST",
      body: JSON.stringify({ token: "ABC123" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("rejeita stageKey que não existe em ROADMAP_STAGE_KEYS", async () => {
    const req = new NextRequest("http://localhost/api/roadmap/complete", {
      method: "POST",
      body: JSON.stringify({ token: "ABC123", stageKey: "etapa_inventada" }),
    });
    const res = await POST(req);
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body).toEqual({ error: "etapa inválida" });
  });

  it("retorna 404 quando o token não existe", async () => {
    mockSupabase = buildSupabaseMock(null);
    const req = new NextRequest("http://localhost/api/roadmap/complete", {
      method: "POST",
      body: JSON.stringify({ token: "NAOEXISTE", stageKey: "fundacao_local" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it("retorna 404 quando o token está expirado", async () => {
    mockSupabase = buildSupabaseMock({
      token: "ABC123",
      purchase_id: "purchase-1",
      valid_until: "2020-01-01T00:00:00.000Z",
    });
    const req = new NextRequest("http://localhost/api/roadmap/complete", {
      method: "POST",
      body: JSON.stringify({ token: "ABC123", stageKey: "fundacao_local" }),
    });
    const res = await POST(req);
    const body = await res.json();
    expect(res.status).toBe(404);
    expect(body).toEqual({ error: "token não encontrado" });
  });

  it("retorna 500 e não concede XP se o upsert de roadmap_progress falhar", async () => {
    mockSupabase = buildSupabaseMock(
      { token: "ABC123", purchase_id: "purchase-1", valid_until: "2099-01-01T00:00:00.000Z" },
      null,
      { message: "db offline" }
    );
    const req = new NextRequest("http://localhost/api/roadmap/complete", {
      method: "POST",
      body: JSON.stringify({ token: "ABC123", stageKey: "fundacao_local" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body).toEqual({ error: "não foi possível salvar o progresso" });
    expect(
      mockSupabase.inserted.some(
        (row) => (row as { __xp?: { action_type: string } }).__xp?.action_type === "roadmap"
      )
    ).toBe(false);
  });

  it("marca a etapa como concluída e concede XP", async () => {
    const req = new NextRequest("http://localhost/api/roadmap/complete", {
      method: "POST",
      body: JSON.stringify({ token: "ABC123", stageKey: "fundacao_local" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ ok: true });
    expect(mockSupabase.inserted).toContainEqual({
      token: "ABC123",
      stage_key: "fundacao_local",
    });
    expect(
      mockSupabase.inserted.some(
        (row) => (row as { __xp?: { action_type: string } }).__xp?.action_type === "roadmap"
      )
    ).toBe(true);
  });

  it("não concede XP duplicado ao concluir a mesma etapa duas vezes", async () => {
    mockSupabase = buildSupabaseMock({
      token: "ABC123",
      purchase_id: "purchase-1",
      valid_until: "2099-01-01T00:00:00.000Z",
    });

    const req1 = new NextRequest("http://localhost/api/roadmap/complete", {
      method: "POST",
      body: JSON.stringify({ token: "ABC123", stageKey: "fundacao_local" }),
    });
    const res1 = await POST(req1);
    expect(res1.status).toBe(200);
    expect(
      mockSupabase.inserted.filter(
        (row) => (row as { __xp?: { action_type: string } }).__xp?.action_type === "roadmap"
      )
    ).toHaveLength(1);

    // Simula a segunda chamada com um xp_event já existente para o mesmo token+stageKey.
    mockSupabase = buildSupabaseMock(
      { token: "ABC123", purchase_id: "purchase-1", valid_until: "2099-01-01T00:00:00.000Z" },
      { id: "xp-event-1" }
    );

    const req2 = new NextRequest("http://localhost/api/roadmap/complete", {
      method: "POST",
      body: JSON.stringify({ token: "ABC123", stageKey: "fundacao_local" }),
    });
    const res2 = await POST(req2);
    const body2 = await res2.json();

    expect(res2.status).toBe(200);
    expect(body2).toEqual({ ok: true });
    expect(
      mockSupabase.inserted.filter(
        (row) => (row as { __xp?: { action_type: string } }).__xp?.action_type === "roadmap"
      )
    ).toHaveLength(0);
  });

  it("emite certificado ao concluir missao_final com quiz de validação aprovado", async () => {
    mockSupabase = buildSupabaseMock(
      { token: "ABC123", purchase_id: "purchase-1", valid_until: "2099-01-01T00:00:00.000Z" },
      null,
      null,
      [{ id: "xp-event-validacao" }]
    );

    const req = new NextRequest("http://localhost/api/roadmap/complete", {
      method: "POST",
      body: JSON.stringify({ token: "ABC123", stageKey: "missao_final" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ ok: true });
    expect(
      mockSupabase.inserted.some(
        (row) => (row as { __certificate?: unknown }).__certificate !== undefined
      )
    ).toBe(true);
    expect(sendCertificateEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "user@example.com" })
    );
  });

  it("não emite certificado ao concluir missao_final sem o quiz de validação aprovado", async () => {
    mockSupabase = buildSupabaseMock(
      { token: "ABC123", purchase_id: "purchase-1", valid_until: "2099-01-01T00:00:00.000Z" },
      null,
      null,
      []
    );

    const req = new NextRequest("http://localhost/api/roadmap/complete", {
      method: "POST",
      body: JSON.stringify({ token: "ABC123", stageKey: "missao_final" }),
    });
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(
      mockSupabase.inserted.some(
        (row) => (row as { __certificate?: unknown }).__certificate !== undefined
      )
    ).toBe(false);
    expect(sendCertificateEmail).not.toHaveBeenCalled();
  });
});
