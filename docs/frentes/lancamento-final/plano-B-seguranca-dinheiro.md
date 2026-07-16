# Trilha B (Segurança do dinheiro) — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.
> Spec: [`spec-B-seguranca-dinheiro.md`](spec-B-seguranca-dinheiro.md). Programa:
> [`README.md`](README.md). **Um commit por item.**

**Goal:** Fechar os buracos de dinheiro/abuso (reembolso não revoga acesso, XP
duplicável, rate limit ausente, validações frouxas) e testar o caminho pago.

**Architecture:** Revogação por expirar `token`+`entitlement` na fonte (os gates
já checam expiry). XP não-duplicável via `unique(user_id, action_type,
reference_id)` + upsert-ignore em todos os sites. Rate limiter em memória
compartilhado. Testes via `vi.mock("@/lib/supabase/server")` + `buildSupabaseMock`.

**Tech Stack:** Next.js App Router (route handlers), Supabase (SQL migrations
aplicadas no remoto via SQL Editor), Stripe webhook, vitest (node-env).

## Global Constraints (do spec/programa — verbatim)
- **Custo zero:** sem dependência npm nova. Rate limit em memória (por instância,
  documentado — não é garantia distribuída).
- Vitest roda em `environment: "node"` → testar **lógica pura** e route/lib com
  `vi.mock` do supabase (padrão de `access.test.ts` / `webhooks/stripe/route.test.ts`).
- Migrations: criar arquivo em `supabase/migrations/` (numeração `0025+`) **e**
  aplicar no remoto (SQL Editor) na mesma frente. `supabase db push` não funciona.
- Gate por item: `npx tsc --noEmit` 0 + `npm run test` verde + `npx next lint`
  sem erros. Nunca commitar `CLAUDE.local-draft.md`/`SETUP.md`/`claude-chat.md`/`erro.png`.
- pt-BR nas mensagens ao usuário.

---

### Task 1 — Reembolso/disputa revoga acesso (webhook)

**Files:**
- Create: `src/lib/stripe-events.ts` + `src/lib/stripe-events.test.ts`
- Modify: `src/app/api/webhooks/stripe/route.ts`
- Modify: `src/app/api/webhooks/stripe/route.test.ts` (novo caso: refund revoga)

**Interfaces (produz):**
```ts
export type StripeEventKind = "completed" | "refund" | "dispute" | "ignore";
export function classifyStripeEvent(eventType: string): StripeEventKind;
```

- [ ] **Step 1: Teste puro (falha primeiro)** — `stripe-events.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { classifyStripeEvent } from "./stripe-events";

describe("classifyStripeEvent", () => {
  it("mapeia os tipos tratados", () => {
    expect(classifyStripeEvent("checkout.session.completed")).toBe("completed");
    expect(classifyStripeEvent("charge.refunded")).toBe("refund");
    expect(classifyStripeEvent("charge.dispute.created")).toBe("dispute");
  });
  it("qualquer outro tipo → ignore", () => {
    expect(classifyStripeEvent("payment_intent.succeeded")).toBe("ignore");
    expect(classifyStripeEvent("")).toBe("ignore");
  });
});
```

- [ ] **Step 2: Rodar/ver falhar** (`npx vitest run src/lib/stripe-events.test.ts`).

- [ ] **Step 3: Implementar `stripe-events.ts`:**
```ts
export type StripeEventKind = "completed" | "refund" | "dispute" | "ignore";

/** Classifica o evento Stripe no que o webhook trata. Puro para testar sem SDK. */
export function classifyStripeEvent(eventType: string): StripeEventKind {
  if (eventType === "checkout.session.completed") return "completed";
  if (eventType === "charge.refunded") return "refund";
  if (eventType === "charge.dispute.created") return "dispute";
  return "ignore";
}
```

- [ ] **Step 4: Rodar/ver passar.**

