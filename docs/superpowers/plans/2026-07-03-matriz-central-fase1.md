# Matriz Central — Fase 1: Bootstrap + Fluxo Core do MVP — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar o fluxo ponta a ponta do Produto 1 (LLM Local, R$47): compra via Stripe → e-mail com token (Brevo) → quiz de triagem → cálculo de perfil → dashboard personalizado → quiz de validação → XP mínimo.

**Architecture:** Next.js 14 (App Router) + TypeScript, Supabase (Postgres, sem Auth — token na URL é a credencial, acesso sempre via service role key no servidor), Stripe Checkout + webhook, Brevo para e-mail transacional. Bottom-up: schema → lib → rotas de API → páginas.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, @supabase/supabase-js, stripe (Node SDK), nanoid, Vitest.

## Global Constraints

- Toda a infraestrutura deve caber em tiers gratuitos: Supabase free, Vercel hobby, Brevo free (300 e-mails/dia), Stripe sem mensalidade fixa.
- Sem Supabase Auth. RLS default-deny para a anon key; todo acesso a dados passa por código server-side usando a service role key.
- `tokens.valid_until` = 365 dias (acesso), distinto de `purchases.refund_window_expires` = 30 dias (reembolso).
- `quiz_responses` é uma única tabela com coluna `quiz_type` (`'triagem'|'validacao'`), não duas tabelas.
- Sem tabela `recommended_products` nem `refund_requests` nesta fase (ver spec, seção "Decisões que resolvem inconsistências").
- `src/components/QuizValidacao.tsx` e `src/data/quiz-llm-local.ts` já existem e funcionam — não alterar a lógica interna deles.
- Endpoint único `POST /api/quiz` com discriminador `quizType` para os dois quizzes.
- Especificação completa: `docs/superpowers/specs/2026-07-03-matriz-central-fase1-design.md`.

---

## Task 1: Bootstrap do projeto Next.js

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `postcss.config.js` (gerados pelo `create-next-app`)
- Create: `vitest.config.ts`
- Create: `.env.local`
- Modify: `package.json` (adiciona script `test`)

**Interfaces:**
- Produces: alias de import `@/*` apontando para `src/*`; script `npm run test` rodando Vitest; `npm run dev` servindo em `http://localhost:3000`.

- [ ] **Step 1: Rodar create-next-app na raiz do projeto**

Run:
```bash
cd "C:\Users\jefer\Documents\Projetos\matrizcentral"
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```
Se perguntar sobre arquivos existentes (docs/, arquitetura-1/, arquitetura-2/, content/, notebooklm/, etc.), confirme que quer continuar — são pastas de conteúdo/documentação, não conflitam com os arquivos que o `create-next-app` gera.

Expected: cria `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`.

- [ ] **Step 2: Instalar dependências do projeto**

Run:
```bash
npm install @supabase/supabase-js stripe lucide-react class-variance-authority clsx tailwind-merge nanoid
```
Expected: instala sem erros, `package.json` ganha essas entradas em `dependencies`.

- [ ] **Step 3: Inicializar shadcn/ui**

Run:
```bash
npx shadcn@latest init -d
```
Expected: cria `components.json` e `src/lib/utils.ts` com estilo Default/Slate/CSS variables (flag `-d` aceita os defaults sem prompts interativos).

- [ ] **Step 4: Adicionar componentes shadcn usados nesta fase**

Run:
```bash
npx shadcn@latest add button card badge progress
```
Expected: cria `src/components/ui/button.tsx`, `card.tsx`, `badge.tsx`, `progress.tsx`.

- [ ] **Step 5: Instalar e configurar Vitest**

Run:
```bash
npm install -D vitest @vitejs/plugin-react vite-tsconfig-paths
```

Create `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
  },
});
```

Modify `package.json` — adicione ao bloco `"scripts"`:
```json
"test": "vitest run"
```

Expected: `npm run test` executa (sem testes ainda, sai com "No test files found" — normal nesta etapa).

- [ ] **Step 6: Criar `.env.local` na raiz**

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
BREVO_API_KEY=
NEXT_PUBLIC_URL=http://localhost:3000
```

- [ ] **Step 7: Confirmar que o servidor de dev sobe**

Run: `npm run dev`
Expected: inicia em `http://localhost:3000` sem erros de compilação (pode interromper com Ctrl+C depois de confirmar).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: bootstrap Next.js 14 + Tailwind + shadcn/ui + Vitest"
```

---

## Task 2: Schema Supabase (SQL) + seed de perfis + tipos compartilhados

**Files:**
- Create: `supabase/migrations/0001_init.sql`
- Create: `supabase/migrations/0002_seed_profiles.sql`
- Create: `src/types/index.ts`

**Interfaces:**
- Consumes: nenhuma (primeira peça de dados do projeto)
- Produces: tipo `Database` (usado por `lib/supabase/client.ts` e `server.ts` na Task 3); tabelas `users`, `purchases`, `tokens`, `quiz_responses`, `profiles`, `xp_events` no Postgres do Supabase, com os 6 perfis já semeados.

- [ ] **Step 1: Criar a migration de schema**

Create `supabase/migrations/0001_init.sql`:
```sql
create extension if not exists pgcrypto;

