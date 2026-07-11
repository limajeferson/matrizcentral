# Login Real (magic link próprio) — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar um login por magic link (passwordless, construído em casa, zero dependência nova) que convive com o token atual e dá identidade persistente ao usuário.

**Architecture:** Portaria caseira. Um segredo aleatório de 256 bits é gerado com o `crypto` nativo do Node, guardado no banco **como hash SHA-256** (nunca cru). O magic link (uso único, 15 min) vira uma sessão opaca (cookie `httpOnly` `mc_session`, 30 dias) validada por lookup do hash na tabela `sessions`. Um "porteiro" server-side (`getSessionUser()`) lê o cookie e resolve o usuário. Tudo server-side com `service_role`, seguindo o padrão de route handlers já existente (`api/newsletter`). O token de compra atual não é tocado.

**Tech Stack:** Next.js 14 (App Router, route handlers), `@supabase/supabase-js` (`service_role`), `crypto` nativo, Brevo (e-mail, via `src/lib/email.ts`), Vitest (node env), Tailwind (páginas app).

## Global Constraints

- **Custo zero:** proibido adicionar dependência npm nova; usar só `crypto` nativo e libs já instaladas. (CLAUDE.md)
- **Comunicação em português do Brasil** em toda copy visível.
- **Gate de verificação:** `npx tsc --noEmit` (exit 0) + `npm run test` (verde). `npm run build` falha de propósito sem `STRIPE_SECRET_KEY` (pré-existente, não é regressão). Visual: `npm run dev -- -p 3000` no navegador.
- **Vitest roda em `environment: "node"`** → só lógica pura em `src/lib` tem teste automático. Código com I/O (Supabase, cookies, fetch) é verificado rodando o app.
- **Páginas app** (`/entrar`, `/conta`) usam **Tailwind** (como o `/dashboard`). Páginas de marketing usam CSS próprio.
- **Identidade fica só na tabela `users`** já existente (achada por e-mail). Sem `auth.users`, sem `auth.uid()`.
- **Janelas fixas:** magic link 15 min · sessão 30 dias · rate-limit 60 s por usuário. Cookie: `mc_session`, `httpOnly`+`secure`(prod)+`sameSite=lax`+`path=/`.
- **Windows/Git Bash:** caminhos com `(marketing)` precisam de aspas. Dev server: forçar porta com `npm run dev -- -p 3000`.

---

## File Structure

**Criar:**
- `supabase/migrations/0015_login_magic_link.sql` — tabelas `magic_links` e `sessions`.
- `src/lib/auth-tokens.ts` (+ `.test.ts`) — lógica pura: gerar/hash/comparar segredo, janelas de expiração.
- `src/lib/safe-redirect.ts` (+ `.test.ts`) — validação do `next` (anti open-redirect).
- `src/lib/auth-session.ts` — camada de dados server-side (magic link, sessão, porteiro).
- `src/app/api/auth/request-link/route.ts` — pede o magic link.
- `src/app/entrar/verificar/route.ts` — callback do clique no e-mail; seta o cookie.
- `src/app/api/auth/logout/route.ts` — encerra a sessão.
- `src/app/entrar/page.tsx` (server) + `src/app/entrar/EntrarForm.tsx` (client) — tela de entrar.
- `src/app/conta/page.tsx` (server) — lar do aluno logado.
- `src/components/auth/LogoutButton.tsx` (client) — botão sair.
- `src/components/auth/SessionNav.tsx` (server) — link Entrar/Minha conta do header.
- `src/components/auth/ContentGate.tsx` (client) — a tranca de preview.

**Modificar:**
- `src/types/index.ts` — adicionar `magic_links` e `sessions` ao tipo `Database`.
- `src/lib/email.ts` — adicionar `sendMagicLinkEmail`.
- `src/components/marketing/v2/LandingHeader.tsx` — prop opcional `accountSlot`.
- `src/app/(marketing)/page.tsx` — passar `<SessionNav />` como `accountSlot`.
- `src/app/(marketing)/landing-v2.css` — regra `.mc-header-actions`/`.mc-session-nav`.
- `docs/ESTADO-ATUAL.md` e `docs/frentes/login-real/README.md` — ao final.

---

## Task 1: Migration + tipos (fundação de dados)

**Files:**
- Create: `supabase/migrations/0015_login_magic_link.sql`
- Modify: `src/types/index.ts` (adicionar 2 tabelas ao `Database["public"]["Tables"]`)

**Interfaces:**
- Produces: tabelas `magic_links` (`id, user_id, token_hash, expires_at, used_at, created_at`) e `sessions` (`id, user_id, token_hash, expires_at, last_seen_at, created_at`); e os tipos `Database["public"]["Tables"]["magic_links"]` e `["sessions"]` consumidos pela camada de dados.

- [ ] **Step 1: Escrever a migration**

Create `supabase/migrations/0015_login_magic_link.sql`:

