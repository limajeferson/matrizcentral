# SP1 — Casa unificada + diagnóstico por sessão — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Todo usuário logado tem uma casa única (`/feed`); o diagnóstico roda por sessão e grava o perfil na conta; o pós-compra loga o comprador e o leva ao `/feed`; o loop pós-compra é eliminado.

**Architecture:** O perfil migra de `tokens` (token do e-mail) para `users` (conta de sessão). Um novo endpoint `POST /api/diagnostico` (autenticado por sessão) calcula o perfil com a lógica pura já testada (`scoreTriagem`) e **checa o erro** ao gravar — nunca finge sucesso (a causa-raiz do loop). O `/feed` ganha um bloco de boas-vindas que abre o diagnóstico inline. A página de sucesso do checkout **auto-loga** o comprador via `session_id` da Stripe (verificando `payment_status = paid`) e redireciona pra `/feed`, sem depender de e-mail.

**Tech Stack:** Next.js 14 (App Router, route handlers, server/client components), Supabase (service role, RLS default-deny), Stripe (retrieve checkout session), Vitest (environment node), TypeScript.

## Global Constraints

- **Custo zero:** nenhuma dependência npm nova; nenhum asset externo.
- **Idioma:** toda copy voltada ao usuário e mensagens em **pt-BR**.
- **Gate de verificação:** `npx tsc --noEmit` exit 0 **e** `npm run test` verdes. `npm run build` **não** é gate (falha pré-existente ao coletar `/api/checkout` sem `STRIPE_SECRET_KEY`).
- **Testabilidade (Vitest node-env):** lógica pura em `src/lib` **e** rotas com `@/lib/supabase/server` mockado são unit-testáveis (ver `src/app/api/quiz/route.test.ts`). Componentes/páginas React **não** são unit-testados → verificar rodando o app (`npm run dev -- -p 3000`).
- **Migrations:** numerar sequencial — a próxima livre é **0022**. Aplicar no Supabase remoto via **SQL Editor** (hand-off; `db push` falha por histórico divergente). RLS default-deny: todo acesso é server-side com service role.
- **Perfil é enum de código** (`ProfileId` em `src/lib/quiz-scoring.ts`). `users.profile_id` é **texto validado em código, SEM foreign key** — decisão deliberada deste plano: desacopla a escrita da semeadura da tabela `profiles` e impede a reincidência do bug (FK-reject engolido silenciosamente). A tabela `profiles` continua sendo lida só para exibição (SP3), com fallback.
- **Windows/Git Bash:** caminhos com `(marketing)` precisam de aspas; porta do dev server força com `-p 3000`.
- **Não commitar** arquivos não rastreados alheios (`CLAUDE.local-draft.md`, `SETUP.md`, `claude-chat.md`).
- **Branch:** `master` (convenção do projeto).

## File Structure

- `supabase/migrations/0022_user_profile.sql` — **criar.** Colunas `profile_id`/`diagnosed_at` em `users` + backfill dos tokens já triados.
- `src/lib/diagnosis.ts` — **criar.** `parseTriagemAnswers` (validação pura do payload).
- `src/lib/diagnosis.test.ts` — **criar.** Testes de `parseTriagemAnswers`.
- `src/app/api/diagnostico/route.ts` — **criar.** `POST` autenticado por sessão; grava perfil checando erro; XP idempotente.
- `src/app/api/diagnostico/route.test.ts` — **criar.** Cobre 401/400/200/500/idempotência.
- `src/components/quiz/DiagnosticoInline.tsx` — **criar.** Diagnóstico embutido no feed (posta em `/api/diagnostico`).
- `src/app/api/checkout-login/route.ts` — **criar.** Auto-login pós-compra via `session_id`.
- `src/app/api/checkout-login/route.test.ts` — **criar.** Cobre 400/ready-false/ready-true+cookie.
- `src/lib/access.ts` — **modificar.** Adicionar `resolveUserBySessionId`.
- `src/app/api/quiz/route.ts` — **modificar.** Checar erro do `tokens.update` (corrige o bug do loop no fluxo legado).
- `src/app/api/quiz/route.test.ts` — **modificar.** Novo caso: update falha → 500.
- `src/app/feed/page.tsx` — **modificar.** Ler `users.profile_id`; renderizar bloco de boas-vindas quando logado sem perfil.
- `src/app/checkout/sucesso/AccessReveal.tsx` — **modificar.** Auto-login via `session_id` → `/feed`.

