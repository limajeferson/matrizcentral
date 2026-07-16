import { describe, expect, it, vi, beforeEach } from "vitest";
import { hashAuthSecret } from "./auth-tokens";

type UserRow = { id: string; email: string };
type MagicLinkRow = {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
};
type SessionRow = {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
};

/** Fila falsa para `magic_links`: encadeia `.eq()`/`.gt()` e resolve com `.maybeSingle()`,
 *  igual ao supabase-js real. */
function makeMagicLinksSelectChain(rows: MagicLinkRow[]) {
  let filtered = rows;
  const chain = {
    eq(field: keyof MagicLinkRow, value: unknown) {
      filtered = filtered.filter((r) => r[field] === value);
      return chain;
    },
    gt(field: keyof MagicLinkRow, value: unknown) {
      filtered = filtered.filter((r) => (r[field] as string) > (value as string));
      return chain;
    },
    maybeSingle: async () => ({ data: filtered[0] ?? null, error: null }),
  };
  return chain;
}

function buildSupabaseMock(
  opts: {
    users?: UserRow[];
    magicLinks?: MagicLinkRow[];
    sessions?: SessionRow[];
  } = {}
) {
  const users = [...(opts.users ?? [])];
  const magicLinks = [...(opts.magicLinks ?? [])];
  const sessions = [...(opts.sessions ?? [])];

  const from = (table: string) => {
    if (table === "users") {
      return {
        select: () => ({
          eq: (field: keyof UserRow, value: unknown) => ({
            maybeSingle: async () => ({
              data: users.find((u) => u[field] === value) ?? null,
              error: null,
            }),
          }),
        }),
      };
    }
    if (table === "magic_links") {
      return {
        select: () => makeMagicLinksSelectChain(magicLinks),
        insert: async (row: Partial<MagicLinkRow>) => {
          magicLinks.push({
            id: `ml-${magicLinks.length + 1}`,
            used_at: null,
            created_at: new Date().toISOString(),
            ...row,
          } as MagicLinkRow);
          return { error: null };
        },
        // .update({used_at}).eq("id", id).is("used_at", null).select("id").maybeSingle()
        update: (patch: { used_at: string }) => ({
          eq: (_field: string, id: unknown) => ({
            is: () => ({
              select: () => ({
                maybeSingle: async () => {
                  const row = magicLinks.find((r) => r.id === id && r.used_at === null);
                  if (!row) return { data: null, error: null };
                  row.used_at = patch.used_at;
                  return { data: { id: row.id }, error: null };
                },
              }),
            }),
          }),
        }),
      };
    }
    if (table === "sessions") {
      return {
        select: () => ({
          eq: (field: keyof SessionRow, value: unknown) => ({
            maybeSingle: async () => ({
              data: sessions.find((s) => s[field] === value) ?? null,
              error: null,
            }),
          }),
        }),
        insert: async (row: Partial<SessionRow>) => {
          sessions.push({ id: `s-${sessions.length + 1}`, ...row } as SessionRow);
          return { error: null };
        },
        delete: () => ({
          eq: async (field: keyof SessionRow, value: unknown) => {
            const idx = sessions.findIndex((s) => s[field] === value);
            if (idx !== -1) sessions.splice(idx, 1);
            return { data: null, error: null };
          },
        }),
      };
    }
    throw new Error(`tabela inesperada: ${table}`);
  };

  return { from, users, magicLinks, sessions };
}

let mockSupabase: ReturnType<typeof buildSupabaseMock>;
vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: () => mockSupabase,
}));

const sentEmails: Array<{ to: string; secret: string }> = [];
vi.mock("@/lib/email", () => ({
  sendMagicLinkEmail: vi.fn(async (params: { to: string; secret: string }) => {
    sentEmails.push(params);
  }),
}));

const SESSION_COOKIE = "mc_session";
let cookieValue: string | undefined;
const mockCookieStore = {
  get: (name: string) =>
    name === SESSION_COOKIE && cookieValue !== undefined ? { value: cookieValue } : undefined,
  set: (value: string) => {
    cookieValue = value;
  },
  delete: () => {
    cookieValue = undefined;
  },
};
vi.mock("next/headers", () => ({
  cookies: () => mockCookieStore,
}));

const now = new Date();
const iso = (offsetMs: number) => new Date(now.getTime() + offsetMs).toISOString();
const MIN = 60 * 1000;

beforeEach(() => {
  vi.clearAllMocks();
  mockSupabase = buildSupabaseMock();
  sentEmails.length = 0;
  cookieValue = undefined;
});