- [ ] **Step 5: Refatorar o webhook** (`src/app/api/webhooks/stripe/route.ts`).
  LER o arquivo inteiro primeiro. Hoje ele tem, no topo do handler, um guard
  `if (event.type !== "checkout.session.completed") return {received:true}`.
  Trocar por roteamento via `classifyStripeEvent(event.type)`:
  - `"ignore"` → `return NextResponse.json({ received: true })` (como hoje).
  - `"completed"` → o fluxo atual de criação (mover o corpo existente para dentro
    deste ramo, sem mudar a lógica).
  - `"refund"` ou `"dispute"` → nova função `revokePurchase(supabase, stripeId,
    status)` (abaixo). O `stripeId` vem do objeto do evento: para
    `charge.refunded` e `charge.dispute.created` o objeto é um `charge`; usar o
    **mesmo identificador que o `completed` gravou em `stripe_payment_id`**.
    CONFERIR no código do ramo `completed` qual id é gravado (`session.id` vs
    `session.payment_intent`); o `charge` expõe `charge.payment_intent` e
    `charge.id`. Se o gravado é o `payment_intent`, casar por
    `charge.payment_intent`; documentar a escolha num comentário. `status` =
    `"refunded"` (refund) ou `"disputed"` (dispute).
  - Adicionar a função no mesmo arquivo (ou em `src/lib/entitlement-access.ts` se
    fizer mais sentido — decisão do implementer, mas manter I/O testável via mock):
  ```ts
  async function revokePurchase(
    supabase: SupabaseClient,
    stripeId: string,
    status: "refunded" | "disputed",
  ): Promise<void> {
    const nowIso = new Date().toISOString();
    const { data: purchase } = await supabase
      .from("purchases")
      .select("id")
      .eq("stripe_payment_id", stripeId)
      .maybeSingle();
    if (!purchase) return; // compra desconhecida → no-op idempotente
    await supabase.from("purchases").update({ status }).eq("id", purchase.id);
    await supabase.from("tokens").update({ valid_until: nowIso }).eq("purchase_id", purchase.id);
    await supabase.from("entitlements").update({ expires_at: nowIso }).eq("stripe_payment_id", stripeId);
  }
  ```
  (Reprocessar o mesmo evento é convergente — updates idempotentes.)

- [ ] **Step 6: Teste do webhook** — em `route.test.ts`, LER o padrão existente
  (`buildSupabaseMock` + `vi.mock`). Adicionar um caso: evento `charge.refunded`
  com um `stripe_payment_id` que existe no mock → asserir que `purchases.status`
  virou `refunded`, e que `tokens.valid_until`/`entitlements.expires_at` foram
  setados (o mock deve registrar os updates). Manter os casos atuais passando.
  (Se o mock atual não modela `.update()`, estendê-lo minimamente.)

- [ ] **Step 7: Gate + Commit** `feat(seguranca): reembolso/disputa revoga acesso (expira token+entitlement)`.

---

### Task 2 — XP não-duplicável (migration + upsert nos 8 sites)

**Files:**
- Create: `supabase/migrations/0025_xp_dedup.sql`
- Modify (8 sites de insert em `xp_events`): `src/app/api/webhooks/stripe/route.ts`,
  `src/app/api/quiz/route.ts` (2 inserts), `src/app/api/diagnostico/route.ts`,
  `src/app/api/roadmap/complete/route.ts`, `src/app/api/download/route.ts`,
  `src/lib/content-xp.ts`, `src/app/api/challenges/claim/route.ts`

**Interfaces:** nenhuma nova exportação; muda o modo de inserir.

- [ ] **Step 1: Escrever a migration** `0025_xp_dedup.sql`:
```sql
-- 1) Dedup dos existentes (mantém o mais antigo por chave), só reference_id não-nulo
delete from xp_events a
using xp_events b
where a.user_id = b.user_id
  and a.action_type = b.action_type
  and a.reference_id = b.reference_id
  and a.reference_id is not null
  and a.created_at > b.created_at;

-- 2) Reconciliar total_xp a partir do ledger deduplicado
update users u
set total_xp = coalesce((select sum(xp_amount) from xp_events e where e.user_id = u.id), 0);

-- 3) Constraint de unicidade (NULLs em reference_id continuam distintos)
create unique index if not exists xp_events_dedup_idx
  on xp_events (user_id, action_type, reference_id);
```

- [ ] **Step 2: Aplicar no remoto** (SQL Editor do Supabase — navegador, método do
  `CLAUDE.md`: injetar via `monaco.editor.getModels()...setValue(...)` + Run;
  verificar com `select count(*) from xp_events;` e a existência do índice
  `select indexname from pg_indexes where indexname='xp_events_dedup_idx';`).

- [ ] **Step 3: Trocar insert→upsert nos 8 sites.** Em cada arquivo, LER o insert
  atual em `xp_events` e trocar o `.insert(row)` por:
```ts
.upsert(row, { onConflict: "user_id,action_type,reference_id", ignoreDuplicates: true });
```
  Garantir que `row` sempre inclui um `reference_id` estável e único por evento
  lógico (todos já incluem — conferir: webhook=`purchaseId`; quiz triagem=`token`;
  quiz validacao=`token`; diagnostico=`user.id`; roadmap=`${token}:${stageKey}`;
  download=`purchase.id`; content-xp=`contentId`; challenges=`${weekKey}:${challenge.id}`).
  Os pre-checks manuais existentes (ex.: o `select ... from xp_events` do validacao
  e do roadmap) podem PERMANECER (defesa em profundidade) ou ser removidos — se
  removidos, o upsert-ignore garante a unicidade. Manter é mais seguro; não é
  obrigatório remover.

