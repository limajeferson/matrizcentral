import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockConstructEvent = vi.fn();
vi.mock("@/lib/stripe", () => ({
  stripe: { webhooks: { constructEvent: (...args: unknown[]) => mockConstructEvent(...args) } },
}));

const mockSendTokenEmail = vi.fn().mockResolvedValue(undefined);
vi.mock("@/lib/email", () => ({
  sendTokenEmail: (...args: unknown[]) => mockSendTokenEmail(...args),
}));

function buildSupabaseMock(existingPurchase: unknown) {
  const insertedRows: Record<string, unknown[]> = {
    users: [],
    purchases: [],
    tokens: [],
    xp_events: [],
  };

  const from = (table: string) => ({
    select: () => ({
      eq: () => ({
        maybeSingle: async () => ({ data: existingPurchase, error: null }),
      }),
    }),
    upsert: (row: Record<string, unknown>) => ({
      select: () => ({
        single: async () => {
          const inserted = { id: "user-1", ...row };
          insertedRows.users.push(inserted);
          return { data: inserted, error: null };
        },
      }),
    }),
    // Registra a linha assim que `insert()` é chamado (não só quando
    // `.select().single()` é encadeado) — o código real chama
    // `.insert(...)` sem encadear `.select().single()` para `tokens` e
    // `xp_events`, só para `purchases`. O retorno é um Promise de verdade
    // com `.select` anexado, então funciona tanto com `await insert(...)`
    // direto quanto com `await insert(...).select().single()`.
    insert: (row: Record<string, unknown>) => {
      const inserted = { id: `${table}-1`, ...row };
      insertedRows[table]?.push(inserted);
      const result = Promise.resolve({ data: inserted, error: null });
      return Object.assign(result, {
        select: () => ({
          single: async () => ({ data: inserted, error: null }),
        }),
      });
    },
  });

  return { from, insertedRows };
}

let mockSupabase: ReturnType<typeof buildSupabaseMock>;
vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: () => mockSupabase,
}));

describe("POST /api/webhooks/stripe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = buildSupabaseMock(null);
  });

  it("cria user, purchase, token e envia e-mail em checkout.session.completed", async () => {
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          customer_email: "aluno@example.com",
          customer: "cus_123",
          payment_intent: "pi_123",
          amount_total: 4700,
          metadata: { product_id: "ebook_llm_local" },
        },
      },
    });

    const { POST } = await import("./route");
    const request = new NextRequest("http://localhost/api/webhooks/stripe", {
      method: "POST",
      body: "{}",
      headers: { "stripe-signature": "sig_test" },
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.received).toBe(true);
    expect(mockSupabase.insertedRows.purchases).toHaveLength(1);
    expect(mockSupabase.insertedRows.tokens).toHaveLength(1);
    expect(mockSupabase.insertedRows.xp_events).toHaveLength(1);
    expect(mockSendTokenEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "aluno@example.com" })
    );
  });

  it("ignora evento se stripe_payment_id já foi processado (idempotência)", async () => {
    mockSupabase = buildSupabaseMock({ id: "purchase-existente" });
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          customer_email: "aluno@example.com",
          customer: "cus_123",
          payment_intent: "pi_123",
          amount_total: 4700,
          metadata: { product_id: "ebook_llm_local" },
        },
      },
    });

    const { POST } = await import("./route");
    const request = new NextRequest("http://localhost/api/webhooks/stripe", {
      method: "POST",
      body: "{}",
      headers: { "stripe-signature": "sig_test" },
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.deduped).toBe(true);
    expect(mockSupabase.insertedRows.purchases).toHaveLength(0);
    expect(mockSendTokenEmail).not.toHaveBeenCalled();
  });

  it("rejeita requisição com assinatura inválida", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("assinatura inválida");
    });

    const { POST } = await import("./route");
    const request = new NextRequest("http://localhost/api/webhooks/stripe", {
      method: "POST",
      body: "{}",
      headers: { "stripe-signature": "sig_invalida" },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