describe("requestMagicLink", () => {
  it("e-mail sem conta → 'no-account', não cria magic_link nem envia e-mail", async () => {
    mockSupabase = buildSupabaseMock({ users: [] });

    const { requestMagicLink } = await import("./auth-session");
    const result = await requestMagicLink("fantasma@example.com");

    expect(result).toBe("no-account");
    expect(mockSupabase.magicLinks).toHaveLength(0);
    expect(sentEmails).toHaveLength(0);
  });

  it("e-mail com conta → 'sent', cria magic_link e envia e-mail", async () => {
    mockSupabase = buildSupabaseMock({
      users: [{ id: "user-1", email: "aluno@example.com" }],
    });

    const { requestMagicLink } = await import("./auth-session");
    const result = await requestMagicLink("ALUNO@example.com "); // testa trim + lowercase

    expect(result).toBe("sent");
    expect(mockSupabase.magicLinks).toHaveLength(1);
    expect(mockSupabase.magicLinks[0]).toMatchObject({ user_id: "user-1" });
    expect(sentEmails).toHaveLength(1);
    expect(sentEmails[0].to).toBe("aluno@example.com");
  });

  it("throttle: já existe magic_link recente → 'sent' sem criar novo nem reenviar e-mail", async () => {
    mockSupabase = buildSupabaseMock({
      users: [{ id: "user-1", email: "aluno@example.com" }],
      magicLinks: [
        {
          id: "ml-existing",
          user_id: "user-1",
          token_hash: "hash-existing",
          expires_at: iso(15 * MIN),
          used_at: null,
          created_at: iso(-10 * 1000), // criado há 10s, dentro da janela de throttle (1 min)
        },
      ],
    });

    const { requestMagicLink } = await import("./auth-session");
    const result = await requestMagicLink("aluno@example.com");

    expect(result).toBe("sent");
    expect(mockSupabase.magicLinks).toHaveLength(1); // não criou um segundo
    expect(sentEmails).toHaveLength(0); // não reenviou
  });
});

describe("verifyMagicLink", () => {
  it("secret válido e não-usado → retorna SessionUser e marca uso único", async () => {
    const secret = "raw-secret-valido";
    mockSupabase = buildSupabaseMock({
      users: [{ id: "user-1", email: "aluno@example.com" }],
      magicLinks: [
        {
          id: "ml-1",
          user_id: "user-1",
          token_hash: hashAuthSecret(secret),
          expires_at: iso(10 * MIN),
          used_at: null,
          created_at: iso(-1000),
        },
      ],
    });

    const { verifyMagicLink } = await import("./auth-session");
    const result = await verifyMagicLink(secret);

    expect(result).toEqual({ id: "user-1", email: "aluno@example.com" });
    expect(mockSupabase.magicLinks[0].used_at).not.toBeNull();
  });

  it("secret já usado → null", async () => {
    const secret = "raw-secret-usado";
    mockSupabase = buildSupabaseMock({
      users: [{ id: "user-1", email: "aluno@example.com" }],
      magicLinks: [
        {
          id: "ml-1",
          user_id: "user-1",
          token_hash: hashAuthSecret(secret),
          expires_at: iso(10 * MIN),
          used_at: iso(-5 * MIN), // já usado
          created_at: iso(-10 * MIN),
        },
      ],
    });

    const { verifyMagicLink } = await import("./auth-session");
    const result = await verifyMagicLink(secret);

    expect(result).toBeNull();
  });

  it("secret expirado → null", async () => {
    const secret = "raw-secret-expirado";
    mockSupabase = buildSupabaseMock({
      users: [{ id: "user-1", email: "aluno@example.com" }],
      magicLinks: [
        {
          id: "ml-1",
          user_id: "user-1",
          token_hash: hashAuthSecret(secret),
          expires_at: iso(-1 * MIN), // expirou há 1 min
          used_at: null,
          created_at: iso(-20 * MIN),
        },
      ],
    });

    const { verifyMagicLink } = await import("./auth-session");
    const result = await verifyMagicLink(secret);

    expect(result).toBeNull();
  });

  it("secret inexistente (hash não bate com nenhum link) → null", async () => {
    mockSupabase = buildSupabaseMock({ users: [], magicLinks: [] });

    const { verifyMagicLink } = await import("./auth-session");
    const result = await verifyMagicLink("secret-que-nao-existe");

    expect(result).toBeNull();
  });

  it("claim é atômico: segunda chamada com o mesmo secret → null (não reaproveita)", async () => {
    const secret = "raw-secret-duplo-clique";
    mockSupabase = buildSupabaseMock({
      users: [{ id: "user-1", email: "aluno@example.com" }],
      magicLinks: [
        {
          id: "ml-1",
          user_id: "user-1",
          token_hash: hashAuthSecret(secret),
          expires_at: iso(10 * MIN),
          used_at: null,
          created_at: iso(-1000),
        },
      ],
    });

    const { verifyMagicLink } = await import("./auth-session");
    const first = await verifyMagicLink(secret);
    const second = await verifyMagicLink(secret);

    expect(first).toEqual({ id: "user-1", email: "aluno@example.com" });
    expect(second).toBeNull();
  });
});

