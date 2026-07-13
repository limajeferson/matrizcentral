# Assinaturas — Plano 1: Núcleo de receita (entitlement + consumo + Stripe + /oferta)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Tornar Regular/Advanced compra real (Stripe), ligar o consumo de conteúdo a um entitlement por usuário via o `ContentGate`, e aplicar o cupom de upgrade. (Os e-mails de ciclo são o Plano 2.)

**Architecture:** Passes não-recorrentes (`mode: "payment"`). O webhook cria `entitlements` além do token. Lógica de acesso é pura e testável (`resolveAccess`, `canConsume`, `couponEligible`); a camada de dados resolve o usuário por token OU sessão e grava desbloqueios. As páginas de consumo checam antes de entregar; senão renderizam `<ContentGate>`. Cupom de R$47 é auto-aplicado abaixando o preço (sem objeto de cupom no Stripe).

**Tech Stack:** Next 14 (App Router, route handlers), `@supabase/supabase-js` (service_role), `stripe` (já instalado), Vitest (node env), Tailwind.

## Global Constraints

- **Custo zero:** sem dependência npm nova. pt-BR em toda copy.
- **Gate:** `npx tsc --noEmit` (0) + `npm run test` (verde). `npm run build` falha sem `STRIPE_SECRET_KEY` (pré-existente, não é regressão).
- **Vitest node-env:** só lógica pura em `src/lib` tem teste automático; I/O (Supabase/Stripe) é verificado no navegador (Stripe **modo teste** — live está bloqueado).
- **Modelo canônico (fonte de verdade = `spec.md`):** Start R$47 (view-only) · Regular R$97 (passe 12m, 1 conteúdo/mês, acumula) · Advanced R$497 ou 12x R$47 (passe 12m, tudo + feed). Escada (cada tier inclui os de baixo). Ciclo = **aniversário da compra**. Cupom R$47 válido **30 dias**, automático.
- **Produtos:** `metadata.product_id` ∈ `ebook_llm_local` | `regular_pass` | `advanced_pass`.
- **Migrations aditivas**, default-deny RLS (padrão do `0001`). Não tocar `users`/`purchases`/`tokens` existentes.

---

## File Structure

**Criar:** `supabase/migrations/0017_entitlements.sql`, `0018_content_unlocks.sql`; `src/lib/entitlements.ts`(+test), `src/lib/consumption.ts`(+test), `src/lib/coupon.ts`(+test), `src/lib/entitlement-access.ts`.
**Modificar:** `src/types/index.ts` (2 tabelas), `src/lib/stripe.ts` (2 produtos), `src/app/api/checkout/route.ts` (plano+cupom+parcelas), `src/app/api/webhooks/stripe/route.ts` (entitlement), `src/data/content-hub.ts` (flag `startIncluded`), `src/app/dashboard/[token]/conteudo/[id]/page.tsx` (enforcement), `src/components/marketing/OfferPricing.tsx` (checkout real + copy Start).

---

## Task 1: Migrations + tipos

**Files:** Create `supabase/migrations/0017_entitlements.sql`, `supabase/migrations/0018_content_unlocks.sql`; Modify `src/types/index.ts`.

**Interfaces — Produces:** tabelas `entitlements`(`id,user_id,plan,starts_at,expires_at,stripe_payment_id,created_at`) e `content_unlocks`(`id,user_id,content_id,cycle_key,unlocked_at`), e seus tipos no `Database`.

- [ ] **Step 1: migration entitlements**

Create `supabase/migrations/0017_entitlements.sql`:
```sql
create table if not exists entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  plan text not null check (plan in ('regular','advanced')),
  starts_at timestamptz not null default now(),
  expires_at timestamptz not null,
  stripe_payment_id text unique,
  created_at timestamptz not null default now()
);
create index if not exists entitlements_user_id_idx on entitlements(user_id);
alter table entitlements enable row level security;
```

- [ ] **Step 2: migration content_unlocks**

Create `supabase/migrations/0018_content_unlocks.sql`:
```sql
create table if not exists content_unlocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  content_id text not null,
  cycle_key text not null,
  unlocked_at timestamptz not null default now(),
  unique (user_id, content_id)
);
create index if not exists content_unlocks_user_idx on content_unlocks(user_id);
alter table content_unlocks enable row level security;
```