```sql
-- Login real: magic link próprio (portaria caseira). Aditivo — não toca users.
create table if not exists magic_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  token_hash text not null,          -- SHA-256 do segredo; nunca o cru
  expires_at timestamptz not null,   -- criado_em + 15 min
  used_at timestamptz,               -- nulo até o clique; uso único
  created_at timestamptz not null default now()
);
create index if not exists magic_links_token_hash_idx on magic_links(token_hash);
create index if not exists magic_links_user_id_idx on magic_links(user_id);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  token_hash text not null,          -- SHA-256 da carteirinha; nunca a crua
  expires_at timestamptz not null,   -- criado_em + 30 dias
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists sessions_token_hash_idx on sessions(token_hash);

alter table magic_links enable row level security;
alter table sessions enable row level security;
-- Default-deny (mesmo padrão do 0001): todo acesso via service_role server-side.
```

- [ ] **Step 2: Adicionar os tipos**

Modify `src/types/index.ts` — dentro de `Database["public"]["Tables"]`, após o bloco `challenge_claims`, adicionar:

```ts
      magic_links: {
        Row: {
          id: string;
          user_id: string;
          token_hash: string;
          expires_at: string;
          used_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token_hash: string;
          expires_at: string;
          used_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["magic_links"]["Insert"]>;
        Relationships: [];
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          token_hash: string;
          expires_at: string;
          last_seen_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token_hash: string;
          expires_at: string;
          last_seen_at?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["sessions"]["Insert"]>;
        Relationships: [];
      };
```

- [ ] **Step 3: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: exit 0 (sem novos erros).

- [ ] **Step 4: Aplicar a migration no Supabase remoto**

Run: `npx supabase db push`
Expected: aplica `0015_login_magic_link.sql`. (Se pedir confirmação, aceitar.) Alternativa: aplicar o SQL do Step 1 via painel do Supabase.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/0015_login_magic_link.sql src/types/index.ts
git commit -m "feat(login): tabelas magic_links e sessions + tipos"
```

---

## Task 2: `auth-tokens.ts` — lógica pura de segredo e expiração (TDD)

**Files:**
- Create: `src/lib/auth-tokens.ts`
- Test: `src/lib/auth-tokens.test.ts`

**Interfaces:**
- Produces:
  - `generateAuthSecret(): string` — 256 bits em base64url (43 chars).
  - `hashAuthSecret(secret: string): string` — SHA-256 hex (64 chars).
  - `safeCompareHash(a: string, b: string): boolean` — timing-safe, guarda de comprimento.
  - `magicLinkExpiry(from?: Date): Date` — `from + 15 min`.
  - `sessionExpiry(from?: Date): Date` — `from + 30 dias`.
  - `isExpired(at: string | Date, now?: Date): boolean`.
  - `REQUEST_LINK_THROTTLE_MS: number` — 60000.

- [ ] **Step 1: Escrever os testes que falham**

Create `src/lib/auth-tokens.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  generateAuthSecret,
  hashAuthSecret,
  safeCompareHash,
  magicLinkExpiry,
  sessionExpiry,
  isExpired,
} from "./auth-tokens";

describe("generateAuthSecret", () => {
  it("gera base64url de 43 chars", () => {
    expect(generateAuthSecret()).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });
  it("gera valores únicos", () => {
    const set = new Set(Array.from({ length: 200 }, () => generateAuthSecret()));
    expect(set.size).toBe(200);
  });
});

describe("hashAuthSecret", () => {
  it("é determinístico e hex de 64 chars", () => {
    const h = hashAuthSecret("abc");
    expect(h).toBe(hashAuthSecret("abc"));
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });
  it("muda com input diferente", () => {
    expect(hashAuthSecret("abc")).not.toBe(hashAuthSecret("abd"));
  });
});

describe("safeCompareHash", () => {
  it("true para iguais", () => {
    const h = hashAuthSecret("x");
    expect(safeCompareHash(h, h)).toBe(true);
  });
  it("false para diferentes de mesmo comprimento", () => {
    expect(safeCompareHash(hashAuthSecret("x"), hashAuthSecret("y"))).toBe(false);
  });
  it("false, sem lançar, para comprimentos diferentes", () => {
    expect(safeCompareHash("abc", "abcd")).toBe(false);
  });
});

describe("expiração", () => {
  const base = new Date("2026-01-01T00:00:00.000Z");
  it("magicLinkExpiry = base + 15 min", () => {
    expect(magicLinkExpiry(base).toISOString()).toBe("2026-01-01T00:15:00.000Z");
  });
  it("sessionExpiry = base + 30 dias", () => {
    expect(sessionExpiry(base).toISOString()).toBe("2026-01-31T00:00:00.000Z");
  });
});