describe("createSession", () => {
  it("cria sessão para o usuário e devolve o segredo cru (hash bate no banco)", async () => {
    mockSupabase = buildSupabaseMock();

    const { createSession } = await import("./auth-session");
    const secret = await createSession("user-1");

    expect(typeof secret).toBe("string");
    expect(mockSupabase.sessions).toHaveLength(1);
    expect(mockSupabase.sessions[0]).toMatchObject({
      user_id: "user-1",
      token_hash: hashAuthSecret(secret),
    });
  });
});

describe("getSessionUser", () => {
  it("cookie de sessão válido e não-expirada → SessionUser", async () => {
    const secret = "session-secret-valida";
    cookieValue = secret;
    mockSupabase = buildSupabaseMock({
      users: [{ id: "user-1", email: "aluno@example.com" }],
      sessions: [
        {
          id: "s-1",
          user_id: "user-1",
          token_hash: hashAuthSecret(secret),
          expires_at: iso(10 * MIN),
        },
      ],
    });

    const { getSessionUser } = await import("./auth-session");
    const result = await getSessionUser();

    expect(result).toEqual({ id: "user-1", email: "aluno@example.com" });
  });

  it("sem cookie → null", async () => {
    cookieValue = undefined;
    mockSupabase = buildSupabaseMock();

    const { getSessionUser } = await import("./auth-session");
    const result = await getSessionUser();

    expect(result).toBeNull();
  });

  it("sessão revogada/inexistente (cookie não bate com nenhuma sessão) → null", async () => {
    cookieValue = "secret-revogado";
    mockSupabase = buildSupabaseMock({
      users: [{ id: "user-1", email: "aluno@example.com" }],
      sessions: [],
    });

    const { getSessionUser } = await import("./auth-session");
    const result = await getSessionUser();

    expect(result).toBeNull();
  });

  it("sessão expirada → null", async () => {
    const secret = "session-secret-expirada";
    cookieValue = secret;
    mockSupabase = buildSupabaseMock({
      users: [{ id: "user-1", email: "aluno@example.com" }],
      sessions: [
        {
          id: "s-1",
          user_id: "user-1",
          token_hash: hashAuthSecret(secret),
          expires_at: iso(-1 * MIN),
        },
      ],
    });

    const { getSessionUser } = await import("./auth-session");
    const result = await getSessionUser();

    expect(result).toBeNull();
  });
});

describe("revokeCurrentSession", () => {
  it("remove a sessão correspondente ao cookie atual do banco", async () => {
    const secret = "session-secret-a-revogar";
    cookieValue = secret;
    mockSupabase = buildSupabaseMock({
      users: [{ id: "user-1", email: "aluno@example.com" }],
      sessions: [
        {
          id: "s-1",
          user_id: "user-1",
          token_hash: hashAuthSecret(secret),
          expires_at: iso(10 * MIN),
        },
      ],
    });

    const { revokeCurrentSession, getSessionUser } = await import("./auth-session");
    await revokeCurrentSession();

    expect(mockSupabase.sessions).toHaveLength(0);
    // cookie continua presente, mas a sessão já não existe no banco → getSessionUser nega
    expect(await getSessionUser()).toBeNull();
  });

  it("sem cookie → não faz nada e não lança", async () => {
    cookieValue = undefined;
    mockSupabase = buildSupabaseMock({
      sessions: [
        {
          id: "s-1",
          user_id: "user-1",
          token_hash: "hash-de-outra-sessao",
          expires_at: iso(10 * MIN),
        },
      ],
    });

    const { revokeCurrentSession } = await import("./auth-session");
    await expect(revokeCurrentSession()).resolves.toBeUndefined();
    expect(mockSupabase.sessions).toHaveLength(1); // não mexeu em sessões de outros
  });
});