---

### Task 1: Migration 0022 — perfil na conta (`users`)

**Files:**
- Create: `supabase/migrations/0022_user_profile.sql`

**Interfaces:**
- Produces: colunas `users.profile_id text` (nullable, sem FK) e `users.diagnosed_at timestamptz` (nullable). Backfill idempotente a partir de `tokens` triados.

- [ ] **Step 1: Escrever a migration**

Criar `supabase/migrations/0022_user_profile.sql`:

```sql
-- Diagnóstico por sessão: o perfil passa a viver na conta (users), não no token.
-- profile_id é TEXTO validado em código (ProfileId), sem FK — desacopla a
-- escrita da semeadura de `profiles` e evita o bug de update rejeitado.
alter table users add column if not exists profile_id text;
alter table users add column if not exists diagnosed_at timestamptz;

-- Backfill idempotente: quem já tem token triado herda o perfil para a conta.
update users u
set profile_id = t.profile_id,
    diagnosed_at = coalesce(t.triaged_at, now())
from tokens t
join purchases p on p.id = t.purchase_id
where p.user_id = u.id
  and t.triaged = true
  and t.profile_id is not null
  and u.profile_id is null;
```

- [ ] **Step 2: Verificar tsc (a migration não afeta tipos, mas confirma a base)**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0022_user_profile.sql
git commit -m "feat(db): migration 0022 — perfil do diagnostico na conta (users)"
```

> **Hand-off de ambiente:** aplicar este SQL no Supabase remoto via SQL Editor **antes** da verificação manual das Tasks 3/5/6 (os testes automatizados usam mock e não precisam disto). É idempotente (`add column if not exists`).

---

### Task 2: `parseTriagemAnswers` (validação pura do payload)

**Files:**
- Create: `src/lib/diagnosis.ts`
- Test: `src/lib/diagnosis.test.ts`

**Interfaces:**
- Consumes: `TriagemAnswer` de `@/lib/quiz-scoring` (`{ questionId: number; selectedOptionIndexes: number[] }`).
- Produces: `parseTriagemAnswers(raw: unknown): TriagemAnswer[] | null` — retorna as respostas normalizadas ou `null` se o formato for inválido.

- [ ] **Step 1: Escrever os testes que falham**

Criar `src/lib/diagnosis.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { parseTriagemAnswers } from "./diagnosis";

