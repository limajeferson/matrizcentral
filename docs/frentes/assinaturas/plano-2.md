# Assinaturas — Plano 2: E-mails de ciclo / CRM

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Enviar os e-mails de ciclo do modelo de passes: confirmação de compra (Regular/Advanced), "novo ciclo" mensal (Regular), "novos conteúdos" (Advanced), e avisos de expiração (7 e 1 dia). Agendados via Vercel Cron.

**Architecture:** Uma tabela `sent_emails` deduplica envios. Uma função pura (`computeDueEmails`) decide, dado os entitlements + os já-enviados + `now`, quais e-mails vencem hoje — testável. Uma rota de cron protegida (`/api/cron/emails-diarios`, `CRON_SECRET`) roda a lógica e envia via `email.ts` (Brevo, que já entrega — domínio autenticado). "Novos conteúdos" (Advanced) é evento (endpoint disparável), não tempo.

**Tech Stack:** Next 14 (route handlers), `@supabase/supabase-js` (service_role), Brevo (`email.ts`), Vitest (node env), Vercel Cron.

## Global Constraints

- **Custo zero:** sem dependência npm nova. pt-BR em toda copy.
- **Gate:** `npx tsc --noEmit` (0) + `npm run test` (verde). `npm run build` falha sem `STRIPE_SECRET_KEY` (pré-existente).
- **Vitest node-env:** só lógica pura testada; I/O (Supabase/Brevo) verificado por unidade + batendo na rota à mão. **Cron só dispara em deploy** (Vercel Cron não roda no `npm run dev`) — a lógica é testada por unidade e por chamada manual da rota.
- **Brevo entrega** (domínio `matrizcentral.com.br` autenticado, 2026-07-13) — remetente `contato@matrizcentral.com.br`, o mesmo que `email.ts` já usa.
- **Migrations aditivas**, default-deny RLS. Consome tabelas `entitlements`/`users` (já existem).
- Depende do Plano 1 (entitlements). Reusa `cycleKeyFor` de `src/lib/consumption.ts`.

---

## File Structure

**Criar:** `supabase/migrations/0019_sent_emails.sql`; `src/lib/email-cycle.ts`(+test); `src/app/api/cron/emails-diarios/route.ts`; `src/app/api/admin/notify-new-content/route.ts`; `vercel.json`.
**Modificar:** `src/types/index.ts` (tabela `sent_emails`); `src/lib/email.ts` (4 funções novas); `src/app/api/webhooks/stripe/route.ts` (confirmação de compra do passe); `.env.example` (`CRON_SECRET`).

---

## Task 1: Migration `sent_emails` + tipos

**Files:** Create `supabase/migrations/0019_sent_emails.sql`; Modify `src/types/index.ts`.

**Interfaces — Produces:** tabela `sent_emails`(`id,user_id,email_type,reference,sent_at`, unique(user_id,email_type,reference)) + tipo no `Database`.

- [ ] **Step 1: migration** — Create `supabase/migrations/0019_sent_emails.sql`:
```sql
create table if not exists sent_emails (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  email_type text not null,
  reference text not null,
  sent_at timestamptz not null default now(),
  unique (user_id, email_type, reference)
);
create index if not exists sent_emails_user_idx on sent_emails(user_id);
alter table sent_emails enable row level security;
```

- [ ] **Step 2: tipos** — em `src/types/index.ts`, após o bloco `content_unlocks`, adicionar:
```ts
      sent_emails: {
        Row: { id: string; user_id: string; email_type: string; reference: string; sent_at: string };
        Insert: { id?: string; user_id: string; email_type: string; reference: string; sent_at?: string };
        Update: Partial<Database["public"]["Tables"]["sent_emails"]["Insert"]>;
        Relationships: [];
      };
```

- [ ] **Step 3:** `npx tsc --noEmit` → exit 0.
- [ ] **Step 4:** aplicar no Supabase remoto via SQL Editor. *(Controller conduz.)*
- [ ] **Step 5: commit** — `git add supabase/migrations/0019_sent_emails.sql src/types/index.ts && git commit -m "feat(assinaturas): tabela sent_emails + tipos"`

