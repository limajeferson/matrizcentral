# Fórum (MVP) — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use `- [ ]`.

**Goal:** `/forum` (lista de tópicos, prévia p/ todos) + `/forum/[id]` (thread), com criação de tópicos/respostas gated a passe ativo (Regular/Advanced).

**Architecture:** Lógica pura (`forum.ts`: `isSubscriber` + validações) testada; camada de dados (`forum-data.ts`); rotas de escrita protegidas (sessão + passe + validação); páginas server component + forms client; enforcement via `resolveAccess`/`ContentGate`.

**Tech Stack:** Next 14 (App Router, route handlers), Supabase (service_role), Tailwind, Vitest.

## Global Constraints
- Custo zero. pt-BR. Gate: `tsc` 0 + `npm run test`. `npm run build` falha sem STRIPE_SECRET_KEY (pré-existente).
- Escrita SEMPRE valida sessão + passe + input server-side. **Sem XP no MVP** (anti-farming).
- Migration aditiva, default-deny RLS.

## File Structure
**Criar:** `supabase/migrations/0020_forum.sql`; `src/lib/forum.ts`(+test); `src/lib/forum-data.ts`; `src/app/api/forum/topic/route.ts`; `src/app/api/forum/reply/route.ts`; `src/app/forum/page.tsx`; `src/app/forum/[id]/page.tsx`; `src/components/forum/NovoTopicoForm.tsx`; `src/components/forum/ResponderForm.tsx`.
**Modificar:** `src/types/index.ts` (2 tabelas); `src/components/marketing/v2/LandingHeader.tsx` (link); `src/app/conta/page.tsx` (link).

---

## Task 1: Migration `0020_forum.sql` + tipos

**Files:** Create `supabase/migrations/0020_forum.sql`; Modify `src/types/index.ts`.

- [ ] **Step 1: migration** — Create `supabase/migrations/0020_forum.sql`:
```sql
create table if not exists forum_topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists forum_topics_created_idx on forum_topics(created_at desc);

create table if not exists forum_replies (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references forum_topics(id),
  user_id uuid not null references users(id),
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists forum_replies_topic_idx on forum_replies(topic_id, created_at);

alter table forum_topics enable row level security;
alter table forum_replies enable row level security;
```

- [ ] **Step 2: tipos** — em `src/types/index.ts`, após `sent_emails`, adicionar:
```ts
      forum_topics: {
        Row: { id: string; user_id: string; title: string; body: string; created_at: string };
        Insert: { id?: string; user_id: string; title: string; body: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["forum_topics"]["Insert"]>;
        Relationships: [];
      };
      forum_replies: {
        Row: { id: string; topic_id: string; user_id: string; body: string; created_at: string };
        Insert: { id?: string; topic_id: string; user_id: string; body: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["forum_replies"]["Insert"]>;
        Relationships: [];
      };
```

- [ ] **Step 3:** `npx tsc --noEmit` → exit 0.
- [ ] **Step 4:** aplicar no Supabase remoto via SQL Editor. *(Controller conduz.)*
- [ ] **Step 5: commit** — `git add supabase/migrations/0020_forum.sql src/types/index.ts && git commit -m "feat(forum): tabelas forum_topics e forum_replies + tipos"`

---

## Task 2: `forum.ts` — lógica pura (TDD)

**Files:** Create `src/lib/forum.ts`, `src/lib/forum.test.ts`.

- [ ] **Step 1: testes** — Create `src/lib/forum.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { isSubscriber, validateTopicInput, validateReplyInput } from "./forum";

describe("isSubscriber", () => {
  it("view → false", () => expect(isSubscriber("view")).toBe(false));
  it("regular → true", () => expect(isSubscriber("regular")).toBe(true));
  it("advanced → true", () => expect(isSubscriber("advanced")).toBe(true));
});

describe("validateTopicInput", () => {
  it("título curto → erro", () => expect(validateTopicInput({ title: "ab", body: "x" }).ok).toBe(false));
  it("body vazio → erro", () => expect(validateTopicInput({ title: "abc", body: "  " }).ok).toBe(false));
  it("válido → ok", () => expect(validateTopicInput({ title: "Meu tópico", body: "conteúdo" }).ok).toBe(true));
  it("título longo → erro", () => expect(validateTopicInput({ title: "a".repeat(121), body: "x" }).ok).toBe(false));
});

describe("validateReplyInput", () => {
  it("vazio → erro", () => expect(validateReplyInput({ body: "" }).ok).toBe(false));
  it("válido → ok", () => expect(validateReplyInput({ body: "resposta" }).ok).toBe(true));
});
```