- [ ] **Step 4: Gate.** `npx tsc --noEmit` 0 + `npm run test` (a suíte existente
  não deve quebrar; os testes de rota que mockam `.insert` podem precisar aceitar
  `.upsert` — LER e ajustar o mock se algum teste falhar).

- [ ] **Step 5: Commit** `feat(seguranca): XP nao-duplicavel (unique + upsert-ignore nos 8 sites)`.

---

### Task 3 — Rate limiter compartilhado + aplicar nos endpoints públicos

**Files:**
- Create: `src/lib/rate-limit.ts` + `src/lib/rate-limit.test.ts`
- Modify: `src/app/api/checkout/route.ts`, `src/app/api/newsletter/route.ts`,
  `src/app/api/waitlist/route.ts`, `src/app/api/resend-access/route.ts` (DRY)

**Interfaces (produz):**
```ts
export function createRateLimiter(windowMs: number): {
  check: (key: string, now: number) => boolean; // true = permitido
};
```

- [ ] **Step 1: Teste (falha primeiro)** — `rate-limit.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { createRateLimiter } from "./rate-limit";

describe("createRateLimiter", () => {
  it("permite o 1º; bloqueia dentro da janela; libera depois", () => {
    const rl = createRateLimiter(1000);
    expect(rl.check("a@x.com", 0)).toBe(true);
    expect(rl.check("a@x.com", 500)).toBe(false);
    expect(rl.check("a@x.com", 1000)).toBe(true);
  });
  it("chaves independentes", () => {
    const rl = createRateLimiter(1000);
    expect(rl.check("a", 0)).toBe(true);
    expect(rl.check("b", 100)).toBe(true);
  });
});
```

- [ ] **Step 2: Rodar/ver falhar.**

- [ ] **Step 3: Implementar `rate-limit.ts`:**
```ts
/**
 * Rate limiter em memória (custo zero). ATENÇÃO: o estado é por instância de
 * servidor — em serverless não é compartilhado entre instâncias; é mitigação de
 * abuso, não garantia distribuída. Suficiente para o MVP.
 */
export function createRateLimiter(windowMs: number): {
  check: (key: string, now: number) => boolean;
} {
  const last = new Map<string, number>();
  return {
    check(key, now) {
      const prev = last.get(key) ?? -Infinity;
      if (now - prev < windowMs) return false;
      last.set(key, now);
      return true;
    },
  };
}
```

- [ ] **Step 4: Rodar/ver passar.**

- [ ] **Step 5: Aplicar nas rotas.** Em cada rota, criar um limiter no escopo do
  módulo e checar antes do trabalho caro. Padrão (LER cada rota e adaptar):
```ts
import { createRateLimiter } from "@/lib/rate-limit";
const limiter = createRateLimiter(10_000); // checkout: 10s; newsletter/waitlist: 30_000
// dentro do handler, após extrair `email`:
if (email && typeof email === "string" && !limiter.check(email.toLowerCase(), Date.now())) {
  return NextResponse.json({ error: "aguarde um instante e tente de novo" }, { status: 429 });
}
```
  - `checkout`: janela 10s, key = email.
  - `newsletter` e `waitlist`: janela 30s, key = email.
  - `resend-access`: **refatorar** o Map inline para usar `createRateLimiter(60_000)`
    (preservar os 60s e a resposta genérica `{ok:true}` atual — não trocar por 429
    ali, pra não vazar estado do fluxo de e-mail).

- [ ] **Step 6: Gate + Commit** `feat(seguranca): rate limiter compartilhado em checkout/newsletter/waitlist (+DRY no resend)`.

---

### Task 4 — Validação de e-mail (checkout) + dedupe do waitlist

**Files:**
- Create: `supabase/migrations/0026_waitlist_unique.sql`
- Modify: `src/app/api/checkout/route.ts`, `src/app/api/waitlist/route.ts`

**Interfaces:** consome `isValidEmail` de `src/lib/email-validation.ts` (existe).

- [ ] **Step 1: Migration** `0026_waitlist_unique.sql`:
```sql
-- Dedup existentes e adiciona unicidade (email, plan_id) no waitlist
delete from plan_waitlist a using plan_waitlist b
where a.email = b.email and a.plan_id = b.plan_id and a.created_at > b.created_at;
create unique index if not exists plan_waitlist_email_plan_idx
  on plan_waitlist (email, plan_id);
```

- [ ] **Step 2: Aplicar no remoto** (SQL Editor; verificar o índice como na Task 2).

- [ ] **Step 3: `checkout/route.ts`** — LER o arquivo. Após o check
  `typeof email === "string"`, adicionar:
```ts
import { isValidEmail } from "@/lib/email-validation";
// ...
if (!isValidEmail(email)) {
  return NextResponse.json({ error: "e-mail inválido" }, { status: 400 });
}
```

