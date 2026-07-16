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

function buildSupabaseMock(
  opts: {
    existingPurchase?: { id: string } | null;
    existingToken?: { token: string } | null;
    tokenInsertError?: { message: string } | null;
  } = {}
) {
  const existingPurchase = opts.existingPurchase ?? null;
  const existingToken = opts.existingToken ?? null;
  const tokenInsertError = opts.tokenInsertError ?? null;

  const insertedRows: Record<string, unknown[]> = {
    users: [],
    purchases: [],
    tokens: [],
    xp_events: [],
  };
  const updatedRows: Record<string, { values: Record<string, unknown>; eq: [string, unknown] }[]> = {
    purchases: [],
    tokens: [],
    entitlements: [],
  };

  const from = (table: string) => {
    if (table === "users") {
      return {
        upsert: (row: Record<string, unknown>) => ({
          select: () => ({
            single: async () => {
              const u = { id: "user-1", ...row };
              insertedRows.users.push(u);
              return { data: u, error: null };
            },
          }),
        }),
      };
    }
    if (table === "purchases") {
      return {
        select: () => ({
          eq: () => ({ maybeSingle: async () => ({ data: existingPurchase, error: null }) }),
        }),
        insert: (row: Record<string, unknown>) => ({
          select: () => ({
            single: async () => {
              const p = { id: "purchase-1", ...row };
              insertedRows.purchases.push(p);
              return { data: p, error: null };
            },
          }),
        }),
        update: (values: Record<string, unknown>) => ({
          eq: async (col: string, val: unknown) => {
            updatedRows.purchases.push({ values, eq: [col, val] });
            return { data: null, error: null };
          },
        }),
      };
    }
    if (table === "tokens") {
      return {
        select: () => ({
          eq: () => ({ maybeSingle: async () => ({ data: existingToken, error: null }) }),
        }),
        insert: async (row: Record<string, unknown>) => {
          insertedRows.tokens.push(row);
          return { data: null, error: tokenInsertError };
        },
        update: (values: Record<string, unknown>) => ({
          eq: async (col: string, val: unknown) => {
            updatedRows.tokens.push({ values, eq: [col, val] });
            return { data: null, error: null };
          },
        }),
      };
    }
    if (table === "entitlements") {
      return {
        select: () => ({
          eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }),
        }),
        update: (values: Record<string, unknown>) => ({
          eq: async (col: string, val: unknown) => {
            updatedRows.entitlements.push({ values, eq: [col, val] });
            return { data: null, error: null };
          },
        }),
      };
    }
    if (table === "xp_events") {
      return {
        insert: async (row: Record<string, unknown>) => {
          insertedRows.xp_events.push(row);
          return { data: null, error: null };
        },
      };
    }
    return { insert: async () => ({ data: null, error: null }) };
  };

  return { from, insertedRows, updatedRows };
}

let mockSupabase: ReturnType<typeof buildSupabaseMock>;
vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: () => mockSupabase,
}));

const completedEvent = {
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
};

function buildRequest() {
  return new NextRequest("http://localhost/api/webhooks/stripe", {
    method: "POST",
    body: "{}",
    headers: { "stripe-signature": "sig_test" },
  });
}

