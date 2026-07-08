import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

function buildSupabaseMock(
  tokenRow: Record<string, unknown> | null,
  existingXpEvent: Record<string, unknown> | null = null,
  userTotalXp: { before: number; after: number; email?: string } = { before: 0, after: 0 }
) {
  const inserted: Record<string, unknown[]> = { quiz_responses: [], xp_events: [] };
  const updated: Record<string, unknown>[] = [];

  const from = (table: string) => {
    if (table === "tokens") {
      return {
        select: () => ({
          eq: () => ({ maybeSingle: async () => ({ data: tokenRow, error: null }) }),
        }),
        update: (payload: Record<string, unknown>) => ({
          eq: async () => {
            updated.push(payload);
            return { data: null, error: null };
          },
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
    if (table === "xp_events") {
      const chain = {
        eq: () => chain,
        maybeSingle: async () => ({ data: existingXpEvent, error: null }),
        limit: async () => ({ data: [], error: null }),
      };
      return {
        select: () => chain,
        insert: async (rows: unknown) => {
          inserted.xp_events.push(rows);
          return { data: null, error: null };
        },
      };
    }
    if (table === "users") {
      // notifyLevelUpIfNeeded faz uma única leitura de total_xp (já refletindo o
      // XP recém-concedido, via trigger de banco) e reconstrói o "antes"
      // subtraindo o xpJustGranted — por isso o mock retorna sempre `after`.
      return {
        select: () => ({
          eq: () => ({
            single: async () => ({
              data: { total_xp: userTotalXp.after, email: userTotalXp.email ?? "user@example.com" },
              error: null,
            }),
          }),
        }),
      };
    }
    if (table === "content_completions") {
      return {
        select: () => ({ in: async () => ({ data: [], error: null }) }),
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
    return {
      insert: async (rows: unknown) => {
        inserted[table]?.push(rows);
        return { data: null, error: null };
      },
    };
  };

  return { from, inserted, updated };
}

let mockSupabase: ReturnType<typeof buildSupabaseMock>;
vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: () => mockSupabase,
}));

const sendLevelUpEmail = vi.fn(async (params: unknown) => {
  void params;
});
vi.mock("@/lib/email", () => ({
  sendLevelUpEmail: (params: unknown) => sendLevelUpEmail(params),
}));

describe("POST /api/quiz", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calcula perfil, marca token como triado e concede XP", async () => {
    mockSupabase = buildSupabaseMock({
      token: "ABC1234567",
      purchase_id: "purchase-1",
      triaged: false,
    });

    const { POST } = await import("./route");
    const request = new NextRequest("http://localhost/api/quiz", {
      method: "POST",
      body: JSON.stringify({
        token: "ABC1234567",
        quizType: "triagem",
        answers: [{ questionId: 1, selectedOptionIndexes: [0] }],
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    // Q1/opção 0 no banco atual ("Todos os dias") pontua para
    // profissional_produtividade (ver src/data/quiz-triagem.ts).
    expect(json.profileId).toBe("profissional_produtividade");
    expect(mockSupabase.inserted.xp_events).toHaveLength(1);
    expect(mockSupabase.updated[0]).toMatchObject({ triaged: true });
  });

  it("bloqueia reenvio de triagem se o token já foi triado", async () => {
    mockSupabase = buildSupabaseMock({
      token: "ABC1234567",
      purchase_id: "purchase-1",
      triaged: true,
    });

    const { POST } = await import("./route");
    const request = new NextRequest("http://localhost/api/quiz", {
      method: "POST",
      body: JSON.stringify({ token: "ABC1234567", quizType: "triagem", answers: [] }),
    });

    const response = await POST(request);
    expect(response.status).toBe(409);
  });

  it("concede XP de validação apenas quando passed=true", async () => {
    mockSupabase = buildSupabaseMock({
      token: "ABC1234567",
      purchase_id: "purchase-1",
      triaged: true,
    });

    const { POST } = await import("./route");
    const request = new NextRequest("http://localhost/api/quiz", {
      method: "POST",
      body: JSON.stringify({ token: "ABC1234567", quizType: "validacao", score: 40, passed: false }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.passed).toBe(false);
    expect(mockSupabase.inserted.xp_events).toHaveLength(0);
  });

  it("não concede XP de validação duplicado se já existe evento para o token", async () => {
    mockSupabase = buildSupabaseMock(
      {
        token: "ABC1234567",
        purchase_id: "purchase-1",
        triaged: true,
      },
      { id: "xp-event-1" }
    );

    const { POST } = await import("./route");
    const request = new NextRequest("http://localhost/api/quiz", {
      method: "POST",
      body: JSON.stringify({ token: "ABC1234567", quizType: "validacao", score: 100, passed: true }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.passed).toBe(true);
    expect(mockSupabase.inserted.xp_events).toHaveLength(0);
  });

  it("envia e-mail de level up quando o XP de validação cruza um threshold de nível", async () => {
    mockSupabase = buildSupabaseMock(
      {
        token: "ABC1234567",
        purchase_id: "purchase-1",
        triaged: true,
      },
      null,
      { before: 450, after: 550, email: "levelup@example.com" }
    );

    const { POST } = await import("./route");
    const request = new NextRequest("http://localhost/api/quiz", {
      method: "POST",
      body: JSON.stringify({ token: "ABC1234567", quizType: "validacao", score: 100, passed: true }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(sendLevelUpEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "levelup@example.com", level: 2 })
    );
  });

  it("não envia e-mail de level up quando o XP de validação não cruza um threshold", async () => {
    mockSupabase = buildSupabaseMock(
      {
        token: "ABC1234567",
        purchase_id: "purchase-1",
        triaged: true,
      },
      null,
      { before: 0, after: 100, email: "nolevelup@example.com" }
    );

    const { POST } = await import("./route");
    const request = new NextRequest("http://localhost/api/quiz", {
      method: "POST",
      body: JSON.stringify({ token: "ABC1234567", quizType: "validacao", score: 100, passed: true }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(sendLevelUpEmail).not.toHaveBeenCalled();
  });

  it("retorna 404 se o token não existe", async () => {
    mockSupabase = buildSupabaseMock(null);

    const { POST } = await import("./route");
    const request = new NextRequest("http://localhost/api/quiz", {
      method: "POST",
      body: JSON.stringify({ token: "NAOEXISTE", quizType: "triagem", answers: [] }),
    });

    const response = await POST(request);
    expect(response.status).toBe(404);
  });
});