describe("isExpired", () => {
  const now = new Date("2026-01-01T00:00:00.000Z");
  it("true no passado", () => {
    expect(isExpired("2025-12-31T23:59:59.000Z", now)).toBe(true);
  });
  it("false no futuro", () => {
    expect(isExpired("2026-01-01T00:00:01.000Z", now)).toBe(false);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm run test -- auth-tokens`
Expected: FAIL ("Cannot find module './auth-tokens'").

- [ ] **Step 3: Implementar**

Create `src/lib/auth-tokens.ts`:

```ts
import { randomBytes, createHash, timingSafeEqual } from "crypto";

const MAGIC_LINK_TTL_MS = 15 * 60 * 1000; // 15 minutos
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias
export const REQUEST_LINK_THROTTLE_MS = 60 * 1000; // 1 pedido/min por usuário

/** Segredo aleatório de 256 bits (base64url, URL-safe). Cartão e carteirinha. */
export function generateAuthSecret(): string {
  return randomBytes(32).toString("base64url");
}

/** SHA-256 hex do segredo. Guardamos SEMPRE o hash, nunca o segredo cru. */
export function hashAuthSecret(secret: string): string {
  return createHash("sha256").update(secret).digest("hex");
}

/** Comparação timing-safe de dois hashes hex (defesa em profundidade). */
export function safeCompareHash(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

export function magicLinkExpiry(from: Date = new Date()): Date {
  return new Date(from.getTime() + MAGIC_LINK_TTL_MS);
}

export function sessionExpiry(from: Date = new Date()): Date {
  return new Date(from.getTime() + SESSION_TTL_MS);
}

export function isExpired(at: string | Date, now: Date = new Date()): boolean {
  const t = typeof at === "string" ? new Date(at) : at;
  return t.getTime() < now.getTime();
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm run test -- auth-tokens`
Expected: PASS (todos os testes).

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth-tokens.ts src/lib/auth-tokens.test.ts
git commit -m "feat(login): auth-tokens (gerar/hash/comparar segredo + expiração)"
```

---

## Task 3: `safe-redirect.ts` — anti open-redirect (TDD)

**Files:**
- Create: `src/lib/safe-redirect.ts`
- Test: `src/lib/safe-redirect.test.ts`

**Interfaces:**
- Produces: `safeNextPath(raw: string | null | undefined, fallback?: string): string` — devolve `raw` se for path interno seguro, senão `fallback` (default `/conta`).

- [ ] **Step 1: Escrever os testes que falham**

Create `src/lib/safe-redirect.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { safeNextPath } from "./safe-redirect";

describe("safeNextPath", () => {
  it("aceita path interno", () => {
    expect(safeNextPath("/conta")).toBe("/conta");
    expect(safeNextPath("/dashboard/ABC123")).toBe("/dashboard/ABC123");
  });
  it("usa fallback para nulo/vazio", () => {
    expect(safeNextPath(null)).toBe("/conta");
    expect(safeNextPath(undefined)).toBe("/conta");
    expect(safeNextPath("")).toBe("/conta");
  });
  it("rejeita destino externo", () => {
    expect(safeNextPath("https://evil.com")).toBe("/conta");
    expect(safeNextPath("//evil.com")).toBe("/conta");
    expect(safeNextPath("/\\evil.com")).toBe("/conta");
  });
  it("respeita fallback custom", () => {
    expect(safeNextPath(null, "/entrar")).toBe("/entrar");
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm run test -- safe-redirect`
Expected: FAIL ("Cannot find module './safe-redirect'").

- [ ] **Step 3: Implementar**

Create `src/lib/safe-redirect.ts`:

```ts
/**
 * Valida o parâmetro `next` (destino pós-login) contra open redirect.
 * Só aceita caminhos internos absolutos ("/algo"); rejeita URLs externas e
 * protocol-relative ("//host", "/\\host").
 */
export function safeNextPath(
  raw: string | null | undefined,
  fallback = "/conta"
): string {
  if (!raw) return fallback;
  if (!raw.startsWith("/")) return fallback;
  if (raw.startsWith("//")) return fallback;
  if (raw.startsWith("/\\")) return fallback;
  return raw;
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm run test -- safe-redirect`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/safe-redirect.ts src/lib/safe-redirect.test.ts
git commit -m "feat(login): safe-redirect (anti open-redirect no next)"
```

---

## Task 4: `sendMagicLinkEmail` no `email.ts`

**Files:**
- Modify: `src/lib/email.ts` (adicionar função ao final)

**Interfaces:**
- Consumes: padrão Brevo já usado em `sendTokenEmail`.
- Produces: `sendMagicLinkEmail(params: { to: string; secret: string }): Promise<void>` — envia o link `${NEXT_PUBLIC_URL}/entrar/verificar?c=<secret>`.

- [ ] **Step 1: Adicionar a função**

Modify `src/lib/email.ts` — acrescentar ao final do arquivo:

```ts
export async function sendMagicLinkEmail(params: {
  to: string;
  secret: string;
}): Promise<void> {
  const loginUrl = `${process.env.NEXT_PUBLIC_URL}/entrar/verificar?c=${params.secret}`;

  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY!,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: "Matriz Central", email: "contato@matrizcentral.com.br" },
      to: [{ email: params.to }],
      subject: "Seu link de acesso à Matriz Central 🔑",
      htmlContent: `
        <p>Recebemos um pedido para entrar na sua conta.</p>
        <p>Clique no link abaixo para acessar (válido por 15 minutos, uso único):</p>
        <p><a href="${loginUrl}">${loginUrl}</a></p>
        <p>Se não foi você, pode ignorar este e-mail.</p>
      `,
    }),
  });

  if (!response.ok) {
    const responseBody = await response.text();
    throw new Error(`Falha ao enviar magic link via Brevo: ${response.status} ${responseBody}`);
  }
}
```

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/lib/email.ts
git commit -m "feat(login): e-mail do magic link (Brevo)"
```

---

## Task 5: `auth-session.ts` — camada de dados (magic link + sessão + porteiro)

**Files:**
- Create: `src/lib/auth-session.ts`

**Interfaces:**
- Consumes: `auth-tokens.ts` (Task 2), `sendMagicLinkEmail` (Task 4), `getSupabaseServerClient`, `cookies` de `next/headers`.
- Produces:
  - `SESSION_COOKIE = "mc_session"`, `SESSION_MAX_AGE_SECONDS = 2592000`.
  - `type SessionUser = { id: string; email: string }`.
  - `requestMagicLink(email: string): Promise<"sent" | "no-account">`.
  - `verifyMagicLink(rawSecret: string): Promise<SessionUser | null>`.
  - `createSession(userId: string): Promise<string>` (retorna o segredo cru p/ cookie).
  - `getSessionUser(): Promise<SessionUser | null>` (o porteiro; só lê o cookie).
  - `revokeCurrentSession(): Promise<void>` (apaga a sessão do cookie atual).

> **Nota de projeto:** `getSessionUser` apenas LÊ o cookie (seguro em Server Component). Quem SETA/limpa o cookie são os route handlers das Tasks 6–8. `last_seen_at` fica fixo na criação (sem renovação deslizante no v1 — simplificação consciente; a coluna existe para uso futuro).

- [ ] **Step 1: Implementar o módulo**

Create `src/lib/auth-session.ts`:

```ts
import { cookies } from "next/headers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { sendMagicLinkEmail } from "@/lib/email";
import {
  generateAuthSecret,
  hashAuthSecret,
  safeCompareHash,
  magicLinkExpiry,
  sessionExpiry,
  isExpired,
  REQUEST_LINK_THROTTLE_MS,
} from "@/lib/auth-tokens";

export const SESSION_COOKIE = "mc_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 dias

export type SessionUser = { id: string; email: string };

/** Pede um magic link. Só envia se o e-mail já tem conta (nasce na compra). */
export async function requestMagicLink(
  email: string
): Promise<"sent" | "no-account"> {
  const supabase = getSupabaseServerClient();
  const normalized = email.trim().toLowerCase();

  const { data: user } = await supabase
    .from("users")
    .select("id, email")
    .eq("email", normalized)
    .maybeSingle();
  if (!user) return "no-account";

  // Rate-limit: já existe link recente para este usuário? não reenvia.
  const throttleSince = new Date(Date.now() - REQUEST_LINK_THROTTLE_MS).toISOString();
  const { data: recent } = await supabase
    .from("magic_links")
    .select("id")
    .eq("user_id", user.id)
    .gt("created_at", throttleSince)
    .maybeSingle();
  if (recent) return "sent";

  const secret = generateAuthSecret();
  const { error } = await supabase.from("magic_links").insert({
    user_id: user.id,
    token_hash: hashAuthSecret(secret),
    expires_at: magicLinkExpiry().toISOString(),
  });
  if (error) throw new Error("Falha ao criar magic link");

  await sendMagicLinkEmail({ to: user.email, secret });
  return "sent";
}

/** Valida o cartão do e-mail. Sucesso → marca uso único e devolve o usuário. */
export async function verifyMagicLink(
  rawSecret: string
): Promise<SessionUser | null> {
  const supabase = getSupabaseServerClient();
  const hash = hashAuthSecret(rawSecret);

  const { data: link } = await supabase
    .from("magic_links")
    .select("id, user_id, token_hash, expires_at, used_at")
    .eq("token_hash", hash)
    .maybeSingle();
  if (!link) return null;
  if (!safeCompareHash(link.token_hash, hash)) return null; // defesa em profundidade
  if (link.used_at) return null;
  if (isExpired(link.expires_at)) return null;

  // Uso único com trava condicional (evita corrida de duplo-clique).
  const { data: claimed } = await supabase
    .from("magic_links")
    .update({ used_at: new Date().toISOString() })
    .eq("id", link.id)
    .is("used_at", null)
    .select("id")
    .maybeSingle();
  if (!claimed) return null;

  const { data: user } = await supabase
    .from("users")
    .select("id, email")
    .eq("id", link.user_id)
    .maybeSingle();
  return user ? { id: user.id, email: user.email } : null;
}

/** Cria a sessão no banco. Retorna o segredo cru (vai pro cookie). */
export async function createSession(userId: string): Promise<string> {
  const supabase = getSupabaseServerClient();
  const secret = generateAuthSecret();
  const { error } = await supabase.from("sessions").insert({
    user_id: userId,
    token_hash: hashAuthSecret(secret),
    expires_at: sessionExpiry().toISOString(),
  });
  if (error) throw new Error("Falha ao criar sessão");
  return secret;
}

/** O porteiro: lê o cookie e resolve o usuário logado, ou null. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const raw = cookies().get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  const supabase = getSupabaseServerClient();
  const { data: session } = await supabase
    .from("sessions")
    .select("user_id, expires_at")
    .eq("token_hash", hashAuthSecret(raw))
    .maybeSingle();
  if (!session) return null;
  if (isExpired(session.expires_at)) return null;

  const { data: user } = await supabase
    .from("users")
    .select("id, email")
    .eq("id", session.user_id)
    .maybeSingle();
  return user ? { id: user.id, email: user.email } : null;
}

/** Logout / revogação: apaga a sessão do cookie atual. */
export async function revokeCurrentSession(): Promise<void> {
  const raw = cookies().get(SESSION_COOKIE)?.value;
  if (!raw) return;
  const supabase = getSupabaseServerClient();
  await supabase.from("sessions").delete().eq("token_hash", hashAuthSecret(raw));
}
```

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/lib/auth-session.ts
git commit -m "feat(login): camada de dados (magic link, sessão, porteiro)"
```

---

## Task 6: Rota que pede o magic link + tela `/entrar`

**Files:**
- Create: `src/app/api/auth/request-link/route.ts`
- Create: `src/app/entrar/page.tsx` (server)
- Create: `src/app/entrar/EntrarForm.tsx` (client)

**Interfaces:**
- Consumes: `requestMagicLink` (Task 5), `isValidEmail` de `@/lib/email-validation`.
- Produces: `POST /api/auth/request-link` → `{ status: "sent" | "no-account" }` ou `{ error }` (400).

- [ ] **Step 1: Route handler**

Create `src/app/api/auth/request-link/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { isValidEmail } from "@/lib/email-validation";
import { requestMagicLink } from "@/lib/auth-session";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = body?.email;

  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    return NextResponse.json({ error: "e-mail inválido" }, { status: 400 });
  }

  const status = await requestMagicLink(email);
  return NextResponse.json({ status });
}
```

- [ ] **Step 2: Formulário (client)**

Create `src/app/entrar/EntrarForm.tsx`:

```tsx
"use client";