- [ ] **Step 3: tipos** — em `src/types/index.ts`, após o bloco `sessions` (dentro de `Tables`), adicionar:
```ts
      entitlements: {
        Row: { id: string; user_id: string; plan: "regular" | "advanced"; starts_at: string; expires_at: string; stripe_payment_id: string | null; created_at: string };
        Insert: { id?: string; user_id: string; plan: "regular" | "advanced"; starts_at?: string; expires_at: string; stripe_payment_id?: string | null; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["entitlements"]["Insert"]>;
        Relationships: [];
      };
      content_unlocks: {
        Row: { id: string; user_id: string; content_id: string; cycle_key: string; unlocked_at: string };
        Insert: { id?: string; user_id: string; content_id: string; cycle_key: string; unlocked_at?: string };
        Update: Partial<Database["public"]["Tables"]["content_unlocks"]["Insert"]>;
        Relationships: [];
      };
```

- [ ] **Step 4:** `npx tsc --noEmit` → exit 0.
- [ ] **Step 5: aplicar no Supabase remoto** — via SQL Editor (o `db push` está travado por histórico divergente — ver ESTADO-ATUAL). Rodar o SQL dos Steps 1-2. *(Controller aplica; ver nota de execução.)*
- [ ] **Step 6: commit** — `git add supabase/migrations/0017_entitlements.sql supabase/migrations/0018_content_unlocks.sql src/types/index.ts && git commit -m "feat(assinaturas): tabelas entitlements e content_unlocks + tipos"`

---

## Task 2: `entitlements.ts` — resolveAccess (TDD)

**Files:** Create `src/lib/entitlements.ts`, `src/lib/entitlements.test.ts`.

**Interfaces — Produces:** `type AccessLevel = "view"|"regular"|"advanced"`; `type EntitlementLite = { plan: "regular"|"advanced"; expires_at: string }`; `resolveAccess(ents: EntitlementLite[], now?: Date): AccessLevel`.

- [ ] **Step 1: teste que falha** — Create `src/lib/entitlements.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { resolveAccess } from "./entitlements";

const future = "2027-01-01T00:00:00.000Z";
const past = "2025-01-01T00:00:00.000Z";
const now = new Date("2026-06-01T00:00:00.000Z");

describe("resolveAccess", () => {
  it("sem entitlements → view", () => {
    expect(resolveAccess([], now)).toBe("view");
  });
  it("só expirados → view", () => {
    expect(resolveAccess([{ plan: "advanced", expires_at: past }], now)).toBe("view");
  });
  it("regular vigente → regular", () => {
    expect(resolveAccess([{ plan: "regular", expires_at: future }], now)).toBe("regular");
  });
  it("advanced vence regular", () => {
    expect(resolveAccess([{ plan: "regular", expires_at: future }, { plan: "advanced", expires_at: future }], now)).toBe("advanced");
  });
  it("advanced expirado + regular vigente → regular", () => {
    expect(resolveAccess([{ plan: "advanced", expires_at: past }, { plan: "regular", expires_at: future }], now)).toBe("regular");
  });
});
```

- [ ] **Step 2:** `npm run test -- entitlements` → FAIL (módulo não existe).
- [ ] **Step 3: implementar** — Create `src/lib/entitlements.ts`:
```ts
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
```

- [ ] **Step 4:** `npm run test -- entitlements` → PASS.
- [ ] **Step 5: commit** — `git add src/lib/entitlements.ts src/lib/entitlements.test.ts && git commit -m "feat(assinaturas): resolveAccess (nível de acesso vigente)"`

---

## Task 3: `consumption.ts` — cycleKeyFor + canConsume (TDD)

**Files:** Create `src/lib/consumption.ts`, `src/lib/consumption.test.ts`.

**Interfaces — Consumes:** `AccessLevel` de `./entitlements`. **Produces:**
- `cycleKeyFor(startsAt: Date, now: Date): string` — nº de meses (aniversário) desde `startsAt`, ex.: `"cycle-0"`, `"cycle-1"`.
- `canConsume(args: { access: AccessLevel; startIncluded: boolean; unlockedContentIds: string[]; unlockedCycleKeys: string[]; contentId: string; startsAt: Date | null; now: Date }): { allowed: boolean; reason: "start-included"|"advanced"|"already-unlocked"|"cycle-slot"|"cycle-used"|"gated"; willUnlock: boolean }`.