create table if not exists profiles (
  id text primary key,
  name text not null,
  description text not null,
  recommended_ebooks jsonb not null default '[]'::jsonb,
  study_roadmap jsonb not null default '{}'::jsonb
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  stripe_customer_id text,
  total_xp integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  product_id text not null,
  price_cents integer not null,
  status text not null default 'pending',
  stripe_payment_id text unique,
  downloaded boolean not null default false,
  refund_window_expires timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists tokens (
  token text primary key,
  purchase_id uuid not null references purchases(id),
  profile_id text references profiles(id),
  triaged boolean not null default false,
  triaged_at timestamptz,
  valid_until timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists quiz_responses (
  id uuid primary key default gen_random_uuid(),
  token text not null references tokens(token),
  quiz_type text not null check (quiz_type in ('triagem', 'validacao')),
  question_id integer not null,
  answer text not null,
  is_correct boolean,
  created_at timestamptz not null default now()
);

create table if not exists xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  xp_amount integer not null,
  action_type text not null check (action_type in ('compra', 'triagem', 'download', 'validacao')),
  reference_id text,
  created_at timestamptz not null default now()
);

alter table users enable row level security;
alter table purchases enable row level security;
alter table tokens enable row level security;
alter table quiz_responses enable row level security;
alter table profiles enable row level security;
alter table xp_events enable row level security;
-- Default-deny: nenhuma policy é criada para anon/authenticated.
-- Todo acesso passa por código server-side com a service role key,
-- que ignora RLS por design (ver spec, seção "Acesso e segurança").
```

- [ ] **Step 2: Criar a migration de seed dos 6 perfis**

Create `supabase/migrations/0002_seed_profiles.sql`:
```sql
insert into profiles (id, name, description, recommended_ebooks, study_roadmap) values
(
  'dev_python_aia',
  'Dev Python + IA Local',
  'Você é desenvolvedor Python e quer dominar LLMs locais em produção. Seu roadmap é prático e orientado a código.',
  '[
    {"order": 1, "product_id": "ebook_llm_local", "title": "LLM Local: Setup Completo", "status": "already_purchased"},
    {"order": 2, "product_id": "ebook_claude_code_python", "title": "Claude Code: Python Edition", "is_free": true, "unlock_at": "after_quiz"}
  ]'::jsonb,
  '{
    "week_1": {"title": "Fundação: Setup Local", "items": ["Leia cap 1-2 do Ebook LLM Local", "Instale Ollama e teste com seus próprios prompts", "Resultado esperado: rodando LLM localmente"]},
    "week_2": {"title": "Integração: Python + LLM", "items": ["Leia o Ebook Claude Code Python Edition", "Integre em um projeto seu existente", "Resultado esperado: LLM rodando via Python API"]},
    "week_3": {"title": "Conectores Avançados", "items": ["Explore integrações MCP", "Implemente um conector simples", "Resultado esperado: LLM conectado a 1-2 ferramentas"]},
    "week_4": {"title": "Produção", "items": ["Documente seu setup", "Teste em outro ambiente", "Resultado esperado: setup replicável"]}
  }'::jsonb
),
(
  'dev_nodejs_web',
  'Dev JS/TS + Web Apps',
  'Você constrói aplicações web e quer integrar LLMs locais em produtos JavaScript/TypeScript, sem depender de APIs pagas.',
  '[
    {"order": 1, "product_id": "ebook_llm_local", "title": "LLM Local: Setup Completo", "status": "already_purchased"},
    {"order": 2, "product_id": "ebook_mcp_integracoes", "title": "MCP: Integrações Avançadas", "is_free": true, "unlock_at": "after_quiz"}
  ]'::jsonb,
  '{
    "week_1": {"title": "Fundação: Setup Local", "items": ["Leia cap 1-2 do Ebook LLM Local", "Instale Ollama e teste a API HTTP local", "Resultado esperado: LLM respondendo via requisição HTTP"]},
    "week_2": {"title": "Integração: Node/TS + LLM", "items": ["Leia o Ebook MCP: Integrações Avançadas", "Chame o LLM local a partir de uma rota Next.js/Node", "Resultado esperado: endpoint próprio consumindo o LLM local"]},
    "week_3": {"title": "Ferramentas e Protocolo MCP", "items": ["Implemente um servidor MCP simples", "Conecte a um agente de IA", "Resultado esperado: 1 ferramenta MCP funcional"]},
    "week_4": {"title": "Produto", "items": ["Integre no seu app existente", "Documente o setup", "Resultado esperado: feature de IA local rodando no seu produto"]}
  }'::jsonb
),
(
  'devops_infra',
  'DevOps + Infra + Deploy',
  'Você cuida de infraestrutura e deploy e quer colocar LLMs locais em produção de forma confiável, com monitoramento e observabilidade.',
  '[
    {"order": 1, "product_id": "ebook_llm_local", "title": "LLM Local: Setup Completo", "status": "already_purchased"},
    {"order": 2, "product_id": "ebook_llm_servidor", "title": "LLM no Seu Servidor", "is_free": true, "unlock_at": "after_quiz"}
  ]'::jsonb,
  '{
    "week_1": {"title": "Fundação: Setup Local", "items": ["Leia cap 5 do Ebook LLM Local (Performance por Hardware)", "Instale Ollama em um servidor de teste", "Resultado esperado: LLM rodando em servidor, acessível via rede interna"]},
    "week_2": {"title": "Deploy Confiável", "items": ["Leia o Ebook LLM no Seu Servidor", "Containerize o setup (Docker)", "Resultado esperado: setup reproduzível via container"]},
    "week_3": {"title": "Observabilidade", "items": ["Configure logs e métricas básicas de uso", "Teste sob carga simulada", "Resultado esperado: visibilidade de uso e falhas"]},
    "week_4": {"title": "Produção", "items": ["Documente runbook de operação", "Defina plano de rollback", "Resultado esperado: setup pronto para produção"]}
  }'::jsonb
),
(
  'ceo_financeiro',
  'CEO/Gestor Financeiro',
  'Você é líder e quer entender IA para tomar melhores decisões financeiras. Seu roadmap é executivo e orientado a ROI.',
  '[
    {"order": 1, "product_id": "ebook_llm_local", "title": "LLM Local: Setup Completo", "status": "already_purchased", "note": "Foque nos capítulos 0, 1 e 5"},
    {"order": 2, "product_id": "ebook_ceo_ia_financeiro", "title": "CEO + IA: Decisões Financeiras", "is_free": true, "unlock_at": "after_quiz"}
  ]'::jsonb,
  '{
    "week_1": {"title": "Entender: O que é LLM Local?", "items": ["Leia Cap 0 e 1 do Ebook LLM Local", "Leia Cap 5: Performance por Hardware (visão de custo)", "Resultado esperado: saber se faz sentido para sua empresa"]},
    "week_2": {"title": "Aplicar: IA para Decisões Financeiras", "items": ["Leia o Ebook CEO + IA: Decisões Financeiras", "Identifique 1 processo financeiro que poderia usar IA", "Resultado esperado: 1 caso de uso mapeado"]},
    "week_3": {"title": "Avaliar", "items": ["Estime custo vs. benefício do caso mapeado", "Converse com seu time técnico sobre viabilidade", "Resultado esperado: decisão de seguir ou não"]},
    "week_4": {"title": "Escalar", "items": ["Defina próximos passos com o time técnico", "Resultado esperado: plano de ação definido"]}
  }'::jsonb
),
(
  'pm_product',
  'Product Manager',
  'Você define produto e quer entender as capacidades reais de LLMs locais para tomar decisões de roadmap e UX informadas.',
  '[
    {"order": 1, "product_id": "ebook_llm_local", "title": "LLM Local: Setup Completo", "status": "already_purchased"},
    {"order": 2, "product_id": "ebook_notebooklm_obsidian", "title": "NotebookLM + Obsidian: Combo Infinito", "is_free": true, "unlock_at": "after_quiz"}
  ]'::jsonb,
  '{
    "week_1": {"title": "Entender Capacidades", "items": ["Leia Cap 1-3 do Ebook LLM Local (tipos e capacidades)", "Teste um modelo local você mesmo", "Resultado esperado: entendimento prático do que é possível"]},
    "week_2": {"title": "Organização e Conhecimento", "items": ["Leia o Ebook NotebookLM + Obsidian", "Organize uma base de conhecimento do seu produto", "Resultado esperado: 1 fluxo de documentação com IA"]},
    "week_3": {"title": "Aplicar ao Roadmap", "items": ["Mapeie onde IA local poderia entrar no seu produto", "Valide com o time técnico", "Resultado esperado: 1 feature candidata documentada"]},
    "week_4": {"title": "Comunicar", "items": ["Prepare um resumo executivo do caso de uso", "Resultado esperado: proposta pronta para priorização"]}
  }'::jsonb
),
(
  'founder_builder',
  'Founder + Growth',
  'Você está construindo um produto ou empresa e quer usar IA local para testar ideias rápido, sem depender de custos recorrentes de API.',
  '[
    {"order": 1, "product_id": "ebook_llm_local", "title": "LLM Local: Setup Completo", "status": "already_purchased"},
    {"order": 2, "product_id": "ebook_harness_ptc", "title": "Harness + PTC: Automação", "is_free": true, "unlock_at": "after_quiz"}
  ]'::jsonb,
  '{
    "week_1": {"title": "Setup Rápido", "items": ["Leia Cap 1-2 e 6 do Ebook LLM Local (setup + hardware por budget)", "Rode seu primeiro LLM local", "Resultado esperado: ambiente de testes funcionando sem custo recorrente"]},
    "week_2": {"title": "Prototipar", "items": ["Leia o Ebook Harness + PTC: Automação", "Monte um protótipo simples usando o LLM local", "Resultado esperado: 1 protótipo funcional"]},
    "week_3": {"title": "Validar", "items": ["Teste o protótipo com 3-5 pessoas", "Ajuste com base no feedback", "Resultado esperado: aprendizado validado"]},
    "week_4": {"title": "Decidir", "items": ["Decida se vale migrar para produção ou API paga", "Resultado esperado: decisão informada de próximo passo"]}
  }'::jsonb
);
```

Execute ambas as migrations no **SQL Editor do painel Supabase** (Project → SQL Editor → New query → colar o conteúdo de `0001_init.sql`, rodar; repetir para `0002_seed_profiles.sql`). Isso substitui o uso do Supabase CLI, que exigiria linkar o projeto remoto — desnecessário nesta fase.

Expected: as 6 tabelas aparecem em Table Editor, `profiles` já com 6 linhas.

- [ ] **Step 3: Criar os tipos compartilhados do banco**

Create `src/types/index.ts`:
```ts
export type QuizType = "triagem" | "validacao";
export type XpActionType = "compra" | "triagem" | "download" | "validacao";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          stripe_customer_id: string | null;
          total_xp: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          stripe_customer_id?: string | null;
          total_xp?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      purchases: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          price_cents: number;
          status: string;
          stripe_payment_id: string | null;
          downloaded: boolean;
          refund_window_expires: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          price_cents: number;
          status?: string;
          stripe_payment_id?: string | null;
          downloaded?: boolean;
          refund_window_expires?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["purchases"]["Insert"]>;
      };
      tokens: {
        Row: {
          token: string;
          purchase_id: string;
          profile_id: string | null;
          triaged: boolean;
          triaged_at: string | null;
          valid_until: string;
          created_at: string;
        };
        Insert: {
          token: string;
          purchase_id: string;
          profile_id?: string | null;
          triaged?: boolean;
          triaged_at?: string | null;
          valid_until: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tokens"]["Insert"]>;
      };
      quiz_responses: {
        Row: {
          id: string;
          token: string;
          quiz_type: QuizType;
          question_id: number;
          answer: string;
          is_correct: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          token: string;
          quiz_type: QuizType;
          question_id: number;
          answer: string;
          is_correct?: boolean | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["quiz_responses"]["Insert"]>;
      };
      profiles: {
        Row: {
          id: string;
          name: string;
          description: string;
          recommended_ebooks: unknown;
          study_roadmap: Record<string, { title: string; items: string[] }>;
        };
        Insert: Database["public"]["Tables"]["profiles"]["Row"];
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      xp_events: {
        Row: {
          id: string;
          user_id: string;
          xp_amount: number;
          action_type: XpActionType;
          reference_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          xp_amount: number;
          action_type: XpActionType;
          reference_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["xp_events"]["Insert"]>;
      };
    };
  };
}
```

- [ ] **Step 4: Commit**

```bash
git add supabase/ src/types/index.ts
git commit -m "feat: schema Supabase da Fase 1 + seed dos 6 perfis + tipos compartilhados"
```

---

## Task 3: Clientes Supabase (server-side e browser)

**Files:**
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/client.ts`

**Interfaces:**
- Consumes: `Database` (Task 2, `src/types/index.ts`)
- Produces: `getSupabaseServerClient(): SupabaseClient<Database>` (usado por todas as rotas de API e Server Components a partir da Task 7); `getSupabaseBrowserClient(): SupabaseClient<Database>` (reservado para uso futuro client-side).

- [ ] **Step 1: Criar o cliente server-side (service role key)**

Create `src/lib/supabase/server.ts`:
```ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types";

export function getSupabaseServerClient(): SupabaseClient<Database> {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
```

- [ ] **Step 2: Criar o cliente browser (anon key)**

Create `src/lib/supabase/client.ts`:
```ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types";

export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 3: Verificar que o projeto compila**

Run: `npx tsc --noEmit`
Expected: sem erros de tipo.

- [ ] **Step 4: Commit**

```bash
git add src/lib/supabase/
git commit -m "feat: clientes Supabase server-side e browser"
```

---

## Task 4: `lib/tokens.ts` — geração e validação de token

**Files:**
- Create: `src/lib/tokens.ts`
- Test: `src/lib/tokens.test.ts`

**Interfaces:**
- Produces: `generateToken(): string`; `tokenAccessExpiry(from?: Date): Date`; `refundWindowExpiry(from?: Date): Date`; `isTokenExpired(validUntil: string | Date): boolean`. Usados pela Task 9 (webhook Stripe) e Task 10/13 (páginas de quiz/dashboard/download).

- [ ] **Step 1: Escrever os testes (devem falhar — o módulo ainda não existe)**

Create `src/lib/tokens.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import {
  generateToken,
  tokenAccessExpiry,
  refundWindowExpiry,
  isTokenExpired,
} from "./tokens";

describe("generateToken", () => {
  it("gera um token de 10 caracteres alfanuméricos maiúsculos", () => {
    const token = generateToken();
    expect(token).toMatch(/^[0-9A-Z]{10}$/);
  });

  it("gera tokens diferentes em chamadas sucessivas", () => {
    const tokens = new Set(Array.from({ length: 50 }, () => generateToken()));
    expect(tokens.size).toBe(50);
  });
});

describe("tokenAccessExpiry", () => {
  it("retorna uma data 365 dias no futuro", () => {
    const from = new Date("2026-01-01T00:00:00.000Z");
    const expiry = tokenAccessExpiry(from);
    const diffDays = (expiry.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBe(365);
  });
});

describe("refundWindowExpiry", () => {
  it("retorna uma data 30 dias no futuro", () => {
    const from = new Date("2026-01-01T00:00:00.000Z");
    const expiry = refundWindowExpiry(from);
    const diffDays = (expiry.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBe(30);
  });
});

describe("isTokenExpired", () => {
  it("retorna true para data no passado", () => {
    expect(isTokenExpired("2020-01-01T00:00:00.000Z")).toBe(true);
  });

  it("retorna false para data no futuro", () => {
    const future = new Date(Date.now() + 1000 * 60 * 60 * 24 * 10);
    expect(isTokenExpired(future)).toBe(false);
  });
});
```

- [ ] **Step 2: Rodar os testes para confirmar que falham**

Run: `npx vitest run src/lib/tokens.test.ts`
Expected: FAIL — `Cannot find module './tokens'`.

- [ ] **Step 3: Implementar `lib/tokens.ts`**

Create `src/lib/tokens.ts`:
```ts
import { customAlphabet } from "nanoid";

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DAY_MS = 24 * 60 * 60 * 1000;

const generateRawToken = customAlphabet(ALPHABET, 10);

export function generateToken(): string {
  return generateRawToken();
}

export function tokenAccessExpiry(from: Date = new Date()): Date {
  return new Date(from.getTime() + 365 * DAY_MS);
}

export function refundWindowExpiry(from: Date = new Date()): Date {
  return new Date(from.getTime() + 30 * DAY_MS);
}

export function isTokenExpired(validUntil: string | Date): boolean {
  const expiry = typeof validUntil === "string" ? new Date(validUntil) : validUntil;
  return expiry.getTime() < Date.now();
}
```

- [ ] **Step 4: Rodar os testes para confirmar que passam**

Run: `npx vitest run src/lib/tokens.test.ts`
Expected: PASS — 6 testes.

- [ ] **Step 5: Commit**

```bash
git add src/lib/tokens.ts src/lib/tokens.test.ts
git commit -m "feat: geração e validação de token (lib/tokens.ts)"
```

---

## Task 5: `lib/quiz-scoring.ts` — lógica de pontuação do quiz de triagem

**Files:**
- Create: `src/lib/quiz-scoring.ts`
- Test: `src/lib/quiz-scoring.test.ts`

**Interfaces:**
- Consumes: nenhuma
- Produces: tipos `ProfileId`, `TriagemOption`, `TriagemQuestion`, `TriagemAnswer`; função `scoreTriagem(questions: TriagemQuestion[], answers: TriagemAnswer[]): ProfileId`. Usados pela Task 6 (`data/quiz-triagem.ts`), Task 10 (`QuizTriagem.tsx`) e Task 11 (`api/quiz/route.ts`).

- [ ] **Step 1: Escrever os testes (devem falhar — o módulo ainda não existe)**

Create `src/lib/quiz-scoring.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { scoreTriagem, type TriagemQuestion, type TriagemAnswer } from "./quiz-scoring";

const questions: TriagemQuestion[] = [
  {
    id: 1,
    text: "Pergunta de escolha única",
    type: "radio",
    options: [
      { text: "A", points: { dev_python_aia: 3 } },
      { text: "B", points: { ceo_financeiro: 3 } },
    ],
  },
  {
    id: 2,
    text: "Pergunta de múltipla escolha",
    type: "checkbox",
    options: [
      { text: "A", points: { dev_python_aia: 2 } },
      { text: "B", points: { dev_nodejs_web: 2 } },
      { text: "C", points: { devops_infra: 1 } },
    ],
  },
];

describe("scoreTriagem", () => {
  it("escolhe o perfil com maior soma de pontos", () => {
    const answers: TriagemAnswer[] = [
      { questionId: 1, selectedOptionIndexes: [0] },
      { questionId: 2, selectedOptionIndexes: [0] },
    ];
    expect(scoreTriagem(questions, answers)).toBe("dev_python_aia");
  });

  it("soma pontos de múltiplas opções marcadas (checkbox)", () => {
    const answers: TriagemAnswer[] = [
      { questionId: 1, selectedOptionIndexes: [1] },
      { questionId: 2, selectedOptionIndexes: [1, 2] },
    ];
    // ceo_financeiro=3 vs dev_nodejs_web=2 vs devops_infra=1 -> ceo_financeiro vence
    expect(scoreTriagem(questions, answers)).toBe("ceo_financeiro");
  });

  it("em empate, retorna o perfil declarado primeiro na ordem de scores", () => {
    const tieQuestions: TriagemQuestion[] = [
      {
        id: 1,
        text: "Empate",
        type: "radio",
        options: [{ text: "A", points: { dev_python_aia: 2, dev_nodejs_web: 2 } }],
      },
    ];
    const answers: TriagemAnswer[] = [{ questionId: 1, selectedOptionIndexes: [0] }];
    expect(scoreTriagem(tieQuestions, answers)).toBe("dev_python_aia");
  });

  it("ignora respostas para perguntas ou opções inexistentes", () => {
    const answers: TriagemAnswer[] = [
      { questionId: 999, selectedOptionIndexes: [0] },
      { questionId: 1, selectedOptionIndexes: [99] },
    ];
    expect(scoreTriagem(questions, answers)).toBe("dev_python_aia");
  });
});
```

- [ ] **Step 2: Rodar os testes para confirmar que falham**

Run: `npx vitest run src/lib/quiz-scoring.test.ts`
Expected: FAIL — `Cannot find module './quiz-scoring'`.

- [ ] **Step 3: Implementar `lib/quiz-scoring.ts`**

Create `src/lib/quiz-scoring.ts`:
```ts
export type ProfileId =
  | "dev_python_aia"
  | "dev_nodejs_web"
  | "devops_infra"
  | "ceo_financeiro"
  | "pm_product"
  | "founder_builder";

export interface TriagemOption {
  text: string;
  points: Partial<Record<ProfileId, number>>;
}

export interface TriagemQuestion {
  id: number;
  text: string;
  type: "radio" | "checkbox";
  options: TriagemOption[];
}

export interface TriagemAnswer {
  questionId: number;
  selectedOptionIndexes: number[];
}

const PROFILE_ORDER: ProfileId[] = [
  "dev_python_aia",
  "dev_nodejs_web",
  "devops_infra",
  "ceo_financeiro",
  "pm_product",
  "founder_builder",
];

export function scoreTriagem(
  questions: TriagemQuestion[],
  answers: TriagemAnswer[]
): ProfileId {
  const scores: Record<ProfileId, number> = {
    dev_python_aia: 0,
    dev_nodejs_web: 0,
    devops_infra: 0,
    ceo_financeiro: 0,
    pm_product: 0,
    founder_builder: 0,
  };

  for (const answer of answers) {
    const question = questions.find((q) => q.id === answer.questionId);
    if (!question) continue;

    for (const optionIndex of answer.selectedOptionIndexes) {
      const option = question.options[optionIndex];
      if (!option) continue;

      for (const profileId of PROFILE_ORDER) {
        scores[profileId] += option.points[profileId] ?? 0;
      }
    }
  }

  return PROFILE_ORDER.reduce((winner, profileId) =>
    scores[profileId] > scores[winner] ? profileId : winner
  );
}
```

- [ ] **Step 4: Rodar os testes para confirmar que passam**

Run: `npx vitest run src/lib/quiz-scoring.test.ts`
Expected: PASS — 4 testes.

- [ ] **Step 5: Commit**

```bash
git add src/lib/quiz-scoring.ts src/lib/quiz-scoring.test.ts
git commit -m "feat: lógica de pontuação do quiz de triagem (lib/quiz-scoring.ts)"
```

---

## Task 6: Conteúdo do quiz de triagem (20 perguntas)

**Files:**
- Create: `src/data/quiz-triagem.ts`

**Interfaces:**
- Consumes: `TriagemQuestion` (Task 5, `src/lib/quiz-scoring.ts`)
- Produces: `QUIZ_TRIAGEM: TriagemQuestion[]` (20 perguntas). Usado pela Task 10 (`QuizTriagem.tsx`) e Task 11 (`api/quiz/route.ts`).

- [ ] **Step 1: Criar o arquivo de conteúdo**

Create `src/data/quiz-triagem.ts`:
```ts
import type { TriagemQuestion } from "@/lib/quiz-scoring";

export const QUIZ_TRIAGEM: TriagemQuestion[] = [
  {
    id: 1,
    text: "Qual é sua principal linguagem de programação?",
    type: "radio",
    options: [
      { text: "Python", points: { dev_python_aia: 3 } },
      { text: "JavaScript/TypeScript", points: { dev_nodejs_web: 3 } },
      { text: "Go/Rust", points: { devops_infra: 2 } },
      { text: "Não programo", points: { ceo_financeiro: 3, pm_product: 2 } },
    ],
  },
  {
    id: 2,
    text: "Qual seu principal objetivo com LLM local?",
    type: "radio",
    options: [
      { text: "Automação de código/prompts", points: { dev_python_aia: 3, dev_nodejs_web: 2 } },
      { text: "Deploy em produção", points: { devops_infra: 3 } },
      { text: "Análise de dados/financeiro", points: { ceo_financeiro: 3 } },
      { text: "Entender capacidades para produto", points: { pm_product: 3 } },
      { text: "Testar ideias de startup", points: { founder_builder: 3 } },
    ],
  },
  {
    id: 3,
    text: "Quantas horas/semana você dedica a aprender tecnologia?",
    type: "radio",
    options: [
      { text: "0-5 horas", points: { ceo_financeiro: 2, pm_product: 1 } },
      { text: "5-10 horas", points: { pm_product: 2, founder_builder: 2 } },
      { text: "10+ horas", points: { dev_python_aia: 3, dev_nodejs_web: 3, devops_infra: 3 } },
    ],
  },
  {
    id: 4,
    text: "Você prefere conteúdo sobre...",
    type: "checkbox",
    options: [
      { text: "Código + implementação", points: { dev_python_aia: 2, dev_nodejs_web: 2 } },
      { text: "Infraestrutura + deployment", points: { devops_infra: 2 } },
      { text: "ROI + decisões de negócio", points: { ceo_financeiro: 2 } },
      { text: "Features + UX", points: { pm_product: 2 } },
      { text: "Go-to-market + growth", points: { founder_builder: 2 } },
    ],
  },
  {
    id: 5,
    text: "Seu maior bloqueador é?",
    type: "radio",
    options: [
      { text: "Falta de conhecimento técnico", points: { dev_python_aia: 1, dev_nodejs_web: 1 } },
      { text: "Como calcular ROI", points: { ceo_financeiro: 3 } },
      { text: "Timing de mercado", points: { founder_builder: 3 } },
      { text: "Alinhamento com produto", points: { pm_product: 2 } },
      { text: "Nenhum bloqueio, quero escalar", points: { devops_infra: 2 } },
    ],
  },
  {
    id: 6,
    text: "Qual dessas frases mais combina com você?",
    type: "radio",
    options: [
      { text: "Gosto de mexer no código até funcionar do meu jeito", points: { dev_python_aia: 2, dev_nodejs_web: 2 } },
      { text: "Prefiro garantir que o sistema não caia", points: { devops_infra: 3 } },
      { text: "Prefiro entender o impacto financeiro antes de mexer em nada", points: { ceo_financeiro: 3 } },
      { text: "Prefiro entender o que o usuário final vai sentir", points: { pm_product: 3 } },
    ],
  },
  {
    id: 7,
    text: "Onde você roda a maior parte do seu trabalho hoje?",
    type: "radio",
    options: [
      { text: "Terminal e editor de código", points: { dev_python_aia: 2, dev_nodejs_web: 2 } },
      { text: "Servidores e ferramentas de deploy (Docker, CI/CD)", points: { devops_infra: 3 } },
      { text: "Planilhas e relatórios", points: { ceo_financeiro: 3 } },
      { text: "Ferramentas de gestão de produto (roadmap, backlog)", points: { pm_product: 3 } },
    ],
  },
  {
    id: 8,
    text: "O que mais te empolga em rodar uma IA localmente?",
    type: "checkbox",
    options: [
      { text: "Não pagar mensalidade de API", points: { founder_builder: 2, ceo_financeiro: 2 } },
      { text: "Privacidade dos dados", points: { devops_infra: 2, ceo_financeiro: 1 } },
      { text: "Poder customizar o comportamento do modelo", points: { dev_python_aia: 2, dev_nodejs_web: 2 } },
      { text: "Validar uma ideia de produto rápido e sem custo", points: { founder_builder: 2, pm_product: 1 } },
    ],
  },
  {
    id: 9,
    text: "Qual hardware você tem disponível hoje?",
    type: "radio",
    options: [
      { text: "PC/notebook com GPU dedicada", points: { dev_python_aia: 2, dev_nodejs_web: 1 } },
      { text: "Servidor ou VPS que eu administro", points: { devops_infra: 3 } },
      { text: "Só um notebook comum, sem GPU forte", points: { ceo_financeiro: 1, pm_product: 1, founder_builder: 1 } },
    ],
  },
  {
    id: 10,
    text: "Como você prefere aprender algo novo?",
    type: "radio",
    options: [
      { text: "Seguindo um tutorial passo a passo e codando junto", points: { dev_python_aia: 2, dev_nodejs_web: 2 } },
      { text: "Lendo um resumo executivo direto ao ponto", points: { ceo_financeiro: 3 } },
      { text: "Vendo casos de uso reais de outros produtos", points: { pm_product: 2, founder_builder: 2 } },
      { text: "Testando em um ambiente controlado antes de confiar", points: { devops_infra: 2 } },
    ],
  },
  {
    id: 11,
    text: "Você já usa alguma ferramenta de IA no seu dia a dia de trabalho?",
    type: "radio",
    options: [
      { text: "Sim, uso para escrever/revisar código", points: { dev_python_aia: 2, dev_nodejs_web: 2 } },
      { text: "Sim, uso para automatizar deploy/infra", points: { devops_infra: 3 } },
      { text: "Sim, uso para análises e relatórios", points: { ceo_financeiro: 2 } },
      { text: "Ainda não uso no trabalho", points: { pm_product: 1, founder_builder: 1 } },
    ],
  },
  {
    id: 12,
    text: "Qual desses times você mais parece com o dia a dia?",
    type: "radio",
    options: [
      { text: "Engenharia de produto/backend", points: { dev_python_aia: 2, dev_nodejs_web: 2 } },
      { text: "SRE/Plataforma/Infraestrutura", points: { devops_infra: 3 } },
      { text: "Financeiro/Operações", points: { ceo_financeiro: 3 } },
      { text: "Produto/UX", points: { pm_product: 3 } },
      { text: "Founders/early-stage", points: { founder_builder: 3 } },
    ],
  },
  {
    id: 13,
    text: "O que você faria primeiro com um LLM local funcionando?",
    type: "radio",
    options: [
      { text: "Integraria em um script Python que já uso", points: { dev_python_aia: 3 } },
      { text: "Integraria em uma API/rota que já mantenho", points: { dev_nodejs_web: 3 } },
      { text: "Colocaria atrás de monitoramento antes de qualquer uso real", points: { devops_infra: 3 } },
      { text: "Calcularia quanto isso economiza por mês", points: { ceo_financeiro: 3 } },
      { text: "Testaria um protótipo de produto novo", points: { founder_builder: 3 } },
    ],
  },
  {
    id: 14,
    text: "Como você mede sucesso de um projeto de IA?",
    type: "checkbox",
    options: [
      { text: "Corretude/qualidade técnica da resposta", points: { dev_python_aia: 2, dev_nodejs_web: 2 } },
      { text: "Estabilidade e uptime", points: { devops_infra: 2 } },
      { text: "Redução de custo mensurável", points: { ceo_financeiro: 2, founder_builder: 1 } },
      { text: "Satisfação do usuário final", points: { pm_product: 2 } },
    ],
  },
  {
    id: 15,
    text: "Qual frase melhor descreve sua relação com prazos?",
    type: "radio",
    options: [
      { text: "Prefiro entregar rápido e iterar depois", points: { founder_builder: 3, dev_nodejs_web: 1 } },
      { text: "Prefiro validar bem antes de subir qualquer coisa", points: { devops_infra: 2, ceo_financeiro: 1 } },
      { text: "Prefiro alinhar com o time antes de definir prazo", points: { pm_product: 3 } },
    ],
  },
  {
    id: 16,
    text: "O que mais te frustra em ferramentas de IA baseadas em nuvem?",
    type: "checkbox",
    options: [
      { text: "Custo por token/mensalidade", points: { founder_builder: 2, ceo_financeiro: 2 } },
      { text: "Falta de controle sobre o modelo", points: { dev_python_aia: 2, dev_nodejs_web: 1 } },
      { text: "Dependência de terceiros para operar (SLA, disponibilidade)", points: { devops_infra: 2 } },
      { text: "Dificuldade de justificar o ROI internamente", points: { ceo_financeiro: 1, pm_product: 1 } },
    ],
  },
  {
    id: 17,
    text: "Se pudesse escolher, você preferia aprender...",
    type: "radio",
    options: [
      { text: "Detalhes técnicos de arquitetura de modelos", points: { dev_python_aia: 2 } },
      { text: "Como conectar IA a ferramentas e APIs (MCP, integrações)", points: { dev_nodejs_web: 3 } },
      { text: "Como manter isso rodando de forma confiável", points: { devops_infra: 3 } },
      { text: "Como decidir se vale o investimento", points: { ceo_financeiro: 3 } },
    ],
  },
  {
    id: 18,
    text: "Qual seu nível de experiência com terminal/linha de comando?",
    type: "radio",
    options: [
      { text: "Uso todos os dias, sem problema", points: { dev_python_aia: 2, dev_nodejs_web: 2, devops_infra: 2 } },
      { text: "Uso o básico quando preciso", points: { pm_product: 1, founder_builder: 1 } },
      { text: "Prefiro evitar quando possível", points: { ceo_financeiro: 2 } },
    ],
  },
  {
    id: 19,
    text: "Você está construindo ou já opera algum produto/empresa hoje?",
    type: "radio",
    options: [
      { text: "Sim, sou founder ou parte do time fundador", points: { founder_builder: 3 } },
      { text: "Sim, mas em uma empresa maior/estabelecida", points: { ceo_financeiro: 2, pm_product: 1 } },
      { text: "Não, trabalho como profissional técnico em um time", points: { dev_python_aia: 1, dev_nodejs_web: 1, devops_infra: 1 } },
    ],
  },
  {
    id: 20,
    text: "O que você espera conseguir fazer em 30 dias depois deste ebook?",
    type: "checkbox",
    options: [
      { text: "Ter um LLM local rodando e integrado ao meu código", points: { dev_python_aia: 2, dev_nodejs_web: 2 } },
      { text: "Ter um LLM local rodando de forma estável em servidor", points: { devops_infra: 2 } },
      { text: "Ter clareza se vale o investimento para minha empresa", points: { ceo_financeiro: 2 } },
      { text: "Ter uma feature ou protótipo validado", points: { pm_product: 1, founder_builder: 2 } },
    ],
  },
];
```

- [ ] **Step 2: Verificar que compila e que há exatamente 20 perguntas**

Run:
```bash
npx tsc --noEmit
node -e "console.log(require('tsx/cjs') || 'ok')" 2>/dev/null; npx vitest run --reporter basic 2>&1 | tail -1
```
(Se preferir, valide manualmente contando as entradas do array — devem ser 20.)

- [ ] **Step 3: Commit**

```bash
git add src/data/quiz-triagem.ts
git commit -m "content: 20 perguntas do quiz de triagem (radio/checkbox + pontos por perfil)"
```

---

## Task 7: `lib/stripe.ts` + `POST /api/checkout`

**Files:**
- Create: `src/lib/stripe.ts`
- Create: `src/app/api/checkout/route.ts`

**Interfaces:**
- Produces: `stripe: Stripe` e `PRODUTO_1: { productId: string; name: string; priceCents: number }` (usados pela Task 9); rota `POST /api/checkout` retornando `{ url: string }`.

- [ ] **Step 1: Criar `lib/stripe.ts`**

Create `src/lib/stripe.ts`:
```ts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const PRODUTO_1 = {
  productId: "ebook_llm_local",
  name: "Construa Seu Próprio ChatGPT Particular em Poucos Minutos - LLM Local",
  priceCents: 4700,
};
```

- [ ] **Step 2: Criar a rota de checkout**

Create `src/app/api/checkout/route.ts`:
```ts
import { NextRequest, NextResponse } from "next/server";
import { stripe, PRODUTO_1 } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = body?.email;

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "email é obrigatório" }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card", "boleto", "pix"],
    line_items: [
      {
        price_data: {
          currency: "brl",
          product_data: { name: PRODUTO_1.name },
          unit_amount: PRODUTO_1.priceCents,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_URL}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/checkout/cancelado`,
    customer_email: email,
    metadata: { product_id: PRODUTO_1.productId },
  });

  return NextResponse.json({ url: session.url });
}
```

- [ ] **Step 3: Verificar que compila**

Run: `npx tsc --noEmit`
Expected: sem erros (mesmo sem `STRIPE_SECRET_KEY` preenchida — isso só falha em runtime, não em type-check).

- [ ] **Step 4: Commit**

```bash
git add src/lib/stripe.ts src/app/api/checkout/
git commit -m "feat: rota de checkout Stripe (POST /api/checkout)"
```

---

## Task 8: `lib/email.ts` — envio de e-mail via Brevo

**Files:**
- Create: `src/lib/email.ts`

**Interfaces:**
- Produces: `sendTokenEmail(params: { to: string; token: string }): Promise<void>` (usado pela Task 9).

- [ ] **Step 1: Implementar o envio via API HTTP da Brevo**

Create `src/lib/email.ts`:
```ts
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export async function sendTokenEmail(params: { to: string; token: string }): Promise<void> {
  const quizUrl = `${process.env.NEXT_PUBLIC_URL}/quiz/${params.token}`;

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
      subject: "Seu token chegou! Descubra seu perfil 🚀",
      htmlContent: `
        <p>Seu ebook está confirmado.</p>
        <p>Descubra seu perfil de aprendizado e desbloqueie seu roadmap personalizado:</p>
        <p><a href="${quizUrl}">${quizUrl}</a></p>
      `,
    }),
  });

  if (!response.ok) {
    const responseBody = await response.text();
    throw new Error(`Falha ao enviar e-mail via Brevo: ${response.status} ${responseBody}`);
  }
}
```

- [ ] **Step 2: Verificar que compila**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/lib/email.ts
git commit -m "feat: envio de e-mail transacional via Brevo (lib/email.ts)"
```

---

## Task 9: Webhook Stripe (`POST /api/webhooks/stripe`)

**Files:**
- Create: `src/app/api/webhooks/stripe/route.ts`
- Test: `src/app/api/webhooks/stripe/route.test.ts`

**Interfaces:**
- Consumes: `stripe` (Task 7), `getSupabaseServerClient` (Task 3), `generateToken`/`tokenAccessExpiry`/`refundWindowExpiry` (Task 4), `sendTokenEmail` (Task 8)
- Produces: rota `POST /api/webhooks/stripe`, idempotente por `stripe_payment_id`.

- [ ] **Step 1: Escrever o teste de integração (deve falhar — rota ainda não existe)**

Create `src/app/api/webhooks/stripe/route.test.ts`:
```ts
import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockConstructEvent = vi.fn();
vi.mock("@/lib/stripe", () => ({
  stripe: { webhooks: { constructEvent: (...args: unknown[]) => mockConstructEvent(...args) } },
}));

const mockSendTokenEmail = vi.fn().mockResolvedValue(undefined);
vi.mock("@/lib/email", () => ({
  sendTokenEmail: (...args: unknown[]) => mockSendTokenEmail(...args),
}));

function buildSupabaseMock(existingPurchase: unknown) {
  const insertedRows: Record<string, unknown[]> = {
    users: [],
    purchases: [],
    tokens: [],
    xp_events: [],
  };

  const from = (table: string) => ({
    select: () => ({
      eq: () => ({
        maybeSingle: async () => ({ data: existingPurchase, error: null }),
      }),
    }),
    upsert: (row: Record<string, unknown>) => ({
      select: () => ({
        single: async () => {
          const inserted = { id: "user-1", ...row };
          insertedRows.users.push(inserted);
          return { data: inserted, error: null };
        },
      }),
    }),
    // Registra a linha assim que `insert()` é chamado (não só quando
    // `.select().single()` é encadeado) — o código real chama
    // `.insert(...)` sem encadear `.select().single()` para `tokens` e
    // `xp_events`, só para `purchases`. O retorno é um Promise de verdade
    // com `.select` anexado, então funciona tanto com `await insert(...)`
    // direto quanto com `await insert(...).select().single()`.
    insert: (row: Record<string, unknown>) => {
      const inserted = { id: `${table}-1`, ...row };
      insertedRows[table]?.push(inserted);
      const result = Promise.resolve({ data: inserted, error: null });
      return Object.assign(result, {
        select: () => ({
          single: async () => ({ data: inserted, error: null }),
        }),
      });
    },
  });

  return { from, insertedRows };
}

let mockSupabase: ReturnType<typeof buildSupabaseMock>;
vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: () => mockSupabase,
}));

describe("POST /api/webhooks/stripe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = buildSupabaseMock(null);
  });

  it("cria user, purchase, token e envia e-mail em checkout.session.completed", async () => {
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          customer_email: "aluno@example.com",
          customer: "cus_123",
          payment_intent: "pi_123",
          amount_total: 4700,
          metadata: { product_id: "ebook_llm_local" },
        },
      },
    });

    const { POST } = await import("./route");
    const request = new NextRequest("http://localhost/api/webhooks/stripe", {
      method: "POST",
      body: "{}",
      headers: { "stripe-signature": "sig_test" },
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.received).toBe(true);
    expect(mockSupabase.insertedRows.purchases).toHaveLength(1);
    expect(mockSupabase.insertedRows.tokens).toHaveLength(1);
    expect(mockSupabase.insertedRows.xp_events).toHaveLength(1);
    expect(mockSendTokenEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "aluno@example.com" })
    );
  });

  it("ignora evento se stripe_payment_id já foi processado (idempotência)", async () => {
    mockSupabase = buildSupabaseMock({ id: "purchase-existente" });
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          customer_email: "aluno@example.com",
          customer: "cus_123",
          payment_intent: "pi_123",
          amount_total: 4700,
          metadata: { product_id: "ebook_llm_local" },
        },
      },
    });

    const { POST } = await import("./route");
    const request = new NextRequest("http://localhost/api/webhooks/stripe", {
      method: "POST",
      body: "{}",
      headers: { "stripe-signature": "sig_test" },
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.deduped).toBe(true);
    expect(mockSupabase.insertedRows.purchases).toHaveLength(0);
    expect(mockSendTokenEmail).not.toHaveBeenCalled();
  });

  it("rejeita requisição com assinatura inválida", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("assinatura inválida");
    });

    const { POST } = await import("./route");
    const request = new NextRequest("http://localhost/api/webhooks/stripe", {
      method: "POST",
      body: "{}",
      headers: { "stripe-signature": "sig_invalida" },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

Run: `npx vitest run src/app/api/webhooks/stripe/route.test.ts`
Expected: FAIL — `Cannot find module './route'`.

- [ ] **Step 3: Implementar a rota**

Create `src/app/api/webhooks/stripe/route.ts`:
```ts
import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { generateToken, tokenAccessExpiry, refundWindowExpiry } from "@/lib/tokens";
import { sendTokenEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature ?? "", process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "assinatura inválida" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const email = session.customer_email;
  const productId = session.metadata?.product_id;
  const stripePaymentId = session.payment_intent as string | null;

  if (!email || !productId || !stripePaymentId) {
    return NextResponse.json({ error: "evento incompleto" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  const { data: existingPurchase } = await supabase
    .from("purchases")
    .select("id")
    .eq("stripe_payment_id", stripePaymentId)
    .maybeSingle();

  if (existingPurchase) {
    return NextResponse.json({ received: true, deduped: true });
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .upsert({ email, stripe_customer_id: session.customer as string }, { onConflict: "email" })
    .select()
    .single();

  if (userError || !user) {
    return NextResponse.json({ error: "falha ao salvar usuário" }, { status: 500 });
  }

  const now = new Date();
  const { data: purchase, error: purchaseError } = await supabase
    .from("purchases")
    .insert({
      user_id: user.id,
      product_id: productId,
      price_cents: session.amount_total ?? 0,
      status: "paid",
      stripe_payment_id: stripePaymentId,
      refund_window_expires: refundWindowExpiry(now).toISOString(),
    })
    .select()
    .single();

  if (purchaseError || !purchase) {
    return NextResponse.json({ error: "falha ao salvar compra" }, { status: 500 });
  }

  const token = generateToken();
  await supabase.from("tokens").insert({
    token,
    purchase_id: purchase.id,
    valid_until: tokenAccessExpiry(now).toISOString(),
  });

  await supabase.from("xp_events").insert({
    user_id: user.id,
    xp_amount: 100,
    action_type: "compra",
    reference_id: purchase.id,
  });

  try {
    await sendTokenEmail({ to: email, token });
  } catch (err) {
    console.error("Falha ao enviar e-mail de token, requer reenvio manual:", err);
  }

  return NextResponse.json({ received: true });
}
```

- [ ] **Step 4: Rodar o teste para confirmar que passa**

Run: `npx vitest run src/app/api/webhooks/stripe/route.test.ts`
Expected: PASS — 3 testes.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/webhooks/stripe/
git commit -m "feat: webhook Stripe idempotente (checkout.session.completed)"
```

---

## Task 10: Quiz de triagem — componente e página

**Files:**
- Create: `src/components/quiz/QuizTriagem.tsx`
- Create: `src/app/quiz/[token]/page.tsx`

**Interfaces:**
- Consumes: `QUIZ_TRIAGEM` (Task 6), `getSupabaseServerClient` (Task 3), `isTokenExpired` (Task 4)
- Produces: componente `QuizTriagem({ token: string })`; página `GET /quiz/[token]`.

- [ ] **Step 1: Criar o componente client de triagem**

Create `src/components/quiz/QuizTriagem.tsx`:
```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QUIZ_TRIAGEM } from "@/data/quiz-triagem";

interface Props {
  token: string;
}

export default function QuizTriagem({ token }: Props) {
  const router = useRouter();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: number; selectedOptionIndexes: number[] }[]>([]);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const question = QUIZ_TRIAGEM[currentQ];
  const isLast = currentQ === QUIZ_TRIAGEM.length - 1;

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

    if (!isLast) {
      setCurrentQ((prev) => prev + 1);
      return;
    }

    setSubmitting(true);
    const response = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, quizType: "triagem", answers: updatedAnswers }),
    });

    if (response.ok) {
      router.push(`/dashboard/${token}`);
      return;
    }

    setSubmitting(false);
    setError("Não foi possível calcular seu perfil agora. Tente novamente.");
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <p className="text-sm text-gray-500 mb-2">
        Pergunta {currentQ + 1} de {QUIZ_TRIAGEM.length}
      </p>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: `${((currentQ + 1) / QUIZ_TRIAGEM.length) * 100}%` }}
        />
      </div>

      <h2 className="text-lg font-semibold mb-4">{question.text}</h2>

      <div className="space-y-3">
        {question.options.map((option, index) => (
          <button
            key={option.text}
            type="button"
            onClick={() => toggleOption(index)}
            className={`w-full text-left p-3 border-2 rounded-lg transition ${
              selectedIndexes.includes(index)
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-blue-300"
            }`}
          >
            {option.text}
          </button>
        ))}
      </div>

      {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

      <button
        type="button"
        onClick={handleNext}
        disabled={selectedIndexes.length === 0 || submitting}
        className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-bold disabled:opacity-50"
      >
        {isLast ? (submitting ? "Calculando seu perfil..." : "Ver meu perfil") : "Próxima"}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Criar a página server-side do quiz**

Create `src/app/quiz/[token]/page.tsx`:
```tsx
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isTokenExpired } from "@/lib/tokens";
import QuizTriagem from "@/components/quiz/QuizTriagem";

function ErroToken({ mensagem, linkDashboard }: { mensagem: string; linkDashboard?: string }) {
  return (
    <div className="max-w-md mx-auto p-8 text-center">
      <p className="text-gray-700">{mensagem}</p>
      {linkDashboard && (
        <a href={linkDashboard} className="text-blue-600 underline mt-4 inline-block">
          Ir para o dashboard
        </a>
      )}
    </div>
  );
}

export default async function QuizPage({ params }: { params: { token: string } }) {
  const supabase = getSupabaseServerClient();
  const { data: tokenRow } = await supabase
    .from("tokens")
    .select("*")
    .eq("token", params.token)
    .maybeSingle();

  if (!tokenRow) {
    return <ErroToken mensagem="Token não encontrado. Verifique o link do seu e-mail." />;
  }

  if (isTokenExpired(tokenRow.valid_until)) {
    return <ErroToken mensagem="Este token expirou." />;
  }

  if (tokenRow.triaged) {
    return (
      <ErroToken
        mensagem="Você já completou a triagem."
        linkDashboard={`/dashboard/${params.token}`}
      />
    );
  }

  return <QuizTriagem token={params.token} />;
}
```

- [ ] **Step 3: Verificar que compila**

Run: `npx tsc --noEmit`
Expected: sem erros (a rota `/api/quiz` ainda não existe — a Task 11 a cria; isso não afeta o type-check desta página, que só faz `fetch` para uma string de rota).

- [ ] **Step 4: Commit**

```bash
git add src/components/quiz/QuizTriagem.tsx src/app/quiz/
git commit -m "feat: página e componente do quiz de triagem (/quiz/[token])"
```

---

## Task 11: `POST /api/quiz` — triagem e validação

**Files:**
- Create: `src/app/api/quiz/route.ts`
- Test: `src/app/api/quiz/route.test.ts`

**Interfaces:**
- Consumes: `getSupabaseServerClient` (Task 3), `scoreTriagem` (Task 5), `QUIZ_TRIAGEM` (Task 6)
- Produces: rota `POST /api/quiz` aceitando `{ token, quizType: "triagem", answers }` → `{ profileId }`, ou `{ token, quizType: "validacao", score, passed }` → `{ ok: true, score, passed }`.

**Nota de escopo:** `QuizValidacao.tsx` (já existente, não alterado) só expõe `onComplete(score, passed)` ao terminar — sem respostas por questão. Por isso, para `quizType: "validacao"`, esta rota não grava linhas em `quiz_responses` nesta fase (só concede XP se `passed`). Persistência por questão da validação fica para quando o componente for revisto (fora do escopo da Fase 1).

- [ ] **Step 1: Escrever o teste (deve falhar — rota ainda não existe)**

Create `src/app/api/quiz/route.test.ts`:
```ts
import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

function buildSupabaseMock(tokenRow: Record<string, unknown> | null) {
  const inserted: Record<string, unknown[]> = { quiz_responses: [], xp_events: [] };
  const updated: Record<string, unknown>[] = [];

  const from = (table: string) => {
    if (table === "tokens") {
      return {
        select: () => ({
          eq: () => ({ maybeSingle: async () => ({ data: tokenRow, error: null }) }),
        }),
        update: (payload: Record<string, unknown>) => ({
          eq: async () => {
            updated.push(payload);
            return { data: null, error: null };
          },
        }),
      };
    }
    if (table === "purchases") {
      return {
        select: () => ({
          eq: () => ({
            single: async () => ({ data: { user_id: "user-1" }, error: null }),
          }),
        }),
      };
    }
    return {
      insert: async (rows: unknown) => {
        inserted[table]?.push(rows);
        return { data: null, error: null };
      },
    };
  };

  return { from, inserted, updated };
}

let mockSupabase: ReturnType<typeof buildSupabaseMock>;
vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: () => mockSupabase,
}));

describe("POST /api/quiz", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calcula perfil, marca token como triado e concede XP", async () => {
    mockSupabase = buildSupabaseMock({
      token: "ABC1234567",
      purchase_id: "purchase-1",
      triaged: false,
    });

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
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.profileId).toBe("dev_python_aia");
    expect(mockSupabase.inserted.xp_events).toHaveLength(1);
    expect(mockSupabase.updated[0]).toMatchObject({ triaged: true });
  });

  it("bloqueia reenvio de triagem se o token já foi triado", async () => {
    mockSupabase = buildSupabaseMock({
      token: "ABC1234567",
      purchase_id: "purchase-1",
      triaged: true,
    });

    const { POST } = await import("./route");
    const request = new NextRequest("http://localhost/api/quiz", {
      method: "POST",
      body: JSON.stringify({ token: "ABC1234567", quizType: "triagem", answers: [] }),
    });

    const response = await POST(request);
    expect(response.status).toBe(409);
  });

  it("concede XP de validação apenas quando passed=true", async () => {
    mockSupabase = buildSupabaseMock({
      token: "ABC1234567",
      purchase_id: "purchase-1",
      triaged: true,
    });

    const { POST } = await import("./route");
    const request = new NextRequest("http://localhost/api/quiz", {
      method: "POST",
      body: JSON.stringify({ token: "ABC1234567", quizType: "validacao", score: 40, passed: false }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.passed).toBe(false);
    expect(mockSupabase.inserted.xp_events).toHaveLength(0);
  });

  it("retorna 404 se o token não existe", async () => {
    mockSupabase = buildSupabaseMock(null);

    const { POST } = await import("./route");
    const request = new NextRequest("http://localhost/api/quiz", {
      method: "POST",
      body: JSON.stringify({ token: "NAOEXISTE", quizType: "triagem", answers: [] }),
    });

    const response = await POST(request);
    expect(response.status).toBe(404);
  });
});
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

Run: `npx vitest run src/app/api/quiz/route.test.ts`
Expected: FAIL — `Cannot find module './route'`.

- [ ] **Step 3: Implementar a rota**

Create `src/app/api/quiz/route.ts`:
```ts
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { scoreTriagem, type TriagemAnswer } from "@/lib/quiz-scoring";
import { QUIZ_TRIAGEM } from "@/data/quiz-triagem";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const token = body?.token;
  const quizType = body?.quizType;

  if (!token || (quizType !== "triagem" && quizType !== "validacao")) {
    return NextResponse.json({ error: "payload inválido" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  const { data: tokenRow } = await supabase
    .from("tokens")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (!tokenRow) {
    return NextResponse.json({ error: "token não encontrado" }, { status: 404 });
  }

  if (quizType === "triagem") {
    if (tokenRow.triaged) {
      return NextResponse.json({ error: "triagem já realizada" }, { status: 409 });
    }

    const answers = (body.answers ?? []) as TriagemAnswer[];
    const rows = answers.map((answer) => ({
      token,
      quiz_type: "triagem" as const,
      question_id: answer.questionId,
      answer: JSON.stringify(answer.selectedOptionIndexes),
    }));
    if (rows.length > 0) {
      await supabase.from("quiz_responses").insert(rows);
    }

    const profileId = scoreTriagem(QUIZ_TRIAGEM, answers);

    await supabase
      .from("tokens")
      .update({ profile_id: profileId, triaged: true, triaged_at: new Date().toISOString() })
      .eq("token", token);

    const { data: purchase } = await supabase
      .from("purchases")
      .select("user_id")
      .eq("id", tokenRow.purchase_id)
      .single();

    if (purchase) {
      await supabase.from("xp_events").insert({
        user_id: purchase.user_id,
        xp_amount: 50,
        action_type: "triagem",
        reference_id: token,
      });
    }

    return NextResponse.json({ profileId });
  }

  const score = body.score as number;
  const passed = body.passed as boolean;

  if (passed) {
    const { data: purchase } = await supabase
      .from("purchases")
      .select("user_id")
      .eq("id", tokenRow.purchase_id)
      .single();

    if (purchase) {
      await supabase.from("xp_events").insert({
        user_id: purchase.user_id,
        xp_amount: 100,
        action_type: "validacao",
        reference_id: token,
      });
    }
  }

  return NextResponse.json({ ok: true, score, passed });
}
```

- [ ] **Step 4: Rodar o teste para confirmar que passa**

Run: `npx vitest run src/app/api/quiz/route.test.ts`
Expected: PASS — 4 testes.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/quiz/
git commit -m "feat: rota unificada de quiz (triagem + validacao) em POST /api/quiz"
```

---

## Task 12: Mover `QuizValidacao.tsx` e criar o container client

**Files:**
- Modify: mover `src/components/QuizValidacao.tsx` → `src/components/quiz/QuizValidacao.tsx` (conteúdo idêntico, sem alterações de lógica)
- Modify: `src/data/quiz-llm-local.ts` → mover para `src/data/quiz-llm-local.ts` (já está no lugar certo, não precisa mover)
- Create: `src/components/quiz/QuizValidacaoContainer.tsx`

**Interfaces:**
- Consumes: `QuizValidacao` (já existente, import path atualizado)
- Produces: `QuizValidacaoContainer({ token: string })` — usado pela Task 14 (`dashboard/[token]/page.tsx`).

- [ ] **Step 1: Mover o componente para a subpasta `quiz/`**

Run:
```bash
mkdir -p src/components/quiz
git mv src/components/QuizValidacao.tsx src/components/quiz/QuizValidacao.tsx
```

Não altere o conteúdo do arquivo — ele já importa `@/data/quiz-llm-local`, que continua no mesmo lugar.

- [ ] **Step 2: Criar o container que conecta ao `/api/quiz`**

Create `src/components/quiz/QuizValidacaoContainer.tsx`:
```tsx
"use client";

import QuizValidacao from "./QuizValidacao";

interface Props {
  token: string;
}

export default function QuizValidacaoContainer({ token }: Props) {
  const handleComplete = async (score: number, passed: boolean) => {
    await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, quizType: "validacao", score, passed }),
    });
  };

  return <QuizValidacao token={token} onComplete={handleComplete} />;
}
```

- [ ] **Step 3: Verificar que compila**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: move QuizValidacao para components/quiz/ e adiciona container de integração com /api/quiz"
```

---

## Task 13: `GET /api/download` — download do ebook + XP + marca de reembolso

**Files:**
- Create: `src/app/api/download/route.ts`

**Interfaces:**
- Consumes: `getSupabaseServerClient` (Task 3), `isTokenExpired` (Task 4)
- Produces: rota `GET /api/download?token=...` — serve o conteúdo do ebook, marca `purchases.downloaded=true` e concede XP na primeira chamada.

- [ ] **Step 1: Implementar a rota**

Create `src/app/api/download/route.ts`:
```ts
import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isTokenExpired } from "@/lib/tokens";

const EBOOK_PATH = path.join(process.cwd(), "content", "ebooks", "ebook_llm_local_matrizcentral.md");

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "token é obrigatório" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { data: tokenRow } = await supabase
    .from("tokens")
    .select("valid_until, purchase_id")
    .eq("token", token)
    .maybeSingle();

  if (!tokenRow || isTokenExpired(tokenRow.valid_until)) {
    return NextResponse.json({ error: "token inválido ou expirado" }, { status: 404 });
  }

  const { data: purchase } = await supabase
    .from("purchases")
    .select("id, downloaded, user_id")
    .eq("id", tokenRow.purchase_id)
    .single();

  if (!purchase) {
    return NextResponse.json({ error: "compra não encontrada" }, { status: 404 });
  }

  if (!purchase.downloaded) {
    await supabase.from("purchases").update({ downloaded: true }).eq("id", purchase.id);
    await supabase.from("xp_events").insert({
      user_id: purchase.user_id,
      xp_amount: 25,
      action_type: "download",
      reference_id: purchase.id,
    });
  }

  const content = await readFile(EBOOK_PATH, "utf-8");

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": 'attachment; filename="llm-local.md"',
    },
  });
}
```

- [ ] **Step 2: Verificar que compila**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/download/
git commit -m "feat: rota de download do ebook com marca de reembolso e XP (GET /api/download)"
```

