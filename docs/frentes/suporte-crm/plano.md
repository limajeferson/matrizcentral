# Suporte/CRM (MVP) — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use `- [ ]`.

**Goal:** `/suporte` (FAQ + formulário de contato → grava + notifica o time por e-mail) + doc de estratégia de CRM/pós-venda.

**Architecture:** `support_messages` (migration 0021); lógica pura (`suporte.ts`) testada; e-mail de notificação (Brevo) + camada de dados; rota `POST /api/suporte`; página `/suporte` (FAQ reusa `FAQ_ITEMS` + form client). Doc de CRM.

## Global Constraints
- Custo zero. pt-BR. Gate: `tsc` 0 + `npm run test`. `npm run build` falha sem STRIPE_SECRET_KEY (pré-existente).
- Migration aditiva, default-deny RLS. Brevo entrega (domínio autenticado).

## File Structure
**Criar:** `supabase/migrations/0021_support_messages.sql`; `src/lib/suporte.ts`(+test); `src/lib/support-data.ts`; `src/app/api/suporte/route.ts`; `src/app/suporte/page.tsx`; `src/components/support/ContatoForm.tsx`; `docs/frentes/suporte-crm/crm.md`.
**Modificar:** `src/types/index.ts` (tabela); `src/lib/email.ts` (notificação); header/footer (link).

---

## Task 1: Migration `0021` + tipos

**Files:** Create `supabase/migrations/0021_support_messages.sql`; Modify `src/types/index.ts`.

- [ ] **Step 1: migration** — Create `supabase/migrations/0021_support_messages.sql`:
```sql
create table if not exists support_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  email text not null,
  message text not null,
  status text not null default 'aberto',
  created_at timestamptz not null default now()
);
create index if not exists support_messages_created_idx on support_messages(created_at desc);
alter table support_messages enable row level security;
```

- [ ] **Step 2: tipos** — em `src/types/index.ts`, após `forum_replies`, adicionar:
```ts
      support_messages: {
        Row: { id: string; user_id: string | null; email: string; message: string; status: string; created_at: string };
        Insert: { id?: string; user_id?: string | null; email: string; message: string; status?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["support_messages"]["Insert"]>;
        Relationships: [];
      };
```

- [ ] **Step 3:** `npx tsc --noEmit` → exit 0.
- [ ] **Step 4:** aplicar no Supabase remoto via SQL Editor. *(Controller conduz.)*
- [ ] **Step 5: commit** — `git add supabase/migrations/0021_support_messages.sql src/types/index.ts && git commit -m "feat(suporte): tabela support_messages + tipos"`

---

## Task 2: `suporte.ts` — lógica pura (TDD)

**Files:** Create `src/lib/suporte.ts`, `src/lib/suporte.test.ts`.

- [ ] **Step 1: testes** — Create `src/lib/suporte.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { validateContactInput } from "./suporte";

describe("validateContactInput", () => {
  it("e-mail inválido → erro", () => expect(validateContactInput({ email: "x", message: "mensagem longa o suficiente" }).ok).toBe(false));
  it("mensagem curta → erro", () => expect(validateContactInput({ email: "a@b.com", message: "oi" }).ok).toBe(false));
  it("válido → ok", () => expect(validateContactInput({ email: "a@b.com", message: "preciso de ajuda com o acesso" }).ok).toBe(true));
});
```

- [ ] **Step 2:** `npm run test -- suporte` → FAIL.
- [ ] **Step 3: implementar** — Create `src/lib/suporte.ts`:
```ts
import { isValidEmail } from "@/lib/email-validation";

export type ValidationResult = { ok: true } | { ok: false; error: string };

export function validateContactInput(input: { email?: unknown; message?: unknown }): ValidationResult {
  const email = typeof input.email === "string" ? input.email.trim() : "";
  const message = typeof input.message === "string" ? input.message.trim() : "";
  if (!isValidEmail(email)) return { ok: false, error: "Informe um e-mail válido." };
  if (message.length < 5) return { ok: false, error: "Escreva sua mensagem (mín. 5 caracteres)." };
  if (message.length > 5000) return { ok: false, error: "A mensagem pode ter no máximo 5000 caracteres." };
  return { ok: true };
}
```

- [ ] **Step 4:** `npm run test -- suporte` → PASS.
- [ ] **Step 5: commit** — `git add src/lib/suporte.ts src/lib/suporte.test.ts && git commit -m "feat(suporte): validateContactInput (logica pura)"`

---

## Task 3: e-mail de notificação + camada de dados

**Files:** Modify `src/lib/email.ts`; Create `src/lib/support-data.ts`.

- [ ] **Step 1: email** — em `src/lib/email.ts`, append (reusa o helper interno `sendBrevo` já existente):
```ts
export async function sendSupportNotification(params: { fromEmail: string; message: string }): Promise<void> {
  await sendBrevo(
    "contato@matrizcentral.com.br",
    `Nova mensagem de suporte de ${params.fromEmail}`,
    `<p><strong>De:</strong> ${params.fromEmail}</p><p><strong>Mensagem:</strong></p><p>${params.message}</p>`
  );
}
```
(Se `sendBrevo` não estiver acessível no escopo, verificar — foi adicionado na Frente 2 Plano 2; se for `function` interna do módulo, está acessível.)

- [ ] **Step 2: data** — Create `src/lib/support-data.ts`:
```ts
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function createSupportMessage(userId: string | null, email: string, message: string): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("support_messages")
    .insert({ user_id: userId, email: email.trim().toLowerCase(), message: message.trim() });
  return !error;
}
```

