import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

let resolved: { userId: string; email: string } | null;
vi.mock("@/lib/access", () => ({
  resolveUserBySessionId: async () => resolved,
}));
vi.mock("@/lib/auth-session", () => ({
  createSession: async () => "sess-secret",
  SESSION_COOKIE: "mc_session",
  SESSION_MAX_AGE_SECONDS: 100,
}));

function req(body: unknown) {
  return new NextRequest("http://localhost/api/checkout-login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/checkout-login", () => {
  beforeEach(() => vi.clearAllMocks());

  it("400 sem sessionId", async () => {
    resolved = null;
    const { POST } = await import("./route");
    const res = await POST(req({}));
    expect(res.status).toBe(400);
  });

  it("ready:false quando não resolve (webhook ainda processando / não paga)", async () => {
    resolved = null;
    const { POST } = await import("./route");
    const res = await POST(req({ sessionId: "cs_test_x" }));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.ready).toBe(false);
    expect(res.cookies.get("mc_session")).toBeUndefined();
  });

  it("ready:true + seta cookie de sessão quando resolve", async () => {
    resolved = { userId: "u1", email: "a@b.com" };
    const { POST } = await import("./route");
    const res = await POST(req({ sessionId: "cs_test_x" }));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.ready).toBe(true);
    expect(res.cookies.get("mc_session")?.value).toBe("sess-secret");
  });
});
