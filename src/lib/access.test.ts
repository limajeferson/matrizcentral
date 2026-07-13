import { describe, expect, it, vi, beforeEach } from "vitest";

let stripeSession: Record<string, unknown> = {};
const mockRetrieve = vi.fn(async (..._args: unknown[]) => stripeSession);
vi.mock("@/lib/stripe", () => ({
  stripe: { checkout: { sessions: { retrieve: (...args: unknown[]) => mockRetrieve(...args) } } },
}));

function buildSupabaseMock(
  opts: {
    purchase?: { user_id: string } | null;
    user?: { id: string; email: string } | null;
    consumeError?: { code: string } | null;
  } = {}
) {
  const purchase =
    "purchase" in opts ? opts.purchase ?? null : { user_id: "user-1" };
  const user = "user" in opts ? opts.user ?? null : { id: "user-1", email: "aluno@example.com" };
  const consumeError = opts.consumeError ?? null;

  const inserted: Record<string, unknown[]> = { checkout_logins: [] };

  const from = (table: string) => {
    if (table === "purchases") {
      return {
        select: () => ({
          eq: () => ({ maybeSingle: async () => ({ data: purchase, error: null }) }),
        }),
      };
    }
    if (table === "users") {
      return {
        select: () => ({
          eq: () => ({ maybeSingle: async () => ({ data: user, error: null }) }),
        }),
      };
    }
    if (table === "checkout_logins") {
      return {
        insert: async (row: Record<string, unknown>) => {
          inserted.checkout_logins.push(row);
          return { data: null, error: consumeError };
        },
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

describe("resolveUserBySessionId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = buildSupabaseMock();
  });

  it("pago, dentro da janela, compra+user presentes, sem conflito → retorna usuário e consome o session_id", async () => {
    stripeSession = {
      payment_status: "paid",
      created: Math.floor(Date.now() / 1000),
      payment_intent: "pi_123",
    };

    const { resolveUserBySessionId } = await import("./access");
    const result = await resolveUserBySessionId("cs_test_123");

    expect(result).toEqual({ userId: "user-1", email: "aluno@example.com" });
    expect(mockSupabase.inserted.checkout_logins).toHaveLength(1);
    expect(mockSupabase.inserted.checkout_logins[0]).toMatchObject({
      session_id: "cs_test_123",
      user_id: "user-1",
    });
  });

  it("payment_status !== paid → null", async () => {
    stripeSession = {
      payment_status: "unpaid",
      created: Math.floor(Date.now() / 1000),
      payment_intent: "pi_123",
    };

    const { resolveUserBySessionId } = await import("./access");
    const result = await resolveUserBySessionId("cs_test_123");

    expect(result).toBeNull();
  });

  it("criado fora da janela de 30 min → null", async () => {
    stripeSession = {
      payment_status: "paid",
      created: Math.floor(Date.now() / 1000) - 31 * 60,
      payment_intent: "pi_123",
    };

    const { resolveUserBySessionId } = await import("./access");
    const result = await resolveUserBySessionId("cs_test_123");

    expect(result).toBeNull();
  });

  it("replay (session_id já consumido) → null", async () => {
    mockSupabase = buildSupabaseMock({ consumeError: { code: "23505" } });
    stripeSession = {
      payment_status: "paid",
      created: Math.floor(Date.now() / 1000),
      payment_intent: "pi_123",
    };

    const { resolveUserBySessionId } = await import("./access");
    const result = await resolveUserBySessionId("cs_test_123");

    expect(result).toBeNull();
  });

  it("compra ainda não existe → null e não consome o session_id cedo demais", async () => {
    mockSupabase = buildSupabaseMock({ purchase: null });
    stripeSession = {
      payment_status: "paid",
      created: Math.floor(Date.now() / 1000),
      payment_intent: "pi_123",
    };

    const { resolveUserBySessionId } = await import("./access");
    const result = await resolveUserBySessionId("cs_test_123");

    expect(result).toBeNull();
    expect(mockSupabase.inserted.checkout_logins).toHaveLength(0);
  });
});