---

## Task 14: Dashboard personalizado (`/dashboard/[token]`)

**Files:**
- Create: `src/components/dashboard/RoadmapCard.tsx`
- Create: `src/app/dashboard/[token]/page.tsx`

**Interfaces:**
- Consumes: `getSupabaseServerClient` (Task 3), `isTokenExpired` (Task 4), `QuizValidacaoContainer` (Task 12)
- Produces: página `GET /dashboard/[token]`.

- [ ] **Step 1: Criar o card de roadmap**

Create `src/components/dashboard/RoadmapCard.tsx`:
```tsx
interface RoadmapWeek {
  title: string;
  items: string[];
}

interface Props {
  roadmap: Record<string, RoadmapWeek>;
}

export default function RoadmapCard({ roadmap }: Props) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Seu Roadmap</h2>
      <div className="space-y-4">
        {Object.entries(roadmap).map(([weekKey, week]) => (
          <div key={weekKey} className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold">{week.title}</h3>
            <ul className="text-sm text-gray-600 mt-2 space-y-1">
              {week.items.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Criar a página do dashboard**

Create `src/app/dashboard/[token]/page.tsx`:
```tsx
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isTokenExpired } from "@/lib/tokens";
import RoadmapCard from "@/components/dashboard/RoadmapCard";
import QuizValidacaoContainer from "@/components/quiz/QuizValidacaoContainer";