---

## Task 2: `email-cycle.ts` — computeDueEmails (TDD)

**Files:** Create `src/lib/email-cycle.ts`, `src/lib/email-cycle.test.ts`.

**Interfaces — Consumes:** `cycleKeyFor` de `./consumption`. **Produces:**
- `type DueEmail = { user_id: string; email_type: "novo_ciclo" | "expiracao"; reference: string }`.
- `computeDueEmails(entitlements, sent, now): DueEmail[]`.

- [ ] **Step 1: teste que falha** — Create `src/lib/email-cycle.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { computeDueEmails } from "./email-cycle";

const mkEnt = (o: Partial<{ user_id: string; plan: "regular" | "advanced"; starts_at: string; expires_at: string }>) => ({
  user_id: "u1", plan: "regular" as const, starts_at: "2026-01-05T00:00:00.000Z", expires_at: "2027-01-05T00:00:00.000Z", ...o,
});

describe("computeDueEmails", () => {
  it("ignora entitlements expirados", () => {
    const now = new Date("2026-06-05T12:00:00.000Z");
    const ents = [mkEnt({ expires_at: "2026-01-01T00:00:00.000Z" })];
    expect(computeDueEmails(ents, [], now)).toEqual([]);
  });

  it("Regular: novo ciclo no dia do aniversário mensal", () => {
    const now = new Date("2026-02-05T12:00:00.000Z"); // cruza o dia 5 (cycle-0 -> cycle-1)
    const due = computeDueEmails([mkEnt({})], [], now);
    expect(due).toContainEqual({ user_id: "u1", email_type: "novo_ciclo", reference: "cycle-1" });
  });

  it("Regular: não redispara o novo ciclo já enviado", () => {
    const now = new Date("2026-02-05T12:00:00.000Z");
    const sent = [{ user_id: "u1", email_type: "novo_ciclo", reference: "cycle-1" }];
    const due = computeDueEmails([mkEnt({})], sent, now);
    expect(due.find((d) => d.email_type === "novo_ciclo")).toBeUndefined();
  });

  it("Regular: fora do dia de aniversário, sem novo ciclo", () => {
    const now = new Date("2026-02-10T12:00:00.000Z");
    const due = computeDueEmails([mkEnt({})], [], now);
    expect(due.find((d) => d.email_type === "novo_ciclo")).toBeUndefined();
  });

  it("expiração: dispara 7 dias antes (uma vez)", () => {
    const now = new Date("2026-12-29T12:00:00.000Z"); // expira 2027-01-05 -> ~7 dias
    const due = computeDueEmails([mkEnt({})], [], now);
    expect(due).toContainEqual({ user_id: "u1", email_type: "expiracao", reference: "expiry-7d" });
  });

  it("expiração: não redispara expiry-7d já enviado", () => {
    const now = new Date("2026-12-30T12:00:00.000Z");
    const sent = [{ user_id: "u1", email_type: "expiracao", reference: "expiry-7d" }];
    const due = computeDueEmails([mkEnt({})], sent, now);
    expect(due.find((d) => d.reference === "expiry-7d")).toBeUndefined();
  });
});
```