import { useState } from "react";

type State = "idle" | "loading" | "sent" | "no-account" | "error";

export default function EntrarForm({ initialError = false }: { initialError?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/auth/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        setState("error");
        return;
      }
      const data = await res.json();
      setState(data.status === "no-account" ? "no-account" : "sent");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <p className="rounded-lg bg-green-50 p-4 text-green-800">
        Link enviado! Confira seu e-mail (<strong>{email}</strong>) e clique no
        link para entrar. Ele vale por 15 minutos.
      </p>
    );
  }

  if (state === "no-account") {
    return (
      <div className="rounded-lg bg-amber-50 p-4 text-amber-900">
        <p className="mb-3">Esse e-mail ainda não tem acesso à Matriz Central.</p>
        <a
          href="/oferta"
          className="inline-block rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white"
        >
          Adquirir acesso
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {initialError && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          Link inválido ou expirado. Peça um novo abaixo.
        </p>
      )}
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="seu@email.com"
        className="w-full rounded-lg border px-4 py-2"
      />
      <button
        type="submit"
        disabled={state === "loading"}
        className="w-full rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
      >
        {state === "loading" ? "Enviando..." : "Enviar link de acesso"}
      </button>
      {state === "error" && (
        <p className="text-sm text-red-600">Algo deu errado. Tente novamente.</p>
      )}
    </form>
  );
}
```

- [ ] **Step 3: Página (server, lê `?erro=link`)**

Create `src/app/entrar/page.tsx`:

```tsx
import EntrarForm from "./EntrarForm";