- [ ] **Step 1: teste que falha** — Create `src/lib/consumption.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { cycleKeyFor, canConsume } from "./consumption";

const start = new Date("2026-01-05T00:00:00.000Z");

describe("cycleKeyFor", () => {
  it("mesmo ciclo antes do aniversário", () => {
    expect(cycleKeyFor(start, new Date("2026-01-20T00:00:00.000Z"))).toBe(cycleKeyFor(start, new Date("2026-02-04T00:00:00.000Z")));
  });
  it("novo ciclo ao cruzar o dia do aniversário", () => {
    expect(cycleKeyFor(start, new Date("2026-01-06T00:00:00.000Z"))).not.toBe(cycleKeyFor(start, new Date("2026-02-06T00:00:00.000Z")));
  });
});

const base = { unlockedContentIds: [], unlockedCycleKeys: [], contentId: "x", startsAt: start, now: new Date("2026-01-10T00:00:00.000Z") };

describe("canConsume", () => {
  it("start-included libera em qualquer nível", () => {
    expect(canConsume({ ...base, access: "view", startIncluded: true }).allowed).toBe(true);
  });
  it("view sem start-included → gated", () => {
    const r = canConsume({ ...base, access: "view", startIncluded: false });
    expect(r.allowed).toBe(false); expect(r.reason).toBe("gated");
  });
  it("advanced libera sempre", () => {
    const r = canConsume({ ...base, access: "advanced", startIncluded: false });
    expect(r.allowed).toBe(true); expect(r.reason).toBe("advanced");
  });
  it("regular: já desbloqueado libera", () => {
    const r = canConsume({ ...base, access: "regular", startIncluded: false, unlockedContentIds: ["x"] });
    expect(r.allowed).toBe(true); expect(r.reason).toBe("already-unlocked");
  });
  it("regular: slot livre no ciclo → libera e vai desbloquear", () => {
    const r = canConsume({ ...base, access: "regular", startIncluded: false });
    expect(r.allowed).toBe(true); expect(r.reason).toBe("cycle-slot"); expect(r.willUnlock).toBe(true);
  });
  it("regular: já usou o slot deste ciclo → cycle-used", () => {
    const ck = cycleKeyFor(start, base.now);
    const r = canConsume({ ...base, access: "regular", startIncluded: false, unlockedCycleKeys: [ck] });
    expect(r.allowed).toBe(false); expect(r.reason).toBe("cycle-used");
  });
});
```

- [ ] **Step 2:** `npm run test -- consumption` → FAIL.
- [ ] **Step 3: implementar** — Create `src/lib/consumption.ts`:
```ts
import type { AccessLevel } from "./entitlements";

/** Ciclo mensal por aniversário da compra: nº de meses completos desde startsAt. */
export function cycleKeyFor(startsAt: Date, now: Date): string {
  let months =
    (now.getUTCFullYear() - startsAt.getUTCFullYear()) * 12 +
    (now.getUTCMonth() - startsAt.getUTCMonth());
  if (now.getUTCDate() < startsAt.getUTCDate()) months -= 1;
  if (months < 0) months = 0;
  return `cycle-${months}`;
}

export type ConsumeReason =
  | "start-included" | "advanced" | "already-unlocked"
  | "cycle-slot" | "cycle-used" | "gated";

export function canConsume(args: {
  access: AccessLevel;
  startIncluded: boolean;
  unlockedContentIds: string[];
  unlockedCycleKeys: string[];
  contentId: string;
  startsAt: Date | null;
  now: Date;
}): { allowed: boolean; reason: ConsumeReason; willUnlock: boolean } {
  const { access, startIncluded, unlockedContentIds, unlockedCycleKeys, contentId, startsAt, now } = args;
  if (startIncluded) return { allowed: true, reason: "start-included", willUnlock: false };
  if (access === "advanced") return { allowed: true, reason: "advanced", willUnlock: false };
  if (access === "regular") {
    if (unlockedContentIds.includes(contentId)) return { allowed: true, reason: "already-unlocked", willUnlock: false };
    const ck = startsAt ? cycleKeyFor(startsAt, now) : "cycle-0";
    if (!unlockedCycleKeys.includes(ck)) return { allowed: true, reason: "cycle-slot", willUnlock: true };
    return { allowed: false, reason: "cycle-used", willUnlock: false };
  }
  return { allowed: false, reason: "gated", willUnlock: false };
}
```

- [ ] **Step 4:** `npm run test -- consumption` → PASS.
- [ ] **Step 5: commit** — `git add src/lib/consumption.ts src/lib/consumption.test.ts && git commit -m "feat(assinaturas): cycleKeyFor + canConsume (cota 1/mês acumulável)"`

---

## Task 4: `coupon.ts` — couponEligible (TDD)

**Files:** Create `src/lib/coupon.ts`, `src/lib/coupon.test.ts`.