describe("POST /api/webhooks/stripe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = buildSupabaseMock();
  });

  it("cria user, purchase, token e envia e-mail em checkout.session.completed", async () => {
    mockConstructEvent.mockReturnValue(completedEvent);

    const { POST } = await import("./route");
    const response = await POST(buildRequest());
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

  it("dedupe: compra e token já existem → não reprocessa nem reenvia e-mail", async () => {
    mockSupabase = buildSupabaseMock({
      existingPurchase: { id: "purchase-existente" },
      existingToken: { token: "TOKENEXISTE" },
    });
    mockConstructEvent.mockReturnValue(completedEvent);

    const { POST } = await import("./route");
    const response = await POST(buildRequest());
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.deduped).toBe(true);
    expect(mockSupabase.insertedRows.purchases).toHaveLength(0);
    expect(mockSupabase.insertedRows.tokens).toHaveLength(0);
    expect(mockSendTokenEmail).not.toHaveBeenCalled();
  });

  it("recuperação: compra existe mas o token faltou (reentrega) → cria token e envia e-mail", async () => {
    mockSupabase = buildSupabaseMock({
      existingPurchase: { id: "purchase-existente" },
      existingToken: null,
    });
    mockConstructEvent.mockReturnValue(completedEvent);

    const { POST } = await import("./route");
    const response = await POST(buildRequest());
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.received).toBe(true);
    expect(json.deduped).toBeUndefined();
    // Não recria a compra nem duplica XP; apenas completa o token que faltava.
    expect(mockSupabase.insertedRows.purchases).toHaveLength(0);
    expect(mockSupabase.insertedRows.xp_events).toHaveLength(0);
    expect(mockSupabase.insertedRows.tokens).toHaveLength(1);
    expect(mockSendTokenEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "aluno@example.com" })
    );
  });

  it("falha ao gravar o token → 500 (para a Stripe reentregar e recuperar)", async () => {
    mockSupabase = buildSupabaseMock({
      tokenInsertError: { message: "indisponível" },
    });
    mockConstructEvent.mockReturnValue(completedEvent);

    const { POST } = await import("./route");
    const response = await POST(buildRequest());

    expect(response.status).toBe(500);
    // O e-mail NÃO deve sair com um token que não foi persistido.
    expect(mockSendTokenEmail).not.toHaveBeenCalled();
  });

  it("rejeita requisição com assinatura inválida", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("assinatura inválida");
    });

    const { POST } = await import("./route");
    const response = await POST(buildRequest());
    expect(response.status).toBe(400);
  });

  it("charge.refunded: revoga acesso (purchase.status, token.valid_until, entitlement.expires_at)", async () => {
    mockSupabase = buildSupabaseMock({ existingPurchase: { id: "purchase-existente" } });
    mockConstructEvent.mockReturnValue({
      type: "charge.refunded",
      data: { object: { id: "ch_123", payment_intent: "pi_123" } },
    });

    const { POST } = await import("./route");
    const response = await POST(buildRequest());
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.received).toBe(true);
    expect(mockSupabase.updatedRows.purchases).toEqual([
      { values: { status: "refunded" }, eq: ["id", "purchase-existente"] },
    ]);
    expect(mockSupabase.updatedRows.tokens).toHaveLength(1);
    expect(mockSupabase.updatedRows.tokens[0].values).toHaveProperty("valid_until");
    expect(mockSupabase.updatedRows.tokens[0].eq).toEqual(["purchase_id", "purchase-existente"]);
    expect(mockSupabase.updatedRows.entitlements).toHaveLength(1);
    expect(mockSupabase.updatedRows.entitlements[0].values).toHaveProperty("expires_at");
    expect(mockSupabase.updatedRows.entitlements[0].eq).toEqual(["stripe_payment_id", "pi_123"]);
  });

  it("charge.dispute.created: revoga acesso com status disputed", async () => {
    mockSupabase = buildSupabaseMock({ existingPurchase: { id: "purchase-existente" } });
    mockConstructEvent.mockReturnValue({
      type: "charge.dispute.created",
      data: { object: { id: "ch_456", payment_intent: "pi_456" } },
    });

    const { POST } = await import("./route");
    const response = await POST(buildRequest());

    expect(response.status).toBe(200);
    expect(mockSupabase.updatedRows.purchases).toEqual([
      { values: { status: "disputed" }, eq: ["id", "purchase-existente"] },
    ]);
  });

  it("charge.refunded para compra desconhecida: no-op idempotente", async () => {
    mockSupabase = buildSupabaseMock({ existingPurchase: null });
    mockConstructEvent.mockReturnValue({
      type: "charge.refunded",
      data: { object: { id: "ch_789", payment_intent: "pi_789" } },
    });

    const { POST } = await import("./route");
    const response = await POST(buildRequest());

    expect(response.status).toBe(200);
    expect(mockSupabase.updatedRows.purchases).toHaveLength(0);
    expect(mockSupabase.updatedRows.tokens).toHaveLength(0);
    expect(mockSupabase.updatedRows.entitlements).toHaveLength(0);
  });

  it("evento ignorado (payment_intent.succeeded) → received sem processar", async () => {
    mockConstructEvent.mockReturnValue({ type: "payment_intent.succeeded", data: { object: {} } });

    const { POST } = await import("./route");
    const response = await POST(buildRequest());
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.received).toBe(true);
  });
});