export default function EntrarPage({
  searchParams,
}: {
  searchParams: { erro?: string };
}) {
  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="mb-2 text-2xl font-bold">Entrar na sua conta</h1>
      <p className="mb-6 text-gray-600">
        Digite seu e-mail e enviaremos um link de acesso — sem senha.
      </p>
      <EntrarForm initialError={searchParams.erro === "link"} />
    </div>
  );
}
```

- [ ] **Step 4: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 5: Verificar no navegador**

Run: `npm run dev -- -p 3000`, abrir `http://localhost:3000/entrar`.
Expected: form aparece. Digitar um e-mail que **existe** (que já comprou) → "Link enviado". Digitar um e-mail inexistente → "Esse e-mail ainda não tem acesso" + botão Adquirir. Conferir no e-mail (Brevo) que o link chegou.

- [ ] **Step 6: Commit**

```bash
git add "src/app/api/auth/request-link/route.ts" "src/app/entrar/page.tsx" "src/app/entrar/EntrarForm.tsx"
git commit -m "feat(login): rota request-link + tela /entrar"
```

---

## Task 7: Callback `/entrar/verificar` (seta o cookie de sessão)

**Files:**
- Create: `src/app/entrar/verificar/route.ts`

**Interfaces:**
- Consumes: `verifyMagicLink`, `createSession`, `SESSION_COOKIE`, `SESSION_MAX_AGE_SECONDS` (Task 5), `safeNextPath` (Task 3).
- Produces: `GET /entrar/verificar?c=<secret>&next=<path>` → redireciona (302) com cookie setado, ou para `/entrar?erro=link`.