**Interfaces — Produces:** `UPGRADE_COUPON_CENTS = 4700`; `couponEligible(ebookPurchaseAt: string | null, hasEntitlement: boolean, now?: Date): boolean` (compra Start < 30 dias e ainda sem entitlement).

- [ ] **Step 1: teste que falha** — Create `src/lib/coupon.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { couponEligible, UPGRADE_COUPON_CENTS } from "./coupon";

const now = new Date("2026-06-30T00:00:00.000Z");

describe("couponEligible", () => {
  it("sem compra Start → false", () => {
    expect(couponEligible(null, false, now)).toBe(false);
  });
  it("compra há 29 dias, sem entitlement → true", () => {
    expect(couponEligible("2026-06-01T00:00:00.000Z", false, now)).toBe(true);
  });
  it("compra há 31 dias → false", () => {
    expect(couponEligible("2026-05-30T00:00:00.000Z", false, now)).toBe(false);
  });
  it("já tem entitlement → false", () => {
    expect(couponEligible("2026-06-20T00:00:00.000Z", true, now)).toBe(false);
  });
  it("valor do cupom", () => {
    expect(UPGRADE_COUPON_CENTS).toBe(4700);
  });
});
```

- [ ] **Step 2:** `npm run test -- coupon` → FAIL.
- [ ] **Step 3: implementar** — Create `src/lib/coupon.ts`:
```ts
export const UPGRADE_COUPON_CENTS = 4700;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/** Elegível ao cupom de upgrade: comprou Start há < 30 dias e ainda não tem passe. */
export function couponEligible(
  ebookPurchaseAt: string | null,
  hasEntitlement: boolean,
  now: Date = new Date()
): boolean {
  if (!ebookPurchaseAt || hasEntitlement) return false;
  return now.getTime() - new Date(ebookPurchaseAt).getTime() < THIRTY_DAYS_MS;
}
```

- [ ] **Step 4:** `npm run test -- coupon` → PASS.
- [ ] **Step 5: commit** — `git add src/lib/coupon.ts src/lib/coupon.test.ts && git commit -m "feat(assinaturas): couponEligible (upgrade R$47, 30 dias)"`

---

## Task 5: flag `startIncluded` no CONTENT_HUB

**Files:** Modify `src/data/content-hub.ts`.

**Interfaces — Produces:** campo opcional `startIncluded?: boolean` no tipo `ContentItem` (default ausente = `false`).

- [ ] **Step 1:** no `src/data/content-hub.ts`, adicionar ao tipo `ContentItem` (junto aos outros campos opcionais) a linha:
```ts
  /** Se true, consumível no nível "view" (incluído no Start, ex.: relatório de benchmark). Ausente = biblioteca paga. */
  startIncluded?: boolean;
```

- [ ] **Step 2:** `npx tsc --noEmit` → exit 0. (Nenhum item marcado ainda — mecanismo pronto; a marcação editorial é decisão do usuário, ver nota final.)
- [ ] **Step 3: commit** — `git add src/data/content-hub.ts && git commit -m "feat(assinaturas): flag startIncluded no ContentItem"`

---

## Task 6: `entitlement-access.ts` — camada de dados

**Files:** Create `src/lib/entitlement-access.ts`.

**Interfaces — Consumes:** `resolveAccess`, `cycleKeyFor`, `canConsume`, `getSupabaseServerClient`. **Produces:**
- `resolveUserIdByToken(token: string): Promise<string | null>` (token→purchase→user_id).
- `getAccessContext(userId: string): Promise<{ access: AccessLevel; startsAt: Date | null; unlockedContentIds: string[]; unlockedCycleKeys: string[] }>`.
- `tryConsume(userId: string, contentId: string, startIncluded: boolean): Promise<{ allowed: boolean; reason: string }>` (grava unlock se `willUnlock`, idempotente).