- [ ] **Step 3:** `npx tsc --noEmit` → exit 0.
- [ ] **Step 4: commit** — `git add src/lib/email.ts src/lib/support-data.ts && git commit -m "feat(suporte): e-mail de notificacao + createSupportMessage"`

---

## Task 4: rota + página + form

**Files:** Create `src/app/api/suporte/route.ts`, `src/app/suporte/page.tsx`, `src/components/support/ContatoForm.tsx`.

- [ ] **Step 1: rota** — Create `src/app/api/suporte/route.ts`:
```ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-session";
import { validateContactInput } from "@/lib/suporte";
import { createSupportMessage } from "@/lib/support-data";
import { sendSupportNotification } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const v = validateContactInput({ email: body?.email, message: body?.message });
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });

  const user = await getSessionUser();
  const ok = await createSupportMessage(user?.id ?? null, body.email, body.message);
  if (!ok) return NextResponse.json({ error: "Não foi possível registrar sua mensagem." }, { status: 500 });

  try { await sendSupportNotification({ fromEmail: body.email, message: body.message }); }
  catch (err) { console.error("Falha ao notificar suporte (mensagem já registrada):", err); }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: form** — Create `src/components/support/ContatoForm.tsx`:
```tsx
"use client";
import { useState } from "react";

export default function ContatoForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading"); setError(null);
    const res = await fetch("/api/suporte", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, message }),
    });
    if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? "Erro ao enviar."); setState("error"); return; }
    setState("done");
  }

  if (state === "done") return <p className="rounded-lg bg-green-50 p-4 text-green-800">Recebemos sua mensagem! Responderemos por e-mail em breve.</p>;

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="w-full rounded-lg border px-3 py-2" />
      <textarea required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Como podemos ajudar?" rows={4} className="w-full rounded-lg border px-3 py-2" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={state === "loading"} className="rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white disabled:opacity-60">
        {state === "loading" ? "Enviando..." : "Enviar mensagem"}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: página** — Create `src/app/suporte/page.tsx`:
```tsx
import { FAQ_ITEMS } from "@/components/marketing/v2/faq-data";
import ContatoForm from "@/components/support/ContatoForm";

export const metadata = { title: "Suporte — Matriz Central", description: "Tire dúvidas ou fale com a gente." };

export default function SuportePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold">Suporte</h1>
        <p className="mt-1 text-zinc-600">Veja as dúvidas frequentes ou envie uma mensagem.</p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">Dúvidas frequentes</h2>
        <ul className="space-y-3">
          {FAQ_ITEMS.map((f) => (
            <li key={f.question} className="rounded-xl border border-zinc-200 bg-white p-4">
              <p className="font-semibold text-zinc-900">{f.question}</p>
              <p className="mt-1 text-sm text-zinc-600">{f.answer}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">Fale com a gente</h2>
        <ContatoForm />
      </section>
    </div>
  );
}
```
> Nota: conferir o export real de `faq-data.ts` (`FAQ_ITEMS: { question; answer }[]`) — ajustar o import se o nome/campos diferirem.

- [ ] **Step 4:** `npx tsc --noEmit` → exit 0.
- [ ] **Step 5: verificar no navegador** — `/suporte`: FAQ + enviar mensagem → sucesso; conferir `support_messages` + `delivered` no Brevo. *(Controller conduz.)*
- [ ] **Step 6: commit** — `git add "src/app/api/suporte/route.ts" "src/app/suporte/page.tsx" "src/components/support/ContatoForm.tsx" && git commit -m "feat(suporte): rota + pagina /suporte (FAQ + contato)"`

---

## Task 5: link + doc de CRM + continuidade

**Files:** Modify header/footer (link `/suporte`); Create `docs/frentes/suporte-crm/crm.md`; Modify `docs/frentes/suporte-crm/README.md`, `docs/ESTADO-ATUAL.md`, `docs/ROADMAP-EXECUCAO.md`.

- [ ] **Step 1: link** — adicionar `{ href: "/suporte", label: "Suporte" }` ao `LINKS` do `LandingHeader` (e/ou footer). `tsc` 0.
- [ ] **Step 2: doc CRM** — Create `docs/frentes/suporte-crm/crm.md` (pt-BR): jornada de CRM/pós-venda — **onboarding** (compra→token/acesso→triagem→primeiro valor), **retenção** (ciclo de e-mails da assinatura, feed/fórum como engajamento), **reativação** (win-back de passe expirado, o e-mail de expiração), **suporte** (do autoatendimento `/suporte` ao contato humano; SLA simples), **métricas** por etapa. Artefato de planejamento.
- [ ] **Step 3: continuidade** — atualizar `README.md` da frente, `ESTADO-ATUAL.md` (Frente 6 concluída → **todas as 6 frentes entregues**), `ROADMAP-EXECUCAO.md` (Frente 6 ✅).
- [ ] **Step 4: gate + commit** — `npx tsc --noEmit && npm run test` (inclui `suporte`); `git add . && git commit -m "docs(suporte): link + jornada de CRM + Frente 6 concluida"` (só arquivos desta task; NÃO commitar untracked não-relacionados).

## Notas de execução
- Migration 0021 aplicar no SQL Editor (controller).
- `sendBrevo` é helper interno de `email.ts` (Frente 2 Plano 2) — `sendSupportNotification` fica no mesmo módulo para acessá-lo.
