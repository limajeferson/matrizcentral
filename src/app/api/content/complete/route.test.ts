import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

function buildSupabaseMock(
  tokenRow: Record<string, unknown> | null,
  existingCompletion: Record<string, unknown> | null = null
) {
  const inserted: Record<string, unknown[]> = { content_completions: [], xp_events: [] };

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
          eq: () => ({
            single: async () => ({ data: { user_id: "user-1" }, error: null }),
          }),
        }),
      };
    }
    if (table === "content_completions") {
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({ maybeSingle: async () => ({ data: existingCompletion, error: null }) }),
          }),
          in: async () => ({ data: [], error: null }),
        }),
        insert: async (rows: unknown) => {
          inserted.content_completions.push(rows);
          return { data: null, error: null };
        },
      };
    }
    if (table === "xp_events") {
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({ limit: async () => ({ data: [], error: null }) }),
          }),
        }),
        insert: async (rows: unknown) => {
          inserted.xp_events.push(rows);
          return { data: null, error: null };
        },
      };
    }
    if (table === "users") {
      return {
        select: () => ({
          eq: () => ({ single: async () => ({ data: { total_xp: 0 }, error: null }) }),
        }),
      };
    }
    if (table === "roadmap_progress") {
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
    throw new Error(`tabela inesperada: ${table}`);
  };

  return { from, inserted };
}

let mockSupabase: ReturnType<typeof buildSupabaseMock>;
vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: () => mockSupabase,
}));

describe("POST /api/content/complete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("marca conteúdo como concluído e concede XP", async () => {
    mockSupabase = buildSupabaseMock({
      token: "ABC1234567",
      purchase_id: "purchase-1",
      valid_until: "2099-01-01T00:00:00.000Z",
    });

    const { POST } = await import("./route");
    const request = new NextRequest("http://localhost/api/content/complete", {
      method: "POST",
      body: JSON.stringify({ token: "ABC1234567", contentId: "relatorio-panorama-llms-locais" }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.xpAwarded).toBe(30);
    expect(mockSupabase.inserted.content_completions).toHaveLength(1);
    expect(mockSupabase.inserted.xp_events).toHaveLength(1);
    expect(mockSupabase.inserted.xp_events[0]).toMatchObject({
      user_id: "user-1",
      xp_amount: 30,
      action_type: "conteudo",
      reference_id: "relatorio-panorama-llms-locais",
    });
  });

  it("não concede XP duplicado se o conteúdo já foi concluído", async () => {
    mockSupabase = buildSupabaseMock(
      { token: "ABC1234567", purchase_id: "purchase-1", valid_until: "2099-01-01T00:00:00.000Z" },
      { id: "completion-1" }
    );

    const { POST } = await import("./route");
    const request = new NextRequest("http://localhost/api/content/complete", {
      method: "POST",
      body: JSON.stringify({ token: "ABC1234567", contentId: "relatorio-panorama-llms-locais" }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.xpAwarded).toBe(0);
    expect(mockSupabase.inserted.content_completions).toHaveLength(0);
    expect(mockSupabase.inserted.xp_events).toHaveLength(0);
  });

  it("retorna 404 se o token não existe ou expirou", async () => {
    mockSupabase = buildSupabaseMock(null);

    const { POST } = await import("./route");
    const request = new NextRequest("http://localhost/api/content/complete", {
      method: "POST",
      body: JSON.stringify({ token: "NAOEXISTE", contentId: "relatorio-panorama-llms-locais" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(404);
  });

  it("retorna 400 se o contentId não existe no catálogo", async () => {
    mockSupabase = buildSupabaseMock({
      token: "ABC1234567",
      purchase_id: "purchase-1",
      valid_until: "2099-01-01T00:00:00.000Z",
    });

    const { POST } = await import("./route");
    const request = new NextRequest("http://localhost/api/content/complete", {
      method: "POST",
      body: JSON.stringify({ token: "ABC1234567", contentId: "nao-existe" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
