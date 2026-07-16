# Spec — Trilha B: Segurança do dinheiro

> Programa: [`README.md`](README.md). Primeira trilha do lançamento final —
> fechar os buracos de dinheiro/abuso que a auditoria original marcou ALTO e que
> nunca foram fechados, + testar o caminho que guarda todo o acesso pago.
> **Sem dependência npm nova.**

## Estado atual (mapeado 2026-07-16)

- **Webhook Stripe** (`src/app/api/webhooks/stripe/route.ts`) só trata
  `checkout.session.completed`; grava `purchases.status = "paid"` uma vez e
  **nunca atualiza**. `refund_window_expires` é escrito e **nunca lido**.
  Reembolso/disputa caem no no-op `{received:true}`.
- **Acesso** é sempre checado por **expiry**: `tokens.valid_until`
  (`isTokenExpired`) e `entitlements.expires_at` (`resolveAccess`). **Nenhum**
  ponto lê `purchases.status`. → revogar expirando token+entitlement atinge todos
  os gates de uma vez.
- **`xp_events`** não tem constraint `unique`; um trigger `after insert`
  incrementa `users.total_xp`. Dos 8 sites que dão XP, vários não têm guarda a
  nível de `xp_events` (triagem, download com race, desafio).
- **Rate limit** só existe inline no `resend-access` (Map em memória, 60s).
  `/api/checkout`, `/newsletter`, `/waitlist` não têm nenhum.
- **Validação de e-mail:** `isValidEmail` (`src/lib/email-validation.ts`) existe
  mas **não** é usada no `checkout` nem no `waitlist` (só checam `typeof string`).
  `plan_waitlist` não tem unique → duplica.
- **`auth-session.ts` e `entitlement-access.ts`** (todo o login/entitlement) **sem
  teste**. Padrão de teste do repo: `vi.mock("@/lib/supabase/server")` +
  `buildSupabaseMock` (ver `access.test.ts`, `webhooks/stripe/route.test.ts`).

## Item B1 — Reembolso/chargeback revoga acesso

**Decisão de design (revogar na fonte):** em vez de adicionar "e não revogado" a
cada gate, o handler de reembolso **expira o que os gates já checam**.

- Webhook passa a tratar, além de `checkout.session.completed`:
  - `charge.refunded` → `status = "refunded"`
  - `charge.dispute.created` → `status = "disputed"`
- Ação em qualquer um dos dois: localizar a compra por `stripe_payment_id`
  (confirmar no código qual id é gravado — session id vs payment_intent; o
  handler de refund recebe o `charge` com `payment_intent`; casar pelo mesmo id
  que o `checkout.session.completed` gravou), e então:
  1. `update purchases set status = <novo>` where `stripe_payment_id = <id>`.
  2. `update tokens set valid_until = now()` where `purchase_id = <id>` (expira o
     acesso por token — `isTokenExpired` passa a barrar).
  3. `update entitlements set expires_at = now()` where `stripe_payment_id = <id>`
     (expira o passe — `resolveAccess` passa a rebaixar para `view`).
- **Idempotência:** reprocessar o mesmo evento é inofensivo (updates
  convergentes). Evento de compra desconhecida → `{received:true}` (não falhar).
- **Pureza/teste:** extrair `classifyStripeEvent(eventType)` puro →
  `"completed" | "refund" | "dispute" | "ignore"` (testável); o webhook roteia por
  ele. Teste do webhook via `vi.mock` (como o `route.test.ts` atual): refund →
  purchase vira `refunded` + token/entitlement expirados.

## Item B2 — XP não-duplicável

- **Migration** `xp_events` unique `(user_id, action_type, reference_id)`:
  1. **Dedup dos existentes** antes da constraint: apagar duplicados mantendo o
     mais antigo por chave (`delete ... using ... where a.ctid < b.ctid` ou
     `row_number()`), só para linhas com `reference_id not null`.
  2. **Reconciliar `total_xp`**: `update users set total_xp = coalesce((select
     sum(xp_amount) from xp_events where user_id = users.id), 0)` — corrige
     qualquer inflação passada de uma vez.
  3. `create unique index` / `add constraint` em `(user_id, action_type,
     reference_id)`. (NULLs em `reference_id` são distintos no Postgres; todos os
     8 sites atuais setam `reference_id`, então novas inserções sempre conflitam
     corretamente em repetição.)