- [ ] **Step 1: implementar** — Create `src/lib/entitlement-access.ts`:
```ts
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { resolveAccess, type AccessLevel } from "@/lib/entitlements";
import { canConsume, cycleKeyFor } from "@/lib/consumption";

export async function resolveUserIdByToken(token: string): Promise<string | null> {
  const supabase = getSupabaseServerClient();
  const { data: t } = await supabase.from("tokens").select("purchase_id").eq("token", token).maybeSingle();
  if (!t) return null;
  const { data: p } = await supabase.from("purchases").select("user_id").eq("id", t.purchase_id).maybeSingle();
  return p?.user_id ?? null;
}

export async function getAccessContext(userId: string): Promise<{
  access: AccessLevel; startsAt: Date | null; unlockedContentIds: string[]; unlockedCycleKeys: string[];
}> {
  const supabase = getSupabaseServerClient();
  const { data: ents } = await supabase
    .from("entitlements").select("plan, starts_at, expires_at").eq("user_id", userId);
  const access = resolveAccess(ents ?? []);
  // starts_at do entitlement vigente de nível `access` (o mais recente), para o ciclo.
  const active = (ents ?? [])
    .filter((e) => e.plan === access && new Date(e.expires_at).getTime() > Date.now())
    .sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime())[0];
  const startsAt = active ? new Date(active.starts_at) : null;
  const { data: unlocks } = await supabase
    .from("content_unlocks").select("content_id, cycle_key").eq("user_id", userId);
  return {
    access, startsAt,
    unlockedContentIds: (unlocks ?? []).map((u) => u.content_id),
    unlockedCycleKeys: (unlocks ?? []).map((u) => u.cycle_key),
  };
}

export async function tryConsume(userId: string, contentId: string, startIncluded: boolean): Promise<{ allowed: boolean; reason: string }> {
  const ctx = await getAccessContext(userId);
  const now = new Date();
  const decision = canConsume({
    access: ctx.access, startIncluded, unlockedContentIds: ctx.unlockedContentIds,
    unlockedCycleKeys: ctx.unlockedCycleKeys, contentId, startsAt: ctx.startsAt, now,
  });
  if (decision.allowed && decision.willUnlock && ctx.startsAt) {
    const supabase = getSupabaseServerClient();
    const cycle_key = cycleKeyFor(ctx.startsAt, now);
    // Idempotente por (user_id, content_id); relê o ciclo para não furar a cota numa corrida.
    await supabase.from("content_unlocks").insert({ user_id: userId, content_id: contentId, cycle_key });
    const { data: sameCycle } = await supabase
      .from("content_unlocks").select("content_id").eq("user_id", userId).eq("cycle_key", cycle_key);
    if ((sameCycle ?? []).length > 1) {
      // corrida: outro desbloqueio no mesmo ciclo — mantém o primeiro, reverte este.
      await supabase.from("content_unlocks").delete().eq("user_id", userId).eq("content_id", contentId);
      // se este não é o desbloqueio "válido" do ciclo, nega.
      const first = (sameCycle ?? []).find((r) => r.content_id !== contentId);
      if (first) return { allowed: false, reason: "cycle-used" };
    }
  }
  return { allowed: decision.allowed, reason: decision.reason };
}
```

- [ ] **Step 2:** `npx tsc --noEmit` → exit 0.
- [ ] **Step 3: commit** — `git add src/lib/entitlement-access.ts && git commit -m "feat(assinaturas): camada de dados de entitlement/consumo"`

---

## Task 7: produtos no Stripe

**Files:** Modify `src/lib/stripe.ts`.

**Interfaces — Produces:** `PRODUTO_REGULAR` e `PRODUTO_ADVANCED` (`{ productId, name, priceCents }`).

- [ ] **Step 1:** em `src/lib/stripe.ts`, após `PRODUTO_1`, adicionar:
```ts
export const PRODUTO_REGULAR = {
  productId: "regular_pass",
  name: "Matriz Central — Passe Regular (12 meses, 1 conteúdo/mês)",
  priceCents: 9700,
};

export const PRODUTO_ADVANCED = {
  productId: "advanced_pass",
  name: "Matriz Central — Passe Advanced (12 meses, acesso completo)",
  priceCents: 49700,
};

export const PLANOS = {
  ebook: PRODUTO_1,
  regular: PRODUTO_REGULAR,
  advanced: PRODUTO_ADVANCED,
} as const;
export type PlanoId = keyof typeof PLANOS;
```

- [ ] **Step 2:** `npx tsc --noEmit` → exit 0.
- [ ] **Step 3: commit** — `git add src/lib/stripe.ts && git commit -m "feat(assinaturas): produtos Regular e Advanced no Stripe"`

---

## Task 8: checkout parametrizado + cupom + parcelas

**Files:** Modify `src/app/api/checkout/route.ts`.

**Interfaces — Consumes:** `PLANOS`, `PlanoId` (Task 7); `couponEligible`, `UPGRADE_COUPON_CENTS` (Task 4); `getSupabaseServerClient`. **Produces:** `POST /api/checkout` aceita `{ email, plan?: "ebook"|"regular"|"advanced" }`, aplica cupom se elegível, ativa parcelas no Advanced.