- [ ] **Step 2:** `npm run test -- email-cycle` → FAIL.
- [ ] **Step 3: implementar** — Create `src/lib/email-cycle.ts`:
```ts
import { cycleKeyFor } from "./consumption";

export type DueEmail = {
  user_id: string;
  email_type: "novo_ciclo" | "expiracao";
  reference: string;
};

type EntitlementRow = {
  user_id: string;
  plan: "regular" | "advanced";
  starts_at: string;
  expires_at: string;
};
type SentRow = { user_id: string; email_type: string; reference: string };

const DAY_MS = 24 * 60 * 60 * 1000;

/** Dado os entitlements vigentes + os e-mails já enviados, quais vencem hoje. */
export function computeDueEmails(
  entitlements: EntitlementRow[],
  sent: SentRow[],
  now: Date
): DueEmail[] {
  const sentKeys = new Set(sent.map((s) => `${s.user_id}|${s.email_type}|${s.reference}`));
  const due: DueEmail[] = [];

  for (const e of entitlements) {
    const expires = new Date(e.expires_at);
    if (expires.getTime() <= now.getTime()) continue; // expirado

    // Regular: novo ciclo mensal (aniversário da compra cruzado hoje).
    if (e.plan === "regular") {
      const starts = new Date(e.starts_at);
      const today = cycleKeyFor(starts, now);
      const yesterday = cycleKeyFor(starts, new Date(now.getTime() - DAY_MS));
      if (today !== yesterday) {
        const key = `${e.user_id}|novo_ciclo|${today}`;
        if (!sentKeys.has(key)) due.push({ user_id: e.user_id, email_type: "novo_ciclo", reference: today });
      }
    }

    // Expiração: 7 e 1 dias antes (cada um dispara uma vez, primeira vez na janela).
    const daysLeft = Math.ceil((expires.getTime() - now.getTime()) / DAY_MS);
    for (const d of [7, 1]) {
      if (daysLeft <= d && daysLeft >= 1) {
        const ref = `expiry-${d}d`;
        const key = `${e.user_id}|expiracao|${ref}`;
        if (!sentKeys.has(key)) due.push({ user_id: e.user_id, email_type: "expiracao", reference: ref });
      }
    }
  }
  return due;
}
```

- [ ] **Step 4:** `npm run test -- email-cycle` → PASS.
- [ ] **Step 5: commit** — `git add src/lib/email-cycle.ts src/lib/email-cycle.test.ts && git commit -m "feat(assinaturas): computeDueEmails (novo ciclo + expiração)"`

---

## Task 3: novas funções de e-mail em `email.ts`

**Files:** Modify `src/lib/email.ts`.

**Interfaces — Produces:** `sendPassPurchaseEmail({to, plan})`, `sendNewCycleEmail({to})`, `sendNewContentEmail({to, contentTitle})`, `sendExpiryEmail({to, daysLeft})`.

- [ ] **Step 1:** append em `src/lib/email.ts` (reusando `BREVO_API_URL` e o padrão de fetch):
```ts
async function sendBrevo(to: string, subject: string, htmlContent: string): Promise<void> {
  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: { "api-key": process.env.BREVO_API_KEY!, "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender: { name: "Matriz Central", email: "contato@matrizcentral.com.br" },
      to: [{ email: to }],
      subject,
      htmlContent,
    }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Falha ao enviar e-mail via Brevo: ${response.status} ${body}`);
  }
}

export async function sendPassPurchaseEmail(params: { to: string; plan: "regular" | "advanced" }): Promise<void> {
  const nome = params.plan === "advanced" ? "Advanced" : "Regular";
  await sendBrevo(
    params.to,
    `Seu passe ${nome} está ativo 🎉`,
    `<p>Seu passe <strong>${nome}</strong> foi ativado — 12 meses de acesso.</p>
     <p>Entre pela sua conta em <a href="${process.env.NEXT_PUBLIC_URL}/entrar">${process.env.NEXT_PUBLIC_URL}/entrar</a> e comece a consumir.</p>`
  );
}

export async function sendNewCycleEmail(params: { to: string }): Promise<void> {
  await sendBrevo(
    params.to,
    "Novo ciclo: escolha seu conteúdo do mês 📅",
    `<p>Seu novo ciclo abriu — você pode desbloquear <strong>mais 1 conteúdo</strong> este mês.</p>
     <p>Escolha em <a href="${process.env.NEXT_PUBLIC_URL}/conta">sua conta</a>.</p>`
  );
}

export async function sendNewContentEmail(params: { to: string; contentTitle: string }): Promise<void> {
  await sendBrevo(
    params.to,
    "Novo conteúdo disponível na Matriz Central 🚀",
    `<p>Acabou de sair: <strong>${params.contentTitle}</strong>.</p>
     <p>Como Advanced, já está liberado pra você em <a href="${process.env.NEXT_PUBLIC_URL}/conta">sua conta</a>.</p>`
  );
}

