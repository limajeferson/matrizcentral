export type AccessLevel = "view" | "regular" | "advanced";
export type EntitlementLite = { plan: "regular" | "advanced"; expires_at: string };

const RANK: Record<AccessLevel, number> = { view: 0, regular: 1, advanced: 2 };

/** Nível de acesso vigente: o mais alto entre os entitlements não-expirados. */
export function resolveAccess(ents: EntitlementLite[], now: Date = new Date()): AccessLevel {
  let best: AccessLevel = "view";
  for (const e of ents) {
    if (new Date(e.expires_at).getTime() > now.getTime() && RANK[e.plan] > RANK[best]) {
      best = e.plan;
    }
  }
  return best;
}