- [ ] **Step 4: `waitlist/route.ts`** — LER o arquivo. Adicionar
  `isValidEmail(email)` (400 se inválido) e trocar o `.insert(...)` por:
```ts
.upsert({ email: email.toLowerCase(), plan_id: planId }, { onConflict: "email,plan_id", ignoreDuplicates: true });
```

- [ ] **Step 5: Gate + Commit** `feat(seguranca): valida email no checkout + dedupe do waitlist`.

---

### Task 5 — Testes de `entitlement-access.ts`

**Files:**
- Create: `src/lib/entitlement-access.test.ts`

**Interfaces (consome):** `resolveUserIdByToken`, `getAccessContext`, `tryConsume`
de `src/lib/entitlement-access.ts`. Padrão de mock: LER `src/lib/access.test.ts`
para copiar a forma de `buildSupabaseMock` + `vi.mock("@/lib/supabase/server", ()
=> ({ getSupabaseServerClient: () => mockSupabase }))`.

- [ ] **Step 1: Escrever os testes** cobrindo:
  - `resolveUserIdByToken(token)`: token existente → `user_id`; inexistente → `null`.
  - `getAccessContext(userId)`: sem entitlement → `access: "view"`; com entitlement
    `advanced` não-expirado → `access: "advanced"`; expirado → `"view"`; retorna
    `unlockedContentIds`/`unlockedCycleKeys` a partir de `content_unlocks`.
  - `tryConsume(userId, contentId, startIncluded)`: `startIncluded=true` → allowed;
    `advanced` → allowed; `view` sem unlock → not allowed (reason gated).
  Montar o `mockSupabase.from(table)` para `tokens`, `purchases`, `entitlements`,
  `content_unlocks` retornando os `data` de cada cenário. Cada `it` reconfigura o mock.

- [ ] **Step 2: Rodar/ver passar** (`npx vitest run src/lib/entitlement-access.test.ts`).

- [ ] **Step 3: Gate + Commit** `test(seguranca): cobre entitlement-access (token/acesso/consumo)`.

---

### Task 6 — Testes de `auth-session.ts`

**Files:**
- Create: `src/lib/auth-session.test.ts`

**Interfaces (consome):** `requestMagicLink`, `verifyMagicLink`, `createSession`,
`getSessionUser`, `revokeCurrentSession`. Mock: `vi.mock("@/lib/supabase/server")`
+ **também** `vi.mock("next/headers", () => ({ cookies: () => mockCookieStore }))`
(pois `getSessionUser`/`revokeCurrentSession` usam `cookies()`).

- [ ] **Step 1: Escrever os testes** cobrindo os invariantes críticos:
  - `requestMagicLink(email)`: e-mail sem conta → `"no-account"`; com conta →
    `"sent"`; throttle (magic_link recente) → `"sent"` sem criar novo.
  - `verifyMagicLink(secret)`: link válido/não-usado → `SessionUser` e marca como
    usado (uso único); link já usado/expirado → `null`; o claim é atômico
    (segunda chamada com o mesmo secret → `null`).
  - `getSessionUser()`: cookie de sessão válido → `SessionUser`; sessão
    revogada/inexistente → `null`.
  - `revokeCurrentSession()`: remove/invalida a sessão do cookie atual.
  Montar `mockSupabase` para `users`, `magic_links`, `sessions` conforme o código
  real (LER `auth-session.ts` para os nomes de tabela/colunas exatos) e um
  `mockCookieStore` com `get`/`set`/`delete`.

- [ ] **Step 2: Rodar/ver passar.**

- [ ] **Step 3: Gate + Commit** `test(seguranca): cobre auth-session (magic link uso-unico, sessao revogavel)`.

---

## Self-Review
- **Cobertura do spec:** B1→Task 1 ✓; B2→Task 2 ✓; B3→Task 3 ✓; B4→Task 4 ✓;
  B5→Tasks 5+6 ✓. 3 migrations: 0025 (XP), 0026 (waitlist); refund sem migration ✓.
- **Puros testados:** `classifyStripeEvent`, `createRateLimiter`; + suites de
  webhook/entitlement-access/auth-session via `vi.mock`.
- **Consistência:** `revokePurchase` expira `tokens.valid_until`/
  `entitlements.expires_at` — os mesmos campos que `isTokenExpired`/`resolveAccess`
  já checam (revogação na fonte, sem tocar cada gate). `onConflict` string
  `"user_id,action_type,reference_id"` idêntica em migration e nos upserts.
- **Riscos anotados p/ o implementer:** confirmar qual id está em
  `stripe_payment_id` (session vs payment_intent) antes de casar o refund; ajustar
  mocks de teste de rota se algum assumia `.insert` e agora é `.upsert`/`.update`.