- [ ] **Step 1: Implementar o callback**

Create `src/app/entrar/verificar/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import {
  verifyMagicLink,
  createSession,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth-session";
import { safeNextPath } from "@/lib/safe-redirect";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("c");
  const next = safeNextPath(req.nextUrl.searchParams.get("next"));

  if (!secret) {
    return NextResponse.redirect(new URL("/entrar?erro=link", req.url));
  }

  const user = await verifyMagicLink(secret);
  if (!user) {
    return NextResponse.redirect(new URL("/entrar?erro=link", req.url));
  }

  const sessionSecret = await createSession(user.id);
  const res = NextResponse.redirect(new URL(next, req.url));
  res.cookies.set(SESSION_COOKIE, sessionSecret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return res;
}
```

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Verificar no navegador (fluxo real)**

Com `npm run dev -- -p 3000`: em `/entrar`, pedir link com um e-mail real que comprou → abrir o e-mail → clicar no link. Expected: a URL vira `/conta` — que **ainda não existe** (nasce na Task 8), então um **404 aqui é esperado**. O que importa nesta task: (a) a URL **NÃO** voltou para `/entrar?erro=link`, e (b) o cookie `mc_session` foi setado (DevTools → Application → Cookies). Clicar de novo no MESMO link → agora vai para `/entrar?erro=link` (uso único funcionando).

- [ ] **Step 4: Commit**

```bash
git add "src/app/entrar/verificar/route.ts"
git commit -m "feat(login): callback /entrar/verificar (cookie de sessão)"
```

---

## Task 8: `/conta` (lar do aluno) + logout

**Files:**
- Create: `src/app/conta/page.tsx` (server)
- Create: `src/components/auth/LogoutButton.tsx` (client)
- Create: `src/app/api/auth/logout/route.ts`

**Interfaces:**
- Consumes: `getSessionUser`, `revokeCurrentSession`, `SESSION_COOKIE` (Task 5), `getSupabaseServerClient`.
- Produces: página `/conta` (redireciona p/ `/entrar` se deslogado); `POST /api/auth/logout` → `{ ok: true }` + limpa cookie.

- [ ] **Step 1: Rota de logout**

Create `src/app/api/auth/logout/route.ts`:

```ts
import { NextResponse } from "next/server";
import { revokeCurrentSession, SESSION_COOKIE } from "@/lib/auth-session";

export async function POST() {
  await revokeCurrentSession();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
```

- [ ] **Step 2: Botão sair (client)**

Create `src/components/auth/LogoutButton.tsx`:

```tsx
"use client";

import { useState } from "react";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <button
      onClick={logout}
      disabled={loading}
      className="text-sm text-gray-500 underline"
    >
      {loading ? "Saindo..." : "Sair"}
    </button>
  );
}
```

- [ ] **Step 3: Página `/conta` (server, protegida)**

Create `src/app/conta/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-session";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function ContaPage() {
  const user = await getSessionUser();
  if (!user) redirect("/entrar");

  // Resolve o token da compra mais recente para o botão "meu painel".
  const supabase = getSupabaseServerClient();
  const { data: purchase } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let dashboardToken: string | null = null;
  if (purchase) {
    const { data: tokenRow } = await supabase
      .from("tokens")
      .select("token")
      .eq("purchase_id", purchase.id)
      .maybeSingle();
    dashboardToken = tokenRow?.token ?? null;
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="mb-1 text-2xl font-bold">Minha conta</h1>
      <p className="mb-6 text-gray-600">Olá, {user.email}</p>

      {dashboardToken ? (
        <a
          href={`/dashboard/${dashboardToken}`}
          className="inline-block rounded-lg bg-violet-600 px-5 py-3 font-semibold text-white"
        >
          Ir para meu painel de conteúdo
        </a>
      ) : (
        <p className="text-gray-500">
          Nenhuma compra encontrada nesta conta ainda.
        </p>
      )}

      <section className="mt-10 rounded-lg border border-dashed p-6 text-gray-500">
        <h2 className="mb-1 font-semibold text-gray-700">Em breve</h2>
        <p>Assinatura, feed e fórum aparecerão aqui nas próximas atualizações.</p>
      </section>

      <div className="mt-10">
        <LogoutButton />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 5: Verificar no navegador**

Com `npm run dev -- -p 3000`: (a) acessar `/conta` deslogado → redireciona para `/entrar`. (b) Fazer o fluxo de login (Task 6→7) → cair em `/conta` com "Olá, {email}" e botão "Ir para meu painel de conteúdo" que abre o `/dashboard/{token}` correto. (c) Clicar "Sair" → volta para `/` e `/conta` volta a redirecionar para `/entrar`.

- [ ] **Step 6: Commit**

```bash
git add "src/app/conta/page.tsx" "src/components/auth/LogoutButton.tsx" "src/app/api/auth/logout/route.ts"
git commit -m "feat(login): /conta (lar do aluno) + logout"
```

---

## Task 9: Botão Entrar/Minha conta no header do marketing

**Files:**
- Create: `src/components/auth/SessionNav.tsx` (server)
- Modify: `src/components/marketing/v2/LandingHeader.tsx` (prop `accountSlot`)
- Modify: `src/app/(marketing)/page.tsx` (passar `<SessionNav />`)
- Modify: `src/app/(marketing)/landing-v2.css` (estilo)

**Interfaces:**
- Consumes: `getSessionUser` (Task 5).
- Produces: `<SessionNav />` — link "Entrar" (`/entrar`) ou "Minha conta" (`/conta`) conforme sessão. `LandingHeader` ganha prop opcional `accountSlot?: React.ReactNode` (os outros 3 usos do header seguem sem passar nada).

- [ ] **Step 1: SessionNav (server component)**

Create `src/components/auth/SessionNav.tsx`:

```tsx
import { getSessionUser } from "@/lib/auth-session";