- [ ] **Step 1: implementar** — substituir o corpo de `src/app/api/checkout/route.ts` por:
```ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe, PLANOS, type PlanoId } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { couponEligible, UPGRADE_COUPON_CENTS } from "@/lib/coupon";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = body?.email;
  const plan: PlanoId = (["ebook", "regular", "advanced"].includes(body?.plan) ? body.plan : "ebook");

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "email é obrigatório" }, { status: 400 });
  }

  const produto = PLANOS[plan];
  let unitAmount = produto.priceCents;

  // Cupom automático de upgrade (Start < 30 dias, sem passe) — só para regular/advanced.
  if (plan !== "ebook") {
    const supabase = getSupabaseServerClient();
    const normalized = email.toLowerCase().trim();
    const { data: user } = await supabase.from("users").select("id").eq("email", normalized).maybeSingle();
    if (user) {
      const { data: ebook } = await supabase
        .from("purchases").select("created_at").eq("user_id", user.id).eq("product_id", "ebook_llm_local")
        .order("created_at", { ascending: false }).limit(1).maybeSingle();
      const { data: ent } = await supabase.from("entitlements").select("id").eq("user_id", user.id).limit(1).maybeSingle();
      if (couponEligible(ebook?.created_at ?? null, !!ent)) {
        unitAmount = Math.max(0, unitAmount - UPGRADE_COUPON_CENTS);
      }
    }
  }

  const params: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ["card"],
    line_items: [
      { price_data: { currency: "brl", product_data: { name: produto.name }, unit_amount: unitAmount }, quantity: 1 },
    ],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_URL}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/checkout/cancelado`,
    customer_email: email,
    metadata: { product_id: produto.productId },
  };

  // Parcelamento em cartão (BR) só no Advanced.
  if (plan === "advanced") {
    params.payment_method_options = { card: { installments: { enabled: true } } };
  }

  const session = await stripe.checkout.sessions.create(params);
  return NextResponse.json({ url: session.url });
}
```

- [ ] **Step 2:** `npx tsc --noEmit` → exit 0.
- [ ] **Step 3: commit** — `git add src/app/api/checkout/route.ts && git commit -m "feat(assinaturas): checkout por plano + cupom automático + parcelas"`

---

## Task 9: webhook cria entitlement (Regular/Advanced)

**Files:** Modify `src/app/api/webhooks/stripe/route.ts`.

**Interfaces — Consumes:** o webhook atual (user/purchase/token idempotentes). **Produces:** para `product_id` `regular_pass`/`advanced_pass`, cria `entitlements` (idempotente por `stripe_payment_id`, `expires_at = now + 12 meses`).

- [ ] **Step 1:** em `src/app/api/webhooks/stripe/route.ts`, logo **após** o bloco que garante `accessToken`/`tokenWasCreated` e **antes** do `if (!purchaseWasCreated && !tokenWasCreated)`, inserir:
```ts
  // 3.5 Entitlement para passes (Regular/Advanced). Idempotente por stripe_payment_id.
  const plan = productId === "regular_pass" ? "regular" : productId === "advanced_pass" ? "advanced" : null;
  if (plan) {
    const { data: existingEnt } = await supabase
      .from("entitlements").select("id").eq("stripe_payment_id", stripePaymentId).maybeSingle();
    if (!existingEnt) {
      const expires = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
      const { error: entError } = await supabase.from("entitlements").insert({
        user_id: user.id, plan, starts_at: now.toISOString(), expires_at: expires, stripe_payment_id: stripePaymentId,
      });
      if (entError) {
        const { data: reread } = await supabase
          .from("entitlements").select("id").eq("stripe_payment_id", stripePaymentId).maybeSingle();
        if (!reread) return NextResponse.json({ error: "falha ao criar entitlement" }, { status: 500 });
      }
    }
  }