- **Todos os 8 sites** de insert em `xp_events` passam a
  `.upsert(row, { onConflict: "user_id,action_type,reference_id", ignoreDuplicates:
  true })` (ou capturar `23505`, padrão já usado em `entitlement-access.ts:49`).
  Como o upsert-ignore **não insere** em conflito, o trigger de `total_xp` não
  dispara → sem dupla contagem. Sites: webhook (`compra`), quiz (`triagem`,
  `validacao`), diagnostico (`triagem`), roadmap (`roadmap`), download
  (`download`), content-xp (`conteudo`), challenges (`desafio`).
- Garantir que **todo** insert tem `reference_id` estável e único por evento
  lógico (já é o caso; conferir download = `purchase.id`, desafio =
  `weekKey:challengeId`).

## Item B3 — Rate limiting nos endpoints públicos de escrita

- Extrair helper `src/lib/rate-limit.ts` (custo zero, em memória — documentar que
  é **por instância**, mitigação, não garantia distribuída):
  ```ts
  export function createRateLimiter(windowMs: number): {
    check: (key: string, now: number) => boolean; // true = permitido
  };
  ```
  Map interno `key → lastEpoch`; `check` permite se `now - last >= windowMs`,
  senão nega (sem atualizar o last). Testável passando `now` explícito.
- Aplicar em `/api/checkout` (key = email, janela ~10s), `/api/newsletter` e
  `/api/waitlist` (key = email, janela ~30s). Resposta ao exceder: genérica
  (`{ok:true}` ou 429 sem vazar estado), como o `resend-access`.
- Refatorar `resend-access` para usar o helper (DRY), preservando os 60s.

## Item B4 — Validação de e-mail + dedupe do waitlist

- `checkout`: importar `isValidEmail` e retornar 400 se inválido (hoje passa
  qualquer string). Não muda o resto do fluxo.
- `waitlist`: `isValidEmail` + **migration** unique em `plan_waitlist(email,
  plan_id)` + trocar `.insert` por `.upsert({ email: email.toLowerCase(), plan_id
  }, { onConflict: "email,plan_id", ignoreDuplicates: true })`.

## Item B5 — Testes do caminho pago (auth-session + entitlement-access)

- Criar `src/lib/auth-session.test.ts` e `src/lib/entitlement-access.test.ts` com
  o padrão `vi.mock("@/lib/supabase/server", () => ({ getSupabaseServerClient: ()
  => mockSupabase }))` + `buildSupabaseMock` (copiar a forma de `access.test.ts`).
  Para `auth-session`, mockar também `next/headers` (`cookies()`).
- Cobrir os invariantes críticos: `verifyMagicLink` (uso único / expirado /
  revogado — o claim atômico), `getSessionUser` (sessão válida vs revogada),
  `requestMagicLink` (no-account vs sent + throttle), `resolveUserIdByToken`,
  `tryConsume` (allowed/gated por reason), `getAccessContext` (plan/expiry →
  access; unlock cycle keys).

## Não-objetivos / diferido

- Rate limit distribuído (Redis/Upstash) — fora do custo zero; o em-memória basta
  pro MVP (documentado). Migrar depois se necessário.
- Revogação por `purchases.status` nos gates (não é preciso: expiry na fonte já
  revoga). O `status` fica como registro/auditoria.
- Handlers de outros eventos Stripe (`checkout.session.expired`, subscription) —
  fora do escopo; o produto é passe único, não assinatura recorrente.

## Verificação

- Gate: `npx tsc --noEmit` 0 + `npm run test` (novos: `classifyStripeEvent`,
  `createRateLimiter`, auth-session, entitlement-access) + `npx next lint`.
- Migrations aplicadas no remoto pelo Claude (SQL Editor). E2E manual do refund:
  disparar `charge.refunded` de teste (Stripe CLI/dashboard test) → confirmar
  token/entitlement expirados e acesso barrado.
- **3 migrations novas:** XP dedup+reconciliação; unique do `plan_waitlist`.
  (Refund reusa colunas existentes — sem migration.) → conferir numeração
  `0025+`.