export async function sendExpiryEmail(params: { to: string; daysLeft: number }): Promise<void> {
  await sendBrevo(
    params.to,
    `Seu passe expira em ${params.daysLeft} dia(s) ⏳`,
    `<p>Seu acesso termina em <strong>${params.daysLeft} dia(s)</strong>.</p>
     <p>Renove em <a href="${process.env.NEXT_PUBLIC_URL}/oferta">${process.env.NEXT_PUBLIC_URL}/oferta</a> para não perder o consumo.</p>`
  );
}
```
(Não alterar as funções existentes; `sendBrevo` é um helper interno reusável.)

- [ ] **Step 2:** `npx tsc --noEmit` → exit 0.
- [ ] **Step 3: commit** — `git add src/lib/email.ts && git commit -m "feat(assinaturas): e-mails de passe/ciclo/novos-conteudos/expiração"`

---

## Task 4: rota de cron + vercel.json + env

**Files:** Create `src/app/api/cron/emails-diarios/route.ts`, `vercel.json`; Modify `.env.example`.

**Interfaces — Consumes:** `computeDueEmails` (Task 2), `sendNewCycleEmail`/`sendExpiryEmail` (Task 3), `getSupabaseServerClient`.

- [ ] **Step 1: rota** — Create `src/app/api/cron/emails-diarios/route.ts`:
```ts
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { computeDueEmails } from "@/lib/email-cycle";
import { sendNewCycleEmail, sendExpiryEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }

  const supabase = getSupabaseServerClient();
  const now = new Date();

  const { data: ents } = await supabase
    .from("entitlements").select("user_id, plan, starts_at, expires_at").gt("expires_at", now.toISOString());
  const { data: sent } = await supabase.from("sent_emails").select("user_id, email_type, reference");

  const due = computeDueEmails(ents ?? [], sent ?? [], now);
  if (due.length === 0) return NextResponse.json({ sent: 0 });

  const userIds = [...new Set(due.map((d) => d.user_id))];
  const { data: users } = await supabase.from("users").select("id, email").in("id", userIds);
  const emailById = new Map((users ?? []).map((u) => [u.id, u.email]));

  let count = 0;
  for (const d of due) {
    const to = emailById.get(d.user_id);
    if (!to) continue;
    try {
      if (d.email_type === "novo_ciclo") await sendNewCycleEmail({ to });
      else await sendExpiryEmail({ to, daysLeft: d.reference === "expiry-1d" ? 1 : 7 });
      // Grava DEPOIS do envio (falha → retenta amanhã; unique evita duplicata).
      await supabase.from("sent_emails").insert({ user_id: d.user_id, email_type: d.email_type, reference: d.reference });
      count++;
    } catch (err) {
      console.error("Falha ao enviar e-mail de ciclo:", d, err);
    }
  }
  return NextResponse.json({ sent: count });
}
```

- [ ] **Step 2: vercel.json** — Create `vercel.json`:
```json
{
  "crons": [
    { "path": "/api/cron/emails-diarios", "schedule": "0 12 * * *" }
  ]
}
```

- [ ] **Step 3: env** — em `.env.example`, na seção apropriada, adicionar:
```
# Segredo do cron (Vercel Cron manda no header Authorization: Bearer)
CRON_SECRET=
```

- [ ] **Step 4:** `npx tsc --noEmit` → exit 0.
- [ ] **Step 5: commit** — `git add "src/app/api/cron/emails-diarios/route.ts" vercel.json .env.example && git commit -m "feat(assinaturas): cron diário de e-mails de ciclo (Vercel Cron)"`

---

## Task 5: webhook envia confirmação de compra do passe

**Files:** Modify `src/app/api/webhooks/stripe/route.ts`.

**Interfaces — Consumes:** `sendPassPurchaseEmail` (Task 3). **Produces:** best-effort, envia a confirmação do passe quando `entitlementWasCreated`.

- [ ] **Step 1:** importar no topo: `import { sendPassPurchaseEmail } from "@/lib/email";` (junto do import de `sendTokenEmail`). Depois, **dentro do bloco `try` do e-mail de token** (o `try { await sendTokenEmail(...) }`), após o `await sendTokenEmail({ to: email, token: accessToken });`, adicionar:
```ts
    if (entitlementWasCreated && plan) {
      await sendPassPurchaseEmail({ to: email, plan });
    }
