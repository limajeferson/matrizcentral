import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

function buildSupabaseMock(tokenRow: Record<string, unknown> | null) {
  const inserted: Record<string, unknown>[] = [];

  const from = (table: string) => {
    if (table === "tokens") {
      return {
        select: () => ({
          eq: () => ({ maybeSingle: async () => ({ data: tokenRow, error: null }) }),
        }),
      };
    }
    if (table === "roadmap_progress") {
      return {
        upsert: async (row: Record<string, unknown>) => {
          inserted.push(row);
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
      return {
        insert: async (row: unknown) => {
          inserted.push({ __xp: row });
          return { data: null, error: null };
        },
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

import { POST } from "./route";

describe("POST /api/roadmap/complete", () => {
  beforeEach(() => {
    mockSupabase = buildSupabaseMock({ token: "ABC123", purchase_id: "purchase-1" });
  });

  it("rejeita payload sem token ou stageKey", async () => {
    const req = new NextRequest("http://localhost/api/roadmap/complete", {
      method: "POST",
      body: JSON.stringify({ token: "ABC123" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
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
});
