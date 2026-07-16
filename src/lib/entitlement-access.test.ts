import { describe, expect, it, vi, beforeEach } from "vitest";

type Row = Record<string, unknown>;

/** Query-builder falso: aceita `.eq()` encadeado (0, 1 ou 2x), `.maybeSingle()`
 *  e é "thenable" (funciona com `await` direto, como o supabase-js real). */
function makeSelectChain(rows: Row[]) {
  let filtered = rows;
  const chain = {
    eq(field: string, value: unknown) {
      filtered = filtered.filter((r) => r[field] === value);
      return chain;
    },
    maybeSingle: async () => ({ data: filtered[0] ?? null, error: null }),
    then(resolve: (v: { data: Row[]; error: null }) => void) {
      resolve({ data: filtered, error: null });
    },
  };
  return chain;
}

/** Igual ao select chain, mas ao resolver remove da lista original as linhas filtradas. */
function makeDeleteChain(rows: Row[]) {
  let filtered = rows;
  const chain = {
    eq(field: string, value: unknown) {
      filtered = filtered.filter((r) => r[field] === value);
      return chain;
    },
    then(resolve: (v: { data: null; error: null }) => void) {
      for (const row of filtered) {
        const idx = rows.indexOf(row);
        if (idx !== -1) rows.splice(idx, 1);
      }
      resolve({ data: null, error: null });
    },
  };
  return chain;
}

function buildSupabaseMock(
  opts: {
    tokenRow?: { purchase_id: string } | null;
    purchaseRow?: { user_id: string } | null;
    entitlements?: Array<{ plan: string; starts_at: string; expires_at: string; user_id?: string }>;
    contentUnlocks?: Array<{ user_id: string; content_id: string; cycle_key: string }>;
    insertError?: { code: string } | null;
  } = {}
) {
  const tokenRow = "tokenRow" in opts ? opts.tokenRow ?? null : null;
  const purchaseRow = "purchaseRow" in opts ? opts.purchaseRow ?? null : null;
  const entitlements: Row[] = [...(opts.entitlements ?? [])];
  const contentUnlocks: Row[] = [...(opts.contentUnlocks ?? [])];
  const insertError = opts.insertError ?? null;

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
          eq: () => ({ maybeSingle: async () => ({ data: purchaseRow, error: null }) }),
        }),
      };
    }
    if (table === "entitlements") {
      return { select: () => makeSelectChain(entitlements) };
    }
    if (table === "content_unlocks") {
      return {
        select: () => makeSelectChain(contentUnlocks),
        insert: async (row: Row) => {
          if (insertError) return { data: null, error: insertError };
          contentUnlocks.push(row);
          return { data: row, error: null };
        },
        delete: () => makeDeleteChain(contentUnlocks),
      };
    }
    throw new Error(`tabela inesperada: ${table}`);
  };

  return { from, contentUnlocks };
}

let mockSupabase: ReturnType<typeof buildSupabaseMock>;
vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: () => mockSupabase,
}));

const now = new Date();
const iso = (offsetMs: number) => new Date(now.getTime() + offsetMs).toISOString();
const DAY = 24 * 60 * 60 * 1000;

describe("resolveUserIdByToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = buildSupabaseMock();
  });

  it("token existente → resolve o user_id via purchases", async () => {
    mockSupabase = buildSupabaseMock({
      tokenRow: { purchase_id: "purchase-1" },
      purchaseRow: { user_id: "user-1" },
    });

    const { resolveUserIdByToken } = await import("./entitlement-access");
    const result = await resolveUserIdByToken("tok-abc");

    expect(result).toBe("user-1");
  });

  it("token inexistente → null (não consulta purchases)", async () => {
    mockSupabase = buildSupabaseMock({ tokenRow: null });

    const { resolveUserIdByToken } = await import("./entitlement-access");
    const result = await resolveUserIdByToken("tok-invalido");

    expect(result).toBeNull();
  });
});