describe("parseTriagemAnswers", () => {
  it("aceita um array de respostas bem formado", () => {
    const raw = [
      { questionId: 1, selectedOptionIndexes: [0] },
      { questionId: 2, selectedOptionIndexes: [1, 3] },
    ];
    expect(parseTriagemAnswers(raw)).toEqual(raw);
  });

  it("rejeita não-array", () => {
    expect(parseTriagemAnswers("nope")).toBeNull();
    expect(parseTriagemAnswers(null)).toBeNull();
    expect(parseTriagemAnswers(undefined)).toBeNull();
  });

  it("rejeita array vazio", () => {
    expect(parseTriagemAnswers([])).toBeNull();
  });

  it("rejeita item sem questionId numérico", () => {
    expect(parseTriagemAnswers([{ selectedOptionIndexes: [0] }])).toBeNull();
    expect(parseTriagemAnswers([{ questionId: "1", selectedOptionIndexes: [0] }])).toBeNull();
  });

  it("rejeita selectedOptionIndexes que não é array de inteiros", () => {
    expect(parseTriagemAnswers([{ questionId: 1, selectedOptionIndexes: "x" }])).toBeNull();
    expect(parseTriagemAnswers([{ questionId: 1, selectedOptionIndexes: [1.5] }])).toBeNull();
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm run test -- src/lib/diagnosis.test.ts`
Expected: FAIL — "Cannot find module './diagnosis'".

- [ ] **Step 3: Implementar**

Criar `src/lib/diagnosis.ts`:

```ts
import type { TriagemAnswer } from "@/lib/quiz-scoring";

/**
 * Valida e normaliza o payload de respostas do diagnóstico vindo do cliente.
 * Retorna null se o formato for inválido (o endpoint responde 400) — nunca
 * confia cegamente no corpo da requisição.
 */
export function parseTriagemAnswers(raw: unknown): TriagemAnswer[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const answers: TriagemAnswer[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null) return null;
    const q = (item as Record<string, unknown>).questionId;
    const sel = (item as Record<string, unknown>).selectedOptionIndexes;
    if (typeof q !== "number" || !Number.isInteger(q)) return null;
    if (!Array.isArray(sel)) return null;
    if (sel.some((i) => typeof i !== "number" || !Number.isInteger(i))) return null;
    answers.push({ questionId: q, selectedOptionIndexes: sel as number[] });
  }
  return answers;
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm run test -- src/lib/diagnosis.test.ts`
Expected: PASS (5 testes).

- [ ] **Step 5: Commit**

```bash
git add src/lib/diagnosis.ts src/lib/diagnosis.test.ts
git commit -m "feat(diagnostico): parseTriagemAnswers (validacao pura do payload)"
```

---

### Task 3: `POST /api/diagnostico` (session-based, checa erro, XP idempotente)

**Files:**
- Create: `src/app/api/diagnostico/route.ts`
- Test: `src/app/api/diagnostico/route.test.ts`

**Interfaces:**
- Consumes: `getSessionUser()` de `@/lib/auth-session` (`Promise<{id,email}|null>`); `scoreTriagem(QUIZ_TRIAGEM, answers)` de `@/lib/quiz-scoring`; `QUIZ_TRIAGEM` de `@/data/quiz-triagem`; `parseTriagemAnswers` da Task 2; `getSupabaseServerClient()` de `@/lib/supabase/server`.
- Produces: `POST` que retorna `{ profileId }` (200), ou 401 (sem sessão), 400 (payload inválido), 500 (falha ao gravar — **sem fingir sucesso**).

- [ ] **Step 1: Escrever os testes que falham**

Criar `src/app/api/diagnostico/route.test.ts`:

```ts
import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

let sessionUser: { id: string; email: string } | null;
vi.mock("@/lib/auth-session", () => ({
  getSessionUser: async () => sessionUser,
}));

function buildSupabaseMock(opts: { updateError?: unknown; existingXp?: unknown } = {}) {
  const inserted: Record<string, unknown[]> = { xp_events: [] };
  const updated: Record<string, unknown>[] = [];
  const from = (table: string) => {
    if (table === "users") {
      return {
        update: (payload: Record<string, unknown>) => ({
          eq: async () => {
            updated.push(payload);
            return { data: null, error: opts.updateError ?? null };
          },
        }),
      };
    }
    if (table === "xp_events") {
      const chain = {
        eq: () => chain,
        maybeSingle: async () => ({ data: opts.existingXp ?? null, error: null }),
      };
      return {
        select: () => chain,
        insert: async (rows: unknown) => {
          inserted.xp_events.push(rows);
          return { data: null, error: null };
        },
      };
    }
    return {};
  };
  return { from, inserted, updated };
}

let mockSupabase: ReturnType<typeof buildSupabaseMock>;
vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: () => mockSupabase,
}));

function req(body: unknown) {
  return new NextRequest("http://localhost/api/diagnostico", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/diagnostico", () => {
  beforeEach(() => vi.clearAllMocks());

  it("401 sem sessão", async () => {
    sessionUser = null;
    mockSupabase = buildSupabaseMock();
    const { POST } = await import("./route");
    const res = await POST(req({ answers: [{ questionId: 1, selectedOptionIndexes: [0] }] }));
    expect(res.status).toBe(401);
  });

  it("400 com respostas inválidas", async () => {
    sessionUser = { id: "u1", email: "a@b.com" };
    mockSupabase = buildSupabaseMock();
    const { POST } = await import("./route");
    const res = await POST(req({ answers: "nope" }));
    expect(res.status).toBe(400);
  });

  it("grava perfil + XP e retorna profileId", async () => {
    sessionUser = { id: "u1", email: "a@b.com" };
    mockSupabase = buildSupabaseMock();
    const { POST } = await import("./route");
    // Q1/opção 0 ("Todos os dias") pontua profissional_produtividade.
    const res = await POST(req({ answers: [{ questionId: 1, selectedOptionIndexes: [0] }] }));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.profileId).toBe("profissional_produtividade");
    expect(mockSupabase.updated[0]).toMatchObject({ profile_id: "profissional_produtividade" });
    expect(mockSupabase.inserted.xp_events).toHaveLength(1);
  });

  it("500 (sem fingir sucesso) quando o update do perfil falha", async () => {
    sessionUser = { id: "u1", email: "a@b.com" };
    mockSupabase = buildSupabaseMock({ updateError: { message: "boom" } });
    const { POST } = await import("./route");
    const res = await POST(req({ answers: [{ questionId: 1, selectedOptionIndexes: [0] }] }));
    expect(res.status).toBe(500);
    expect(mockSupabase.inserted.xp_events).toHaveLength(0);
  });

  it("não duplica XP se já existe evento de triagem", async () => {
    sessionUser = { id: "u1", email: "a@b.com" };
    mockSupabase = buildSupabaseMock({ existingXp: { id: "x1" } });
    const { POST } = await import("./route");
    const res = await POST(req({ answers: [{ questionId: 1, selectedOptionIndexes: [0] }] }));
    expect(res.status).toBe(200);
    expect(mockSupabase.inserted.xp_events).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm run test -- src/app/api/diagnostico/route.test.ts`
Expected: FAIL — "Cannot find module './route'".

- [ ] **Step 3: Implementar a rota**

Criar `src/app/api/diagnostico/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-session";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { scoreTriagem } from "@/lib/quiz-scoring";
import { QUIZ_TRIAGEM } from "@/data/quiz-triagem";
import { parseTriagemAnswers } from "@/lib/diagnosis";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "não autenticado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const answers = parseTriagemAnswers(body?.answers);
  if (!answers) {
    return NextResponse.json({ error: "respostas inválidas" }, { status: 400 });
  }

  const profileId = scoreTriagem(QUIZ_TRIAGEM, answers);
  const supabase = getSupabaseServerClient();

  // Grava o perfil na CONTA e CHECA o erro — nunca finge sucesso (era a
  // causa-raiz do loop pós-compra no fluxo antigo).
  const { error: updateError } = await supabase
    .from("users")
    .update({ profile_id: profileId, diagnosed_at: new Date().toISOString() })
    .eq("id", user.id);
  if (updateError) {
    console.error("Falha ao gravar diagnóstico na conta:", updateError);
    return NextResponse.json({ error: "não foi possível salvar" }, { status: 500 });
  }

  // XP de diagnóstico, idempotente por usuário (só a primeira vez).
  const { data: existingXp } = await supabase
    .from("xp_events")
    .select("id")
    .eq("user_id", user.id)
    .eq("action_type", "triagem")
    .maybeSingle();
  if (!existingXp) {
    await supabase.from("xp_events").insert({
      user_id: user.id,
      xp_amount: 50,
      action_type: "triagem",
      reference_id: user.id,
    });
  }

  return NextResponse.json({ profileId });
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm run test -- src/app/api/diagnostico/route.test.ts`
Expected: PASS (5 testes).

- [ ] **Step 5: Commit**

```bash
git add src/app/api/diagnostico/route.ts src/app/api/diagnostico/route.test.ts
git commit -m "feat(diagnostico): POST /api/diagnostico por sessao (checa erro, XP idempotente)"
```

---

### Task 4: Corrigir o bug do loop no `/api/quiz` legado

**Files:**
- Modify: `src/app/api/quiz/route.ts` (bloco de triagem, o `tokens.update`)
- Test: `src/app/api/quiz/route.test.ts` (novo caso + parâmetro no mock)

**Interfaces:**
- Consumes: mock `buildSupabaseMock` existente.
- Produces: `/api/quiz` (triagem) retorna **500** quando o `tokens.update` falha, em vez de 200 silencioso.

- [ ] **Step 1: Escrever o teste que falha**

Em `src/app/api/quiz/route.test.ts`: (a) adicionar um 4º parâmetro `triageUpdateError` à `buildSupabaseMock` e usá-lo no ramo `tokens.update`; (b) adicionar o caso novo.

Alterar a assinatura e o `tokens.update` do mock:

```ts
function buildSupabaseMock(
  tokenRow: Record<string, unknown> | null,
  existingXpEvent: Record<string, unknown> | null = null,
  userTotalXp: { before: number; after: number; email?: string } = { before: 0, after: 0 },
  triageUpdateError: unknown = null
) {
  // ...restante idêntico...
  // dentro de from("tokens"):
  //   update: (payload) => ({ eq: async () => { updated.push(payload); return { data: null, error: triageUpdateError }; } }),
```

Adicionar o teste:

```ts
it("retorna 500 (sem fingir sucesso) quando o update da triagem falha", async () => {
  mockSupabase = buildSupabaseMock(
    { token: "ABC1234567", purchase_id: "purchase-1", triaged: false },
    null,
    { before: 0, after: 0 },
    { message: "boom" }
  );

  const { POST } = await import("./route");
  const request = new NextRequest("http://localhost/api/quiz", {
    method: "POST",
    body: JSON.stringify({
      token: "ABC1234567",
      quizType: "triagem",
      answers: [{ questionId: 1, selectedOptionIndexes: [0] }],
    }),
  });

  const response = await POST(request);
  expect(response.status).toBe(500);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm run test -- src/app/api/quiz/route.test.ts`
Expected: FAIL — o caso novo recebe 200 (bug ainda presente).

- [ ] **Step 3: Corrigir a rota**

Em `src/app/api/quiz/route.ts`, no bloco `if (quizType === "triagem")`, trocar:

```ts
    await supabase
      .from("tokens")
      .update({ profile_id: profileId, triaged: true, triaged_at: new Date().toISOString() })
      .eq("token", token);
```

por:

```ts
    const { error: triageError } = await supabase
      .from("tokens")
      .update({ profile_id: profileId, triaged: true, triaged_at: new Date().toISOString() })
      .eq("token", token);
    if (triageError) {
      console.error("Falha ao marcar triagem no token:", triageError);
      return NextResponse.json({ error: "não foi possível salvar a triagem" }, { status: 500 });
    }
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm run test -- src/app/api/quiz/route.test.ts`
Expected: PASS (todos os casos, incluindo o novo 500).

- [ ] **Step 5: Commit**

```bash
git add src/app/api/quiz/route.ts src/app/api/quiz/route.test.ts
git commit -m "fix(quiz): /api/quiz retorna 500 quando o update da triagem falha (corrige loop)"
```

---

### Task 5: Bloco de boas-vindas + diagnóstico inline no `/feed`

**Files:**
- Create: `src/components/quiz/DiagnosticoInline.tsx`
- Modify: `src/app/feed/page.tsx`

**Interfaces:**
- Consumes: `getSessionUser()`; `getSupabaseServerClient()`; `QUIZ_TRIAGEM` de `@/data/quiz-triagem`; `visibleQuestions` de `@/lib/quiz-branching`; `POST /api/diagnostico` (Task 3).
- Produces: `<DiagnosticoInline />` (client) — renderiza o diagnóstico e, ao concluir, chama `router.refresh()`; em falha mostra erro real. O `/feed` mostra o bloco só quando `user && !profileId`.

> **Nota de duplicação (deliberada e temporária):** `DiagnosticoInline` compartilha estrutura de passos com `QuizTriagem` (token), mas difere no endpoint, no payload (sem `token`) e no sucesso (`refresh` vs `push`). `QuizTriagem` e todo o fluxo token são **removidos no SP2**; por isso não se refatora o componente token agora. Verificação = tsc + app (componentes não são unit-testados neste projeto).

- [ ] **Step 1: Criar o componente inline**

Criar `src/components/quiz/DiagnosticoInline.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QUIZ_TRIAGEM } from "@/data/quiz-triagem";
import { visibleQuestions } from "@/lib/quiz-branching";

export default function DiagnosticoInline() {
  const router = useRouter();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: number; selectedOptionIndexes: number[] }[]>([]);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visible = visibleQuestions(QUIZ_TRIAGEM, answers);
  const question = visible[currentQ];
  const isLast = currentQ === visible.length - 1;

  const toggleOption = (index: number) => {
    if (question.type === "radio") {
      setSelectedIndexes([index]);
    } else {
      setSelectedIndexes((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    }
  };

  const handleNext = async () => {
    const updatedAnswers = [...answers, { questionId: question.id, selectedOptionIndexes: selectedIndexes }];
    setAnswers(updatedAnswers);
    setSelectedIndexes([]);
    setError(null);

    const updatedVisible = visibleQuestions(QUIZ_TRIAGEM, updatedAnswers);
    if (currentQ + 1 < updatedVisible.length) {
      setCurrentQ((prev) => prev + 1);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/diagnostico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: updatedAnswers }),
      });
      if (res.ok) {
        router.refresh(); // o feed re-renderiza sem o bloco de boas-vindas
        return;
      }
    } catch {
      // cai no erro abaixo
    }
    setSubmitting(false);
    setError("Não foi possível salvar seu diagnóstico agora. Tente novamente.");
  };

  return (
    <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5">
      <p className="mb-1 text-sm font-semibold text-violet-700">Boas-vindas 👋</p>
      <h2 className="mb-3 text-lg font-bold text-zinc-900">
        Responda 1 minuto e personalizamos seu feed
      </h2>
      <p className="mb-1 text-sm text-zinc-500">
        Pergunta {currentQ + 1} de {visible.length}
      </p>
      <h3 className="mb-3 font-semibold text-zinc-900">{question.text}</h3>
      <div className="space-y-2">
        {question.options.map((option, index) => (
          <button
            key={option.text}
            type="button"
            onClick={() => toggleOption(index)}
            className={`w-full rounded-xl border-2 p-3 text-left transition ${
              selectedIndexes.includes(index)
                ? "border-violet-500 bg-white"
                : "border-zinc-200 bg-white hover:border-violet-300"
            }`}
          >
            {option.text}
          </button>
        ))}
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <button
        type="button"
        onClick={handleNext}
        disabled={selectedIndexes.length === 0 || submitting}
        className="mt-4 w-full rounded-xl bg-violet-600 py-3 font-bold text-white transition hover:bg-violet-700 disabled:opacity-50"
      >
        {isLast ? (submitting ? "Salvando..." : "Personalizar meu feed") : "Próxima"}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Ligar no `/feed`**

Em `src/app/feed/page.tsx`: importar o componente e ler o perfil do usuário. Adicionar o import:

```ts
import DiagnosticoInline from "@/components/quiz/DiagnosticoInline";
```

Dentro de `FeedPage`, logo após `const user = await getSessionUser();`, ler o perfil:

```ts
  let profileId: string | null = null;
  if (user) {
    const sb = getSupabaseServerClient();
    const { data: urow } = await sb.from("users").select("profile_id").eq("id", user.id).maybeSingle();
    profileId = (urow?.profile_id as string | null) ?? null;
  }
```

(`getSupabaseServerClient` já está importado no arquivo.) E, no JSX, logo abaixo de `<h1 ...>Feed</h1>`, inserir:

```tsx
      {user && !profileId && <DiagnosticoInline />}
```

- [ ] **Step 3: Verificar tsc**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 4: Verificar no app (manual — requer 0022 aplicada no remoto)**

Run: `npm run dev -- -p 3000`
Verificar, logado com uma conta **sem** `profile_id`: o `/feed` mostra o bloco "Boas-vindas"; responder até o fim → o bloco some (feed recarrega) e `users.profile_id` fica gravado. Sem sessão, o bloco não aparece e o feed funciona normalmente.

- [ ] **Step 5: Commit**

```bash
git add src/components/quiz/DiagnosticoInline.tsx src/app/feed/page.tsx
git commit -m "feat(feed): bloco de boas-vindas + diagnostico inline por sessao"
```

---

### Task 6: Auto-login pós-compra → `/feed`

**Files:**
- Modify: `src/lib/access.ts` (adicionar `resolveUserBySessionId`)
- Create: `src/app/api/checkout-login/route.ts`
- Test: `src/app/api/checkout-login/route.test.ts`
- Modify: `src/app/checkout/sucesso/AccessReveal.tsx`

**Interfaces:**
- Consumes: `stripe` de `@/lib/stripe`; `getSupabaseServerClient()`; `createSession`, `SESSION_COOKIE`, `SESSION_MAX_AGE_SECONDS` de `@/lib/auth-session`.
- Produces: `resolveUserBySessionId(sessionId): Promise<{ userId, email } | null>` (só quando `payment_status === "paid"`); `POST /api/checkout-login` que, dado `{ sessionId }`, cria a sessão e seta o cookie `mc_session` (`{ ready: true }`), ou `{ ready: false }` se ainda não resolvível.

- [ ] **Step 1: Adicionar `resolveUserBySessionId` em `src/lib/access.ts`**

Acrescentar ao final de `src/lib/access.ts`:

```ts
/**
 * Resolve o usuário dono de uma compra a partir do `session_id` da Stripe,
 * SÓ se a sessão estiver paga. Base do auto-login pós-compra (a página de
 * sucesso troca isto por uma sessão logada, sem depender de e-mail).
 */
export async function resolveUserBySessionId(
  sessionId: string
): Promise<{ userId: string; email: string } | null> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") return null;

    const paymentIntent =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;
    if (!paymentIntent) return null;

    const supabase = getSupabaseServerClient();
    const { data: purchase } = await supabase
      .from("purchases")
      .select("user_id")
      .eq("stripe_payment_id", paymentIntent)
      .maybeSingle();
    if (!purchase) return null;

    const { data: user } = await supabase
      .from("users")
      .select("id, email")
      .eq("id", purchase.user_id)
      .maybeSingle();
    return user ? { userId: user.id, email: user.email } : null;
  } catch (err) {
    console.error("Falha ao resolver usuário por session_id:", err);
    return null;
  }
}
```

- [ ] **Step 2: Escrever os testes do endpoint (falham)**

Criar `src/app/api/checkout-login/route.test.ts`:

```ts
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
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `npm run test -- src/app/api/checkout-login/route.test.ts`
Expected: FAIL — "Cannot find module './route'".

- [ ] **Step 4: Implementar o endpoint**

Criar `src/app/api/checkout-login/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { resolveUserBySessionId } from "@/lib/access";
import { createSession, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/auth-session";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const sessionId = body?.sessionId;
  if (!sessionId || typeof sessionId !== "string") {
    return NextResponse.json({ error: "sessionId obrigatório" }, { status: 400 });
  }

  const resolved = await resolveUserBySessionId(sessionId);
  if (!resolved) {
    // Webhook ainda pode estar processando: o cliente tenta de novo.
    return NextResponse.json({ ready: false });
  }

  const secret = await createSession(resolved.userId);
  const res = NextResponse.json({ ready: true });
  res.cookies.set(SESSION_COOKIE, secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return res;
}
```

- [ ] **Step 5: Rodar e ver passar**

Run: `npm run test -- src/app/api/checkout-login/route.test.ts`
Expected: PASS (3 testes).

- [ ] **Step 6: Auto-login na página de sucesso**

Substituir `src/app/checkout/sucesso/AccessReveal.tsx` por uma versão que tenta o auto-login e redireciona para `/feed`, mantendo o reenvio por e-mail como rede de segurança:

```tsx
"use client";

import { useEffect, useState, type FormEvent } from "react";

type ResendState = "idle" | "sending" | "done" | "error";

/**
 * Após a compra, tenta LOGAR o usuário automaticamente pelo session_id da
 * Stripe (o webhook cria a conta; aqui a sessão é minted sem depender de
 * e-mail) e leva para /feed. Enquanto o webhook processa, faz polling curto.
 * O reenvio por e-mail continua como rede de segurança.
 */
export default function AccessReveal({ sessionId }: { sessionId: string | null }) {
  const [checking, setChecking] = useState<boolean>(Boolean(sessionId));
  const [email, setEmail] = useState("");
  const [resend, setResend] = useState<ResendState>("idle");

  useEffect(() => {
    if (!sessionId) {
      setChecking(false);
      return;
    }
    let active = true;
    let tries = 0;

    const poll = async () => {
      tries += 1;
      try {
        const res = await fetch("/api/checkout-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json().catch(() => null);
        if (active && data?.ready) {
          window.location.href = "/feed"; // navegação cheia: o cookie novo passa a valer no servidor
          return;
        }
      } catch {
        // ignora e tenta de novo
      }
      if (active && tries < 12) {
        setTimeout(poll, 2500);
      } else if (active) {
        setChecking(false);
      }
    };

    poll();
    return () => {
      active = false;
    };
  }, [sessionId]);

  const handleResend = async (e: FormEvent) => {
    e.preventDefault();
    if (resend === "sending") return;
    setResend("sending");
    try {
      const res = await fetch("/api/resend-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResend(res.ok ? "done" : "error");
    } catch {
      setResend("error");
    }
  };

  return (
    <>
      <p>
        {checking
          ? "Preparando seu acesso — entrando na sua conta…"
          : "Sua conta está pronta. Entre para acessar seu feed."}
      </p>
      {!checking && (
        <a className="mc-checkout-cta" href="/entrar">
          Entrar na minha conta →
        </a>
      )}
      {resend === "done" ? (
        <p className="mc-checkout-hint">
          ✓ Se este e-mail tiver uma compra, o link de acesso foi reenviado.
        </p>
      ) : (
        <form className="mc-resend" onSubmit={handleResend}>
          <label htmlFor="resend-email" className="mc-sr-only">Seu e-mail</label>
          <input
            id="resend-email"
            type="email"
            required
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Seu e-mail"
          />
          <button type="submit" disabled={resend === "sending"}>
            {resend === "sending" ? "Enviando…" : "Não recebeu? Reenviar"}
          </button>
        </form>
      )}
      {resend === "error" && (
        <p className="mc-checkout-hint">
          Não foi possível reenviar agora. Tente novamente em instantes.
        </p>
      )}
    </>
  );
}
```

- [ ] **Step 7: Verificar tsc + testes**

Run: `npx tsc --noEmit && npm run test`
Expected: tsc exit 0; toda a suíte verde.

- [ ] **Step 8: Verificar no app (manual — requer 0022 aplicada + Stripe modo teste)**

Fazer uma compra de teste (cartão `4242 4242 4242 4242`): a página de sucesso deve **logar automaticamente** e redirecionar pra `/feed` (com o bloco de boas-vindas, se sem perfil). Nenhum passo leva a `/dashboard/[token]`.

- [ ] **Step 9: Commit**

```bash
git add src/lib/access.ts src/app/api/checkout-login/route.ts src/app/api/checkout-login/route.test.ts src/app/checkout/sucesso/AccessReveal.tsx
git commit -m "feat(checkout): auto-login pos-compra por session_id -> /feed"
```

---

## Critério de aceite (SP1)

- Comprador novo, após pagar (modo teste), é **logado automaticamente** e cai no **`/feed`** — nunca em `/dashboard/[token]`.
- Logado sem perfil → vê o bloco de boas-vindas; conclui o diagnóstico inline; `users.profile_id` fica gravado; o feed segue utilizável antes e depois.
- Se o gravar-perfil falhar, o cliente vê **erro real e pode retentar** — o 200-em-falha foi eliminado (no endpoint novo **e** no `/api/quiz` legado).
- `npx tsc --noEmit` exit 0; `npm run test` verde (incluindo os novos testes de `diagnosis`, `/api/diagnostico`, `/api/checkout-login` e o caso 500 do `/api/quiz`).

## Self-review (writing-plans)

- **Cobertura do spec (SP1):** migration `users.profile_id`/`diagnosed_at` + backfill (Task 1 ✓); novo `POST /api/diagnostico` session-based que checa erro (Task 3 ✓); correção do bug em `/api/quiz` (Task 4 ✓); bloco de boas-vindas + diagnóstico inline no `/feed` (Task 5 ✓); pós-compra → `/feed` sem token-dashboard (Task 6 ✓, via auto-login — refino do "magic link" do spec, justificado: não depende do Brevo, que está quebrado). `/dashboard/[token]` **não** é deletado aqui (é SP2) — coerente com o spec.
- **Placeholders:** nenhum; todo passo traz código/comando concreto.
- **Consistência de tipos:** `parseTriagemAnswers(raw): TriagemAnswer[]|null`, `scoreTriagem(QUIZ_TRIAGEM, answers): ProfileId`, `resolveUserBySessionId: {userId,email}|null`, cookie `mc_session` — nomes batem entre tasks e com o código existente lido.
- **Refino documentado:** `users.profile_id` sem FK (Global Constraints) e auto-login em vez de magic link (Task 6) — ambos justificados; decisão do plano dentro da intenção do spec ("sem loop / casa é a plataforma").