export default async function SessionNav() {
  const user = await getSessionUser();
  return (
    <a href={user ? "/conta" : "/entrar"} className="mc-session-nav mc-display">
      {user ? "Minha conta" : "Entrar"}
    </a>
  );
}
```

- [ ] **Step 2: LandingHeader aceita `accountSlot`**

Modify `src/components/marketing/v2/LandingHeader.tsx`:

Trocar a assinatura:
```tsx
export default function LandingHeader() {
```
por:
```tsx
export default function LandingHeader({
  accountSlot,
}: {
  accountSlot?: React.ReactNode;
}) {
```

E trocar o bloco do `mc-header-row` (o botão toggle passa a conviver com o slot):
```tsx
          <button
            type="button"
            className="mc-menu-toggle"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className={`mc-menu-line${open ? " open-top" : ""}`} />
            <span className={`mc-menu-line${open ? " open-bottom" : ""}`} />
          </button>
```
por:
```tsx
          <div className="mc-header-actions">
            {accountSlot}
            <button
              type="button"
              className="mc-menu-toggle"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <span className={`mc-menu-line${open ? " open-top" : ""}`} />
              <span className={`mc-menu-line${open ? " open-bottom" : ""}`} />
            </button>
          </div>
```

- [ ] **Step 3: Passar o SessionNav na landing**

Modify `src/app/(marketing)/page.tsx`:

Adicionar o import (junto aos outros imports do topo):
```tsx
import SessionNav from "@/components/auth/SessionNav";
```
E trocar `<LandingHeader />` (linha ~44) por:
```tsx
      <LandingHeader accountSlot={<SessionNav />} />
```

- [ ] **Step 4: Estilo do header**

Modify `src/app/(marketing)/landing-v2.css` — acrescentar ao final:

```css
.mcv2 .mc-header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.mcv2 .mc-session-nav {
  font-size: 0.85rem;
  letter-spacing: 0.02em;
  color: var(--mc-ink, #fff);
  opacity: 0.85;
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 999px;
  padding: 0.35rem 0.9rem;
  transition: opacity 0.2s, border-color 0.2s;
}
.mcv2 .mc-session-nav:hover {
  opacity: 1;
  border-color: var(--mc-accent, #7c5cff);
}
```

> Se o container `.mcv2` não envolver o header nesta página, remova o prefixo `.mcv2 ` das regras acima na verificação visual. Ajustar cor/posição conforme o header real.

- [ ] **Step 5: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 6: Verificar no navegador**

Com `npm run dev -- -p 3000`, abrir `/`: deslogado mostra "Entrar" no header → clica → vai para `/entrar`. Depois de logar, o header mostra "Minha conta" → clica → vai para `/conta`. Conferir que as outras páginas que usam `LandingHeader` (`/sobre`, `/legal/termos`, `/legal/privacidade`) continuam renderizando sem erro.

- [ ] **Step 7: Commit**

```bash
git add "src/components/auth/SessionNav.tsx" "src/components/marketing/v2/LandingHeader.tsx" "src/app/(marketing)/page.tsx" "src/app/(marketing)/landing-v2.css"
git commit -m "feat(login): botão Entrar/Minha conta no header"
```

---

## Task 10: `ContentGate` (a tranca de preview)

**Files:**
- Create: `src/components/auth/ContentGate.tsx` (client)

**Interfaces:**
- Produces: `<ContentGate title?: string; nextPath?: string />` — renderiza o cadeado + dois caminhos: "Adquirir acesso" (`/oferta`) e "Já sou aluno? Entrar" (`/entrar?next=<nextPath>`).

> **Escopo:** esta task entrega o componente reusável. A aplicação dele nas superfícies de marketing (quais conteúdos, onde) é uma frente futura (ver spec, "Fora de escopo"). A verificação é visual, via render temporário.

- [ ] **Step 1: Implementar o componente**

Create `src/components/auth/ContentGate.tsx`:

```tsx
"use client";

export default function ContentGate({
  title,
  nextPath,
}: {
  title?: string;
  nextPath?: string;
}) {
  const entrarHref = nextPath
    ? `/entrar?next=${encodeURIComponent(nextPath)}`
    : "/entrar";

  return (
    <div className="mx-auto max-w-sm rounded-2xl border border-white/10 bg-black/40 p-6 text-center backdrop-blur">
      <div className="mb-3 text-3xl" aria-hidden>
        🔒
      </div>
      {title && <p className="mb-1 font-semibold text-white">{title}</p>}
      <p className="mb-5 text-sm text-white/70">
        Para assistir, entre na sua conta ou adquira o acesso.
      </p>
      <div className="flex flex-col gap-2">
        <a
          href="/oferta"
          className="rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white"
        >
          Adquirir acesso
        </a>
        <a href={entrarHref} className="text-sm text-white/70 underline">
          Já sou aluno? Entrar
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Verificar visualmente (render temporário)**

No `src/app/entrar/page.tsx`, temporariamente adicionar abaixo do `<EntrarForm .../>`:
```tsx
      {/* TEMP: verificação visual do ContentGate — remover após conferir */}
      <div className="mt-10">
        <ContentGate title="Podcast: Rode IA potente localmente" nextPath="/conta" />
      </div>
```
(e o import `import ContentGate from "@/components/auth/ContentGate";`). Rodar `npm run dev -- -p 3000`, abrir `/entrar`. Expected: cadeado + título + "Adquirir acesso" (→ `/oferta`) + "Já sou aluno? Entrar" (→ `/entrar?next=%2Fconta`). Conferir os dois links.

- [ ] **Step 4: Reverter o render temporário**

Remover o bloco TEMP e o import adicionados no Step 3 de `src/app/entrar/page.tsx` (o arquivo volta ao estado da Task 6). Rodar `npx tsc --noEmit` → exit 0.

- [ ] **Step 5: Commit**

```bash
git add "src/components/auth/ContentGate.tsx"
git commit -m "feat(login): componente ContentGate (tranca de preview)"
```

---

## Task 11: Verificação ponta-a-ponta + continuidade

**Files:**
- Modify: `docs/ESTADO-ATUAL.md`, `docs/frentes/login-real/README.md`

- [ ] **Step 1: Gate completo**

Run: `npx tsc --noEmit && npm run test`
Expected: tsc exit 0; testes verdes (incluindo `auth-tokens` e `safe-redirect`).

- [ ] **Step 2: Fluxo E2E no navegador**

Com `npm run dev -- -p 3000`, validar a jornada inteira com um e-mail real que comprou:
1. `/` deslogado → header "Entrar".
2. `/entrar` → pedir link com e-mail existente → "Link enviado".
3. E-mail (Brevo) → clicar no link → cai em `/conta`, "Olá, {email}".
4. `/conta` → "Ir para meu painel" abre o `/dashboard/{token}` certo (conteúdo/XP intactos).
5. Header agora "Minha conta".
6. Reusar o mesmo link do e-mail → `/entrar?erro=link` (uso único).
7. E-mail inexistente em `/entrar` → "não tem acesso" + Adquirir.
8. "Sair" → volta pra `/`; `/conta` redireciona pra `/entrar`.
9. Fluxo de compra antigo (token direto em `/dashboard/{token}`) segue funcionando intacto.

- [ ] **Step 3: Atualizar continuidade**

Em `docs/frentes/login-real/README.md`: status → ✅ concluída; resumir o que foi entregue. Em `docs/ESTADO-ATUAL.md`: mover a Frente 1 para ✅ na tabela, atualizar "Onde paramos AGORA" (próxima frente: Assinaturas), "Estado do git" e adicionar entrada no "Log de sessões". Atualizar `docs/ECOSSISTEMA.md` (lista de frentes: login-real ✅).

- [ ] **Step 4: Commit final**

```bash
git add docs/
git commit -m "docs(login): Frente 1 concluída — atualiza continuidade"
```

---

## Notas de verificação

- **`npm run build` falha** ao coletar `/api/checkout` sem `STRIPE_SECRET_KEY` — pré-existente, não é regressão desta frente. O gate é `tsc` + `test` + navegador.
- **E-mail real:** o fluxo depende do Brevo (`BREVO_API_KEY`) e de `NEXT_PUBLIC_URL` corretos no `.env.local`. Se o e-mail não chegar, conferir essas envs antes de suspeitar do código.
- **Cookie `secure`:** em `localhost` (`NODE_ENV !== "production"`) o cookie não é `secure`, então funciona em http. Em produção vira `secure` automaticamente.