```
(O `productId`, `stripePaymentId`, `user`, `now`, `supabase` já existem no escopo. O e-mail de confirmação específico do passe é o Plano 2; por ora o e-mail de token cobre o acesso.)

- [ ] **Step 2:** `npx tsc --noEmit` → exit 0.
- [ ] **Step 3: verificar no navegador (modo teste)** — com Stripe em modo teste, comprar `regular` e `advanced` (cartão de teste 4242…) → confirmar no Supabase (SQL Editor) que a linha em `entitlements` foi criada com o `plan` e `expires_at` certos, e que o `token` também foi criado. *(Controller conduz.)*
- [ ] **Step 4: commit** — `git add src/app/api/webhooks/stripe/route.ts && git commit -m "feat(assinaturas): webhook cria entitlement para passes"`

---

## Task 10: enforcement na página de consumo

**Files:** Modify `src/app/dashboard/[token]/conteudo/[id]/page.tsx`.

**Interfaces — Consumes:** `resolveUserIdByToken`, `tryConsume` (Task 6); `ContentGate` (Frente 1). **Produces:** a página só entrega o conteúdo (markdown/iframe/survey) se `tryConsume` liberar; senão renderiza `<ContentGate>`.

- [ ] **Step 1:** em `src/app/dashboard/[token]/conteudo/[id]/page.tsx`, adicionar imports:
```ts
import ContentGate from "@/components/auth/ContentGate";
import { resolveUserIdByToken, tryConsume } from "@/lib/entitlement-access";
```
E, **após** a validação do token (`if (!tokenRow || isTokenExpired(...))`), antes de ler o `body`/render, inserir o gate:
```ts
  const userId = await resolveUserIdByToken(params.token);
  const decision = userId
    ? await tryConsume(userId, item.id, item.startIncluded === true)
    : { allowed: false, reason: "gated" };

  if (!decision.allowed) {
    const nextPath = `/dashboard/${params.token}/conteudo/${item.id}`;
    return (
      <div className="mx-auto max-w-3xl space-y-6 p-6">
        <CategoryBadge variant="hub">{item.title}</CategoryBadge>
        <p className="text-sm text-zinc-500">{item.description}</p>
        <ContentGate
          title={item.title}
          nextPath={nextPath}
        />
      </div>
    );
  }
```
(O restante — markdown/iframe/survey + `CompleteContentButton` — só roda quando `decision.allowed`. A prévia — título/descrição — aparece acima do gate, cumprindo "prévia sempre".)

- [ ] **Step 2:** `npx tsc --noEmit` → exit 0.
- [ ] **Step 3: verificar no navegador** — com um token de usuário **view** (Start), abrir um item de conteúdo → deve mostrar o `ContentGate` (não o conteúdo). Com um usuário **advanced**, o mesmo item → conteúdo completo. Com **regular**, 1º item → libera; 2º item no mesmo ciclo → gate `cycle-used`. *(Controller conduz, reusando os passes criados na Task 9.)*
- [ ] **Step 4: commit** — `git add "src/app/dashboard/[token]/conteudo/[id]/page.tsx" && git commit -m "feat(assinaturas): enforcement de consumo via ContentGate"`

---

## Task 11: `/oferta` — checkout real Regular/Advanced + copy do Start

**Files:** Modify `src/components/marketing/OfferPricing.tsx`.

**Interfaces — Consumes:** `/api/checkout` com `plan`. **Produces:** cards Regular/Advanced com checkout real (não waitlist); Start com copy alinhada ao modelo (view-only + cupom 30 dias).

- [ ] **Step 1:** generalizar o `EbookAvulsoCheckout` para aceitar `plan` e rótulo, e trocar os `WaitlistForm` de Regular/Advanced por esse checkout. Substituir o componente por:
```tsx
"use client";

import { useState } from "react";
import { isValidEmail } from "@/lib/email-validation";

function PlanCheckout({ plan, cta }: { plan: "ebook" | "regular" | "advanced"; cta: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!email || !isValidEmail(email)) {
      setError("Informe um e-mail válido.");
      return;
    }
    setLoading(true); setError(null);
    const res = await fetch("/api/checkout", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, plan }),
    });
    if (!res.ok) { setLoading(false); setError("Não foi possível iniciar o checkout. Tente novamente."); return; }
    const { url } = await res.json();
    window.location.href = url;
  };

  return (
    <div>
      <div className="waitlist-form">
        <input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <button type="button" className="btn btn-dark" style={{ width: "100%", justifyContent: "center", marginBottom: 20 }} onClick={handleCheckout} disabled={loading}>
        {loading ? "Redirecionando..." : cta}
      </button>
      {error && <p className="hero-error" style={{ marginBottom: 12 }}>{error}</p>}
    </div>
  );
}