export default async function DashboardPage({ params }: { params: { token: string } }) {
  const supabase = getSupabaseServerClient();
  const { data: tokenRow } = await supabase
    .from("tokens")
    .select("*")
    .eq("token", params.token)
    .maybeSingle();

  if (!tokenRow || isTokenExpired(tokenRow.valid_until)) {
    return <p className="max-w-md mx-auto p-8 text-center">Token inválido ou expirado.</p>;
  }

  if (!tokenRow.triaged || !tokenRow.profile_id) {
    return (
      <p className="max-w-md mx-auto p-8 text-center">
        Complete primeiro a{" "}
        <a href={`/quiz/${params.token}`} className="text-blue-600 underline">
          triagem de perfil
        </a>
        .
      </p>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", tokenRow.profile_id)
    .single();

  if (!profile) {
    return <p className="max-w-md mx-auto p-8 text-center">Perfil não encontrado.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
        <h1 className="font-bold text-green-900">Seu perfil: {profile.name}</h1>
        <p className="text-green-800">{profile.description}</p>
      </div>

      <RoadmapCard roadmap={profile.study_roadmap} />

      <div className="bg-blue-50 p-6 rounded-lg">
        <h2 className="font-bold mb-2">Seu primeiro ebook</h2>
        <a
          href={`/api/download?token=${params.token}`}
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded"
        >
          📥 Baixar Ebook LLM Local
        </a>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Quiz de Validação</h2>
        <QuizValidacaoContainer token={params.token} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verificar que compila**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/ src/app/dashboard/
git commit -m "feat: dashboard personalizado com roadmap, download e quiz de validação"
```

---

## Task 15: Landing page (`(marketing)`)

**Files:**
- Create: `src/components/marketing/Hero.tsx`
- Create: `src/components/marketing/PricingSection.tsx`
- Create: `src/app/(marketing)/layout.tsx`
- Create: `src/app/(marketing)/page.tsx`
- Modify: `src/app/page.tsx` (remove o boilerplate do `create-next-app`; o grupo de rotas `(marketing)` assume a home)

**Interfaces:**
- Consumes: `PRODUTO_1` (Task 7)
- Produces: página `GET /` com CTA de compra chamando `POST /api/checkout`.

**Nota de escopo:** o spec listava também `ProductCard.tsx` e `FAQ.tsx` na estrutura de pastas. Com um único produto ativo (Produto 1) e sem copy de FAQ ainda escrita, esses dois componentes não agregam valor nesta fase — `ProductCard` só se justifica com múltiplos produtos lado a lado, e `FAQ` exige conteúdo que ainda não existe. Ambos ficam para quando o catálogo crescer (Fase 4+), sem quebrar a estrutura já definida.

- [ ] **Step 1: Remover o boilerplate gerado pelo create-next-app**

Run:
```bash
rm src/app/page.tsx
```

- [ ] **Step 2: Criar o componente Hero com o CTA de compra**

Create `src/components/marketing/Hero.tsx`:
```tsx
"use client";

import { useState } from "react";

export default function Hero() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!email) {
      setError("Informe seu e-mail para continuar.");
      return;
    }

    setLoading(true);
    setError(null);

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      setLoading(false);
      setError("Não foi possível iniciar o checkout. Tente novamente.");
      return;
    }

    const { url } = await response.json();
    window.location.href = url;
  };

  return (
    <section className="max-w-3xl mx-auto px-6 py-20 text-center">
      <h1 className="text-4xl font-bold mb-4">
        Construa Seu Próprio ChatGPT Particular em Poucos Minutos
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        O Guia Definitivo para Rodar LLMs Localmente e Nunca Mais Pagar por
        Tokens ou Mensalidades.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
        <input
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-3"
        />
        <button
          type="button"
          onClick={handleCheckout}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold disabled:opacity-50"
        >
          {loading ? "Redirecionando..." : "Quero por R$47"}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

      <p className="text-sm text-gray-500 mt-4">
        Pare de Pagar por IA — Monte sua própria IA Local em menos de uma hora.
      </p>
    </section>
  );
}
```

- [ ] **Step 3: Criar a seção de preço**

Create `src/components/marketing/PricingSection.tsx`:
```tsx
export default function PricingSection() {
  return (
    <section className="max-w-2xl mx-auto px-6 py-12 text-center border-t">
      <h2 className="text-2xl font-bold mb-4">O que você recebe</h2>
      <ul className="text-left inline-block space-y-2 text-gray-700">
        <li>✅ Ebook completo (9 capítulos) sobre rodar LLMs localmente</li>
        <li>✅ Triagem de perfil personalizada</li>
        <li>✅ Roadmap de estudo sob medida para o seu perfil</li>
        <li>✅ Um segundo ebook grátis, escolhido pelo seu perfil</li>
        <li>✅ Quiz de validação com certificado de conclusão</li>
      </ul>
      <p className="text-3xl font-bold mt-6">R$47</p>
      <p className="text-sm text-gray-500">Pagamento único via PIX, cartão ou boleto</p>
    </section>
  );
}
```

- [ ] **Step 4: Criar o layout e a página do grupo `(marketing)`**

Create `src/app/(marketing)/layout.tsx`:
```tsx
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <main>{children}</main>;
}
```

Create `src/app/(marketing)/page.tsx`:
```tsx
import Hero from "@/components/marketing/Hero";
import PricingSection from "@/components/marketing/PricingSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <PricingSection />
    </>
  );
}
```

- [ ] **Step 5: Rodar o build de produção para garantir que a home resolve sem conflito de rotas**

Run: `npm run build`
Expected: build conclui sem erro de rota duplicada para `/` (o `(marketing)/page.tsx` é o único candidato agora que `src/app/page.tsx` foi removido).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: landing page do Produto 1 com CTA de checkout"
```

---

## Verificação final manual (não automatizada)

Depois da Task 15, com `.env.local` preenchido com credenciais reais de teste (Supabase, Stripe test mode, Brevo):

1. `npm run dev`
2. Rodar `stripe listen --forward-to localhost:3000/api/webhooks/stripe` (Stripe CLI) e, em outro terminal, `stripe trigger checkout.session.completed`
3. Confirmar no Supabase Table Editor que `users`, `purchases`, `tokens` e `xp_events` foram populados
4. Abrir `/quiz/<token gerado>` no navegador, responder as 20 perguntas, confirmar redirecionamento para `/dashboard/<token>`
5. No dashboard, clicar em baixar o ebook e confirmar que `purchases.downloaded` vira `true`
6. Completar o quiz de validação e confirmar o evento de XP em `xp_events`