- [ ] **Step 2:** `npm run test -- forum` → FAIL.
- [ ] **Step 3: implementar** — Create `src/lib/forum.ts`:
```ts
import type { AccessLevel } from "@/lib/entitlements";

export function isSubscriber(access: AccessLevel): boolean {
  return access === "regular" || access === "advanced";
}

export type ValidationResult = { ok: true } | { ok: false; error: string };

export function validateTopicInput(input: { title?: unknown; body?: unknown }): ValidationResult {
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const body = typeof input.body === "string" ? input.body.trim() : "";
  if (title.length < 3) return { ok: false, error: "O título precisa ter ao menos 3 caracteres." };
  if (title.length > 120) return { ok: false, error: "O título pode ter no máximo 120 caracteres." };
  if (body.length < 1) return { ok: false, error: "Escreva o conteúdo do tópico." };
  if (body.length > 5000) return { ok: false, error: "O conteúdo pode ter no máximo 5000 caracteres." };
  return { ok: true };
}

export function validateReplyInput(input: { body?: unknown }): ValidationResult {
  const body = typeof input.body === "string" ? input.body.trim() : "";
  if (body.length < 1) return { ok: false, error: "Escreva sua resposta." };
  if (body.length > 5000) return { ok: false, error: "A resposta pode ter no máximo 5000 caracteres." };
  return { ok: true };
}
```

- [ ] **Step 4:** `npm run test -- forum` → PASS.
- [ ] **Step 5: commit** — `git add src/lib/forum.ts src/lib/forum.test.ts && git commit -m "feat(forum): logica pura isSubscriber + validacoes"`

---

## Task 3: `forum-data.ts` — camada de dados

**Files:** Create `src/lib/forum-data.ts`.

- [ ] **Step 1: implementar** — Create `src/lib/forum-data.ts`:
```ts
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type TopicListItem = { id: string; title: string; author: string; created_at: string; replyCount: number };

export async function listTopics(limit = 50): Promise<TopicListItem[]> {
  const supabase = getSupabaseServerClient();
  const { data: topics } = await supabase
    .from("forum_topics").select("id, title, user_id, created_at")
    .order("created_at", { ascending: false }).limit(limit);
  const rows = topics ?? [];
  if (rows.length === 0) return [];
  const userIds = Array.from(new Set(rows.map((t) => t.user_id)));
  const { data: users } = await supabase.from("users").select("id, display_name").in("id", userIds);
  const nameById = new Map((users ?? []).map((u) => [u.id, u.display_name ?? "Aluno"]));
  const topicIds = rows.map((t) => t.id);
  const { data: replies } = await supabase.from("forum_replies").select("topic_id").in("topic_id", topicIds);
  const counts = new Map<string, number>();
  for (const r of replies ?? []) counts.set(r.topic_id, (counts.get(r.topic_id) ?? 0) + 1);
  return rows.map((t) => ({
    id: t.id, title: t.title, author: nameById.get(t.user_id) ?? "Aluno",
    created_at: t.created_at, replyCount: counts.get(t.id) ?? 0,
  }));
}

export type TopicDetail = {
  id: string; title: string; body: string; author: string; created_at: string;
  replies: { id: string; body: string; author: string; created_at: string }[];
};

export async function getTopicWithReplies(topicId: string): Promise<TopicDetail | null> {
  const supabase = getSupabaseServerClient();
  const { data: topic } = await supabase
    .from("forum_topics").select("id, title, body, user_id, created_at").eq("id", topicId).maybeSingle();
  if (!topic) return null;
  const { data: replies } = await supabase
    .from("forum_replies").select("id, body, user_id, created_at").eq("topic_id", topicId)
    .order("created_at", { ascending: true });
  const userIds = Array.from(new Set([topic.user_id, ...(replies ?? []).map((r) => r.user_id)]));
  const { data: users } = await supabase.from("users").select("id, display_name").in("id", userIds);
  const nameById = new Map((users ?? []).map((u) => [u.id, u.display_name ?? "Aluno"]));
  return {
    id: topic.id, title: topic.title, body: topic.body,
    author: nameById.get(topic.user_id) ?? "Aluno", created_at: topic.created_at,
    replies: (replies ?? []).map((r) => ({
      id: r.id, body: r.body, author: nameById.get(r.user_id) ?? "Aluno", created_at: r.created_at,
    })),
  };
}

export async function createTopic(userId: string, title: string, body: string): Promise<string | null> {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase.from("forum_topics")
    .insert({ user_id: userId, title: title.trim(), body: body.trim() }).select("id").single();
  return data?.id ?? null;
}

export async function createReply(userId: string, topicId: string, body: string): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("forum_replies")
    .insert({ user_id: userId, topic_id: topicId, body: body.trim() });
  return !error;
}
```