export default function OfferPricing() {
  return (
    <div>
      <div className="plans-grid">
        <div className="plan">
          <h3>Start</h3>
          <div className="price"><b>R$47</b><small>pagamento único<br />acesso vitalício ao seu núcleo</small></div>
          <PlanCheckout plan="ebook" cta="Comprar agora" />
          <ul>
            <li>Ebook técnico completo + diagnóstico (triagem) + roadmap personalizado</li>
            <li>Relatório de benchmark do seu perfil e certificado ao concluir a trilha</li>
            <li>Acesso à plataforma para <strong>visualizar</strong> toda a biblioteca (prévias)</li>
            <li>Gamificação da sua trilha do ebook (XP, níveis)</li>
            <li><strong>Cupom de R$47</strong> (válido 30 dias) para migrar ao Regular ou Advanced</li>
            <li>Garantia condicional de 7 dias (ver termos)</li>
          </ul>
          <span className="foot">Por R$47, uma vez: seu núcleo de aprendizado — e a plataforma pra explorar o resto.</span>
        </div>

        <div className="plan">
          <h3>Regular</h3>
          <div className="price"><b>R$97</b><small>passe de 12 meses<br />1 conteúdo por mês</small></div>
          <PlanCheckout plan="regular" cta="Assinar o Regular" />
          <ul>
            <li>Tudo do Start</li>
            <li><strong>Consome 1 conteúdo por mês</strong> (escolhe entre todos) — desbloqueios acumulam pelos 12 meses</li>
            <li>Passe de 12 meses, sem renovação automática</li>
          </ul>
          <span className="foot">Pra estudar no seu ritmo, sem mensalidade</span>
        </div>

        <div className="plan recommended">
          <span className="plan-tag mono plan-tag-hot">Mais procurado</span>
          <h3 style={{ marginTop: 20 }}>Advanced</h3>
          <div className="price"><b><span style={{ fontSize: "0.5em", fontWeight: 400, verticalAlign: "middle" }}>12x</span> R$47</b><small>ou R$497 à vista<br />acesso completo 12 meses</small></div>
          <PlanCheckout plan="advanced" cta="Assinar o Advanced" />
          <ul>
            <li>Tudo do Start, com <strong>a plataforma inteira liberada</strong></li>
            <li>Consumo ilimitado: relatórios, podcasts, vídeos, apresentações e o <strong>feed</strong></li>
            <li>Gamificação plena + novos conteúdos durante os 12 meses</li>
          </ul>
          <span className="foot">Pra quem vai estudar o ano inteiro</span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2:** `npx tsc --noEmit` → exit 0.
- [ ] **Step 3: verificar no navegador** — `/oferta`: os 3 cards mostram checkout real; clicar em Regular/Advanced com um e-mail leva ao Stripe (modo teste). Start segue funcionando.
- [ ] **Step 4: commit** — `git add src/components/marketing/OfferPricing.tsx && git commit -m "feat(assinaturas): /oferta com checkout real de Regular/Advanced + copy Start"`

---

## Task 12: verificação ponta-a-ponta + continuidade

**Files:** Modify `docs/frentes/assinaturas/README.md`, `docs/ESTADO-ATUAL.md`.

- [ ] **Step 1: gate** — `npx tsc --noEmit && npm run test` → tsc 0; testes verdes (inclui `entitlements`, `consumption`, `coupon`).
- [ ] **Step 2: E2E modo teste (navegador)** — jornada completa com cartão de teste 4242…:
  1. Comprar **Advanced** → webhook cria token + entitlement `advanced` → abrir um conteúdo da biblioteca → **consome** (sem tranca).
  2. Comprar **Regular** (outro e-mail) → abrir 1 conteúdo → libera; abrir 2º no mesmo ciclo → **tranca** `cycle-used`.
  3. Usuário **só Start** → abrir conteúdo → **ContentGate**.
  4. Comprar Start e, em seguida, Regular com o mesmo e-mail → **cupom** abaixa o preço (R$97→R$50).
- [ ] **Step 3: continuidade** — atualizar `README.md` da frente (Plano 1 concluído) e `docs/ESTADO-ATUAL.md`. Deixar registrado o **Plano 2 (e-mails)** como próximo.
- [ ] **Step 4: commit** — `git add docs/ && git commit -m "docs(assinaturas): Plano 1 concluído — atualiza continuidade"`

---

## Notas de execução

- **Migrations no remoto:** o `supabase db push` está travado (histórico divergente). Aplicar `0017`/`0018` pelo **SQL Editor do Supabase** (o controller conduz, como foi feito na Frente 1).
- **Stripe modo teste:** live está bloqueado; toda verificação de compra usa cartões de teste. O parcelado 12x exato e o go-live ficam para quando a verificação da empresa sair.
- **Decisão editorial pendente (não bloqueia):** marcar `startIncluded: true` nos itens do `CONTENT_HUB` que o Start inclui (ex.: o relatório de benchmark). Até marcar, o Start não consome nada da biblioteca (só vê) — coerente com o modelo, mas confirmar quais itens são "do Start".
- **`npm run build`** falha sem `STRIPE_SECRET_KEY` (pré-existente).