```
(`entitlementWasCreated`, `plan`, `email` já estão no escopo — do bloco de entitlement e do topo. Fica no mesmo `try` best-effort, então uma falha aqui não derruba o webhook.)

- [ ] **Step 2:** `npx tsc --noEmit` → exit 0.
- [ ] **Step 3: commit** — `git add src/app/api/webhooks/stripe/route.ts && git commit -m "feat(assinaturas): e-mail de confirmação do passe no webhook"`

---

## Task 6: endpoint "novos conteúdos" (Advanced)

**Files:** Create `src/app/api/admin/notify-new-content/route.ts`.

**Interfaces — Consumes:** `sendNewContentEmail` (Task 3), `getSupabaseServerClient`. **Produces:** `POST /api/admin/notify-new-content` (protegido por `CRON_SECRET`), body `{ contentTitle }`, avisa os Advanced ativos.

- [ ] **Step 1:** Create `src/app/api/admin/notify-new-content/route.ts`:
```ts
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { sendNewContentEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const contentTitle = body?.contentTitle;
  if (!contentTitle || typeof contentTitle !== "string") {
    return NextResponse.json({ error: "contentTitle é obrigatório" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const now = new Date().toISOString();
  const { data: ents } = await supabase
    .from("entitlements").select("user_id").eq("plan", "advanced").gt("expires_at", now);
  const userIds = [...new Set((ents ?? []).map((e) => e.user_id))];
  if (userIds.length === 0) return NextResponse.json({ sent: 0 });

  const { data: users } = await supabase.from("users").select("email").in("id", userIds);
  let count = 0;
  for (const u of users ?? []) {
    try { await sendNewContentEmail({ to: u.email, contentTitle }); count++; }
    catch (err) { console.error("Falha ao avisar novo conteúdo:", u.email, err); }
  }
  return NextResponse.json({ sent: count });
}
```

- [ ] **Step 2:** `npx tsc --noEmit` → exit 0.
- [ ] **Step 3: commit** — `git add "src/app/api/admin/notify-new-content/route.ts" && git commit -m "feat(assinaturas): endpoint de aviso de novos conteúdos (Advanced)"`

---

## Task 7: verificação + continuidade

**Files:** Modify `docs/frentes/assinaturas/README.md`, `docs/ESTADO-ATUAL.md`.

- [ ] **Step 1: gate** — `npx tsc --noEmit && npm run test` → tsc 0; testes verdes (inclui `email-cycle`).
- [ ] **Step 2: verificação da rota (local, sem cron)** — com `npm run dev`, chamar à mão a rota com o header certo:
  `curl -H "Authorization: Bearer <CRON_SECRET do .env.local>" http://localhost:3000/api/cron/emails-diarios` → responde `{ sent: N }` sem erro. Para exercitar um envio real, inserir (SQL Editor) um `entitlements` Regular cujo aniversário seja hoje, ou um cujo `expires_at` seja daqui a 7 dias, e conferir o `delivered` no log do Brevo. *(Controller conduz.)*
- [ ] **Step 3: continuidade** — atualizar `README.md` da frente (Plano 2 concluído) e `docs/ESTADO-ATUAL.md`. Registrar que o **disparo automático do cron só valida em deploy** (Vercel) e que `CRON_SECRET` precisa ser configurado na Vercel.
- [ ] **Step 4: commit** — `git add docs/ && git commit -m "docs(assinaturas): Plano 2 concluído — atualiza continuidade"`

---

## Notas de execução

- **Migration 0019:** aplicar pelo SQL Editor (controller), como as anteriores.
- **Cron só roda em deploy:** o Vercel Cron não dispara localmente. Localmente valida-se a rota chamando-a à mão (Step 2). No deploy, configurar `CRON_SECRET` nas env vars da Vercel (a Vercel injeta o header `Authorization: Bearer $CRON_SECRET` automaticamente para os crons quando `CRON_SECRET` está setado).
- **Brevo já entrega** (domínio autenticado) — os e-mails chegam de verdade.
- **`npm run build`** falha sem `STRIPE_SECRET_KEY` (pré-existente).