describe("getAccessContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = buildSupabaseMock();
  });

  it("sem entitlement → access 'view', startsAt null, sem unlocks", async () => {
    mockSupabase = buildSupabaseMock({ entitlements: [], contentUnlocks: [] });

    const { getAccessContext } = await import("./entitlement-access");
    const ctx = await getAccessContext("user-1");

    expect(ctx.access).toBe("view");
    expect(ctx.startsAt).toBeNull();
    expect(ctx.unlockedContentIds).toEqual([]);
    expect(ctx.unlockedCycleKeys).toEqual([]);
  });

  it("entitlement 'advanced' não-expirado → access 'advanced' e startsAt do entitlement vigente", async () => {
    mockSupabase = buildSupabaseMock({
      entitlements: [
        { user_id: "user-1", plan: "advanced", starts_at: iso(-10 * DAY), expires_at: iso(20 * DAY) },
      ],
    });

    const { getAccessContext } = await import("./entitlement-access");
    const ctx = await getAccessContext("user-1");

    expect(ctx.access).toBe("advanced");
    expect(ctx.startsAt).toEqual(new Date(iso(-10 * DAY)));
  });

  it("entitlement expirado → access 'view' (ignora o plano expirado)", async () => {
    mockSupabase = buildSupabaseMock({
      entitlements: [
        { user_id: "user-1", plan: "advanced", starts_at: iso(-40 * DAY), expires_at: iso(-1 * DAY) },
      ],
    });

    const { getAccessContext } = await import("./entitlement-access");
    const ctx = await getAccessContext("user-1");

    expect(ctx.access).toBe("view");
    expect(ctx.startsAt).toBeNull();
  });

  it("retorna unlockedContentIds e unlockedCycleKeys a partir de content_unlocks", async () => {
    mockSupabase = buildSupabaseMock({
      contentUnlocks: [
        { user_id: "user-1", content_id: "c1", cycle_key: "cycle-0" },
        { user_id: "user-1", content_id: "c2", cycle_key: "cycle-1" },
        { user_id: "outro-user", content_id: "c3", cycle_key: "cycle-0" },
      ],
    });

    const { getAccessContext } = await import("./entitlement-access");
    const ctx = await getAccessContext("user-1");

    expect(ctx.unlockedContentIds).toEqual(["c1", "c2"]);
    expect(ctx.unlockedCycleKeys).toEqual(["cycle-0", "cycle-1"]);
  });
});

describe("tryConsume", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = buildSupabaseMock();
  });

  it("startIncluded=true → allowed, independente do access level", async () => {
    mockSupabase = buildSupabaseMock({ entitlements: [], contentUnlocks: [] });

    const { tryConsume } = await import("./entitlement-access");
    const result = await tryConsume("user-1", "content-1", true);

    expect(result).toEqual({ allowed: true, reason: "start-included" });
  });

  it("access 'advanced' → allowed sem precisar de unlock", async () => {
    mockSupabase = buildSupabaseMock({
      entitlements: [
        { user_id: "user-1", plan: "advanced", starts_at: iso(-10 * DAY), expires_at: iso(20 * DAY) },
      ],
    });

    const { tryConsume } = await import("./entitlement-access");
    const result = await tryConsume("user-1", "content-1", false);

    expect(result).toEqual({ allowed: true, reason: "advanced" });
  });

  it("access 'view' sem unlock prévio → not allowed (gated)", async () => {
    mockSupabase = buildSupabaseMock({ entitlements: [], contentUnlocks: [] });

    const { tryConsume } = await import("./entitlement-access");
    const result = await tryConsume("user-1", "content-1", false);

    expect(result).toEqual({ allowed: false, reason: "gated" });
  });

  it("access 'regular' com slot de ciclo livre → allowed e persiste o unlock em content_unlocks", async () => {
    mockSupabase = buildSupabaseMock({
      entitlements: [
        { user_id: "user-1", plan: "regular", starts_at: now.toISOString(), expires_at: iso(30 * DAY) },
      ],
      contentUnlocks: [],
    });

    const { tryConsume } = await import("./entitlement-access");
    const result = await tryConsume("user-1", "content-1", false);

    expect(result).toEqual({ allowed: true, reason: "cycle-slot" });
    expect(mockSupabase.contentUnlocks).toHaveLength(1);
    expect(mockSupabase.contentUnlocks[0]).toMatchObject({ user_id: "user-1", content_id: "content-1" });
  });

  it("access 'regular' com conteúdo já desbloqueado → allowed sem gravar de novo", async () => {
    mockSupabase = buildSupabaseMock({
      entitlements: [
        { user_id: "user-1", plan: "regular", starts_at: now.toISOString(), expires_at: iso(30 * DAY) },
      ],
      contentUnlocks: [{ user_id: "user-1", content_id: "content-1", cycle_key: "cycle-0" }],
    });

    const { tryConsume } = await import("./entitlement-access");
    const result = await tryConsume("user-1", "content-1", false);

    expect(result).toEqual({ allowed: true, reason: "already-unlocked" });
    expect(mockSupabase.contentUnlocks).toHaveLength(1);
  });
});