- [ ] **Step 2:** `npx tsc --noEmit` → exit 0.
- [ ] **Step 3: commit** — `git add src/lib/forum-data.ts && git commit -m "feat(forum): camada de dados (listar/ler/criar topico e resposta)"`

---

## Task 4: rotas de escrita

**Files:** Create `src/app/api/forum/topic/route.ts`, `src/app/api/forum/reply/route.ts`.

- [ ] **Step 1: topic** — Create `src/app/api/forum/topic/route.ts`:
```ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-session";
import { getAccessContext } from "@/lib/entitlement-access";
import { isSubscriber, validateTopicInput } from "@/lib/forum";
import { createTopic } from "@/lib/forum-data";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  const { access } = await getAccessContext(user.id);
  if (!isSubscriber(access)) return NextResponse.json({ error: "é preciso um passe ativo" }, { status: 403 });
  const body = await req.json().catch(() => null);
  const v = validateTopicInput({ title: body?.title, body: body?.body });
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });
  const id = await createTopic(user.id, body.title, body.body);
  if (!id) return NextResponse.json({ error: "não foi possível criar o tópico" }, { status: 500 });
  return NextResponse.json({ id });
}
```

- [ ] **Step 2: reply** — Create `src/app/api/forum/reply/route.ts`:
```ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-session";
import { getAccessContext } from "@/lib/entitlement-access";
import { isSubscriber, validateReplyInput } from "@/lib/forum";
import { createReply } from "@/lib/forum-data";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  const { access } = await getAccessContext(user.id);
  if (!isSubscriber(access)) return NextResponse.json({ error: "é preciso um passe ativo" }, { status: 403 });
  const body = await req.json().catch(() => null);
  const topicId = body?.topicId;
  if (!topicId || typeof topicId !== "string") return NextResponse.json({ error: "tópico inválido" }, { status: 400 });
  const v = validateReplyInput({ body: body?.body });
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });
  const ok = await createReply(user.id, topicId, body.body);
  if (!ok) return NextResponse.json({ error: "não foi possível responder" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3:** `npx tsc --noEmit` → exit 0.
- [ ] **Step 4: commit** — `git add "src/app/api/forum/topic/route.ts" "src/app/api/forum/reply/route.ts" && git commit -m "feat(forum): rotas de criar topico e responder (sessao+passe gated)"`

---

## Task 5: páginas + forms

**Files:** Create `src/app/forum/page.tsx`, `src/app/forum/[id]/page.tsx`, `src/components/forum/NovoTopicoForm.tsx`, `src/components/forum/ResponderForm.tsx`.

- [ ] **Step 1: forms (client)** — Create `src/components/forum/NovoTopicoForm.tsx`:
```tsx
"use client";
import { useState } from "react";

export default function NovoTopicoForm() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const res = await fetch("/api/forum/topic", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body }),
    });
    if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? "Erro ao criar."); setLoading(false); return; }
    const { id } = await res.json();
    window.location.href = `/forum/${id}`;
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título do tópico"
        className="w-full rounded-lg border px-3 py-2" />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="O que você quer discutir?"
        rows={4} className="w-full rounded-lg border px-3 py-2" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading}
        className="rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white disabled:opacity-60">
        {loading ? "Publicando..." : "Publicar tópico"}
      </button>
    </form>
  );
}
```
Create `src/components/forum/ResponderForm.tsx`:
```tsx
"use client";
import { useState } from "react";

export default function ResponderForm({ topicId }: { topicId: string }) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const res = await fetch("/api/forum/reply", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicId, body }),
    });
    if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? "Erro ao responder."); setLoading(false); return; }
    window.location.reload();
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Sua resposta"
        rows={3} className="w-full rounded-lg border px-3 py-2" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading}
        className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
        {loading ? "Enviando..." : "Responder"}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: /forum** — Create `src/app/forum/page.tsx`:
```tsx
import { getSessionUser } from "@/lib/auth-session";
import { getAccessContext } from "@/lib/entitlement-access";
import { listTopics } from "@/lib/forum-data";
import { isSubscriber } from "@/lib/forum";
import ContentGate from "@/components/auth/ContentGate";
import NovoTopicoForm from "@/components/forum/NovoTopicoForm";

export default async function ForumPage() {
  const user = await getSessionUser();
  const access = user ? (await getAccessContext(user.id)).access : "view";
  const sub = isSubscriber(access);
  const topics = await listTopics(50);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Fórum</h1>

      {sub ? <NovoTopicoForm /> : <ContentGate title="Fórum da comunidade" nextPath="/forum" />}

      <ul className="space-y-2">
        {topics.map((t) => (
          <li key={t.id} className="rounded-xl border border-zinc-200 bg-white p-4">
            {sub ? (
              <a href={`/forum/${t.id}`} className="font-semibold text-zinc-900 hover:text-violet-600">{t.title}</a>
            ) : (
              <span className="font-semibold text-zinc-900">{t.title}</span>
            )}
            <p className="mt-1 text-xs text-zinc-500">por {t.author} · {t.replyCount} resposta(s)</p>
          </li>
        ))}
        {topics.length === 0 && <p className="text-sm text-zinc-500">Ainda não há tópicos. {sub ? "Crie o primeiro!" : ""}</p>}
      </ul>
    </div>
  );
}
```

- [ ] **Step 3: /forum/[id]** — Create `src/app/forum/[id]/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth-session";
import { getAccessContext } from "@/lib/entitlement-access";
import { getTopicWithReplies } from "@/lib/forum-data";
import { isSubscriber } from "@/lib/forum";
import ContentGate from "@/components/auth/ContentGate";
import ResponderForm from "@/components/forum/ResponderForm";

export default async function TopicPage({ params }: { params: { id: string } }) {
  const topic = await getTopicWithReplies(params.id);
  if (!topic) notFound();

  const user = await getSessionUser();
  const access = user ? (await getAccessContext(user.id)).access : "view";

  if (!isSubscriber(access)) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 p-6">
        <h1 className="text-xl font-bold">{topic.title}</h1>
        <ContentGate title="Leia e participe do fórum" nextPath={`/forum/${topic.id}`} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <article className="rounded-xl border border-zinc-200 bg-white p-4">
        <h1 className="text-xl font-bold text-zinc-900">{topic.title}</h1>
        <p className="mt-1 text-xs text-zinc-500">por {topic.author}</p>
        <p className="mt-3 whitespace-pre-wrap text-zinc-700">{topic.body}</p>
      </article>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Respostas</h2>
        {topic.replies.map((r) => (
          <div key={r.id} className="rounded-lg border border-zinc-200 bg-white/60 p-3">
            <p className="text-xs text-zinc-500">{r.author}</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-700">{r.body}</p>
          </div>
        ))}
        {topic.replies.length === 0 && <p className="text-sm text-zinc-500">Seja o primeiro a responder.</p>}
      </section>

      <ResponderForm topicId={topic.id} />
    </div>
  );
}
```

- [ ] **Step 4:** `npx tsc --noEmit` → exit 0.
- [ ] **Step 5: verificar no navegador** — `/forum` e `/forum/[id]` nos estados (deslogado/view → gate; subscriber → criar tópico + responder). *(Controller conduz.)*
- [ ] **Step 6: commit** — `git add "src/app/forum" "src/components/forum" && git commit -m "feat(forum): paginas /forum e /forum/[id] + forms (gated a passe)"`

---

## Task 6: links de navegação

**Files:** Modify `src/components/marketing/v2/LandingHeader.tsx`, `src/app/conta/page.tsx`.

- [ ] **Step 1:** adicionar `{ href: "/forum", label: "Fórum" }` ao array `LINKS` do `LandingHeader` (anônimo alcança). Adicionar um link "Ver o fórum" no `/conta` (junto do link "Ver o feed"), estilo consistente.
- [ ] **Step 2:** `npx tsc --noEmit` → exit 0.
- [ ] **Step 3: commit** — `git commit -am "feat(forum): links para /forum no header e na conta"`

---

## Task 7: verificação + continuidade

- [ ] **Step 1: gate** — `npx tsc --noEmit && npm run test` (inclui `forum`).
- [ ] **Step 2: E2E navegador** — estados de `/forum` + criar tópico/responder como subscriber (com entitlement de teste via SQL).
- [ ] **Step 3: continuidade** — atualizar `docs/frentes/forum/README.md`, `docs/ESTADO-ATUAL.md`, `docs/ROADMAP-EXECUCAO.md` (Frente 4 ✅).
- [ ] **Step 4: commit** — `git add docs/ && git commit -m "docs(forum): Frente 4 concluida"`

## Notas de execução
- Migration 0020 aplicar no SQL Editor (controller).
- Enforcement de escrita é server-side (rotas) — os forms client são só UX; a autoridade é a rota (sessão+passe+validação).
