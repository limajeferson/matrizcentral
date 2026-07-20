# Leitor Protegido — Plano de Implementação

> **Para executores:** REQUIRED SUB-SKILL: `superpowers:subagent-driven-development`.
> Spec: [`spec.md`](spec.md) · Política: [`politica-reembolso.md`](politica-reembolso.md).
> **Um commit por task.**

**Goal:** Substituir o download do ebook por um leitor server-side (ebook +
relatórios) com posição salva, acesso revogável e livro-razão de consumo.

**Architecture:** `/biblioteca/[slug]` é server component: resolve sessão → checa
acesso → lê markdown do disco → corta em seções (`##`) → renderiza **só a seção
corrente**. O markdown bruto nunca vai ao cliente. Posição em `reading_progress`
(sobrescreve), auditoria em `reading_events` (append-only).

**Tech Stack:** Next.js App Router (server components), TypeScript, Supabase
(service-role, RLS default-deny), Tailwind com tokens semânticos, vitest node-env.

## Global Constraints (verbatim)

- **Custo zero:** sem dependência npm nova; sem asset externo.
- **Dark-aware desde o nascimento:** tokens semânticos (`bg-card`,
  `text-foreground`, `text-muted-foreground`, `border-border`). Nunca cor clara fixa.
- **pt-BR** em toda copy e mensagem de erro.
- **Gate por task:** `npx tsc --noEmit` (exit 0) + `npm run test` + `npx next lint`
  sem erros. `npm run build` falha por falta de `STRIPE_SECRET_KEY` — é
  pré-existente, ignorar.
- **Fail-closed:** qualquer erro de banco na decisão de acesso → **nega**.
- **NÃO** bloquear menu de contexto, seleção de texto ou atalhos.
- Migration `0027` está reservada para o fórum (Trilha D) → esta frente usa **`0028`**.
- Nunca commitar `CLAUDE.local-draft.md`, `SETUP.md`, `claude-chat.md`, `erro.png`.

---

### Task 1 — `reader.ts`: cortar markdown em seções (puro, TDD)

**Files:**
- Create: `src/lib/reader.ts`
- Test: `src/lib/reader.test.ts`

**Interfaces:**
- Consumes: `parseMarkdown`, `slugify`, tipos `MdBlock`/`MdHeading` de `src/lib/markdown.ts`.
- Produces:
  ```ts
  export type ReaderSection = { index: number; slug: string; title: string; blocks: MdBlock[] };
  export function splitIntoSections(blocks: MdBlock[]): ReaderSection[];
  export function findSection(sections: ReaderSection[], slug?: string): ReaderSection | null;
  ```

- [ ] **Step 1: Escrever os testes que falham**

```ts
// src/lib/reader.test.ts
import { describe, it, expect } from "vitest";
import { parseMarkdown } from "./markdown";
import { splitIntoSections, findSection } from "./reader";

describe("splitIntoSections", () => {
  it("corta por heading nivel 2 e preserva o titulo", () => {
    const s = splitIntoSections(parseMarkdown("## Um\ntexto a\n\n## Dois\ntexto b"));
    expect(s.map((x) => x.title)).toEqual(["Um", "Dois"]);
    expect(s.map((x) => x.index)).toEqual([0, 1]);
    expect(s[0].slug).toBe("um");
  });

  it("coloca conteudo antes do primeiro ## numa secao de abertura", () => {
    const s = splitIntoSections(parseMarkdown("# Titulo\nintro\n\n## Um\ntexto"));
    expect(s).toHaveLength(2);
    expect(s[0].index).toBe(0);
    expect(s[1].title).toBe("Um");
  });

  it("documento sem ## vira uma unica secao", () => {
    const s = splitIntoSections(parseMarkdown("# So titulo\num paragrafo"));
    expect(s).toHaveLength(1);
    expect(s[0].index).toBe(0);
  });

  it("documento vazio devolve lista vazia", () => {
    expect(splitIntoSections(parseMarkdown(""))).toEqual([]);
  });

  it("desambigua slugs repetidos", () => {
    const s = splitIntoSections(parseMarkdown("## Setup\na\n\n## Setup\nb"));
    expect(s[0].slug).not.toBe(s[1].slug);
    expect(new Set(s.map((x) => x.slug)).size).toBe(2);
  });

  it("h3 e h4 ficam DENTRO da secao, nao criam secao nova", () => {
    const s = splitIntoSections(parseMarkdown("## Um\n### Sub\ntexto\n#### Sub2"));
    expect(s).toHaveLength(1);
    expect(s[0].blocks.length).toBeGreaterThan(1);
  });
});

describe("findSection", () => {
  const sections = splitIntoSections(parseMarkdown("## Um\na\n\n## Dois\nb"));

  it("sem slug devolve a primeira", () => {
    expect(findSection(sections, undefined)?.index).toBe(0);
  });

  it("slug desconhecido devolve a primeira (nao quebra link velho)", () => {
    expect(findSection(sections, "nao-existe")?.index).toBe(0);
  });

  it("acha pelo slug", () => {
    expect(findSection(sections, "dois")?.index).toBe(1);
  });

  it("lista vazia devolve null", () => {
    expect(findSection([], "um")).toBeNull();
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/lib/reader.test.ts`
Expected: FAIL — `Failed to resolve import "./reader"`.

- [ ] **Step 3: Implementar**

```ts
// src/lib/reader.ts
import { slugify, type MdBlock } from "./markdown";

export type ReaderSection = { index: number; slug: string; title: string; blocks: MdBlock[] };

/** Corta os blocos em seções por heading de nível 2. Conteúdo antes do primeiro
 *  `##` vira a seção de abertura (índice 0). Slugs repetidos são desambiguados. */
export function splitIntoSections(blocks: MdBlock[]): ReaderSection[] {
  const sections: ReaderSection[] = [];
  const used = new Map<string, number>();

  const push = (title: string, initial: MdBlock[]) => {
    const base = slugify(title) || `secao-${sections.length + 1}`;
    const n = (used.get(base) ?? 0) + 1;
    used.set(base, n);
    sections.push({
      index: sections.length,
      slug: n === 1 ? base : `${base}-${n}`,
      title,
      blocks: initial,
    });
  };

  for (const b of blocks) {
    if (b.kind === "heading" && b.level === 2) {
      push(b.text, [b]);
      continue;
    }
    if (sections.length === 0) {
      const title = b.kind === "heading" ? b.text : "Início";
      push(title, [b]);
      continue;
    }
    sections[sections.length - 1].blocks.push(b);
  }
  return sections;
}

/** Resolve a seção pedida. Slug ausente ou desconhecido → primeira seção
 *  (link antigo nunca vira erro). Lista vazia → null. */
export function findSection(sections: ReaderSection[], slug?: string): ReaderSection | null {
  if (sections.length === 0) return null;
  if (!slug) return sections[0];
  return sections.find((s) => s.slug === slug) ?? sections[0];
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/lib/reader.test.ts` → PASS (14 testes).
Depois o gate completo: `npx tsc --noEmit && npm run test && npx next lint`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/reader.ts src/lib/reader.test.ts
git commit -m "feat(leitor): reader.ts puro (corte em secoes, resolucao por slug)"
```

---

### Task 2 — Migration `0028` + registro de documentos

**Files:**
- Create: `supabase/migrations/0028_reading_progress.sql`
- Create: `src/data/reader-docs.ts`

**Interfaces:**
- Produces:
  ```ts
  export type ReaderDoc = {
    slug: string; contentId: string; title: string; bodyPath: string;
    kind: "ebook" | "relatorio"; startIncluded: boolean;
  };
  export const READER_DOCS: ReaderDoc[];
  export function findDoc(slug: string): ReaderDoc | undefined;
  ```

- [ ] **Step 1: Escrever a migration**

```sql
-- supabase/migrations/0028_reading_progress.sql
-- Leitor protegido: retomada (produto) e livro-razão de consumo (auditoria).

-- Retomada: uma linha por (usuário, conteúdo). Sobrescreve.
create table if not exists reading_progress (
  user_id uuid not null references users(id) on delete cascade,
  content_id text not null,
  section_slug text not null,
  section_index int not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, content_id)
);

-- Auditoria: append-only. É a prova de consumo (garantia comercial + chargeback).
-- NUNCA sofre update/delete.
create table if not exists reading_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  content_id text not null,
  section_slug text not null,
  section_index int not null,
  created_at timestamptz not null default now()
);

create index if not exists reading_events_user_content_idx
  on reading_events (user_id, content_id, created_at desc);

alter table reading_progress enable row level security;
alter table reading_events enable row level security;
-- Sem policies: default-deny. Acesso só via service role (server-side).
```

- [ ] **Step 2: Aplicar no Supabase remoto**

Aplicar via SQL Editor no navegador (método no `CLAUDE.md`: injetar via
`monaco.editor.getModels()` + `setValue` + Run). **Verificar** em seguida:

```sql
select tablename, relrowsecurity from pg_tables t
  join pg_class c on c.relname = t.tablename
  where tablename in ('reading_progress','reading_events');
```
Expected: 2 linhas, `relrowsecurity = true` nas duas.

- [ ] **Step 3: Criar o registro de documentos**

O ebook **não está** no `CONTENT_HUB` (que só tem relatorio/podcast/video/pesquisa).
Este registro é a ponte slug → arquivo → regra de acesso.

```ts
// src/data/reader-docs.ts
import { CONTENT_HUB } from "./content-hub";

export type ReaderDoc = {
  slug: string;
  contentId: string;
  title: string;
  /** Caminho relativo à raiz do projeto. */
  bodyPath: string;
  kind: "ebook" | "relatorio";
  /** true = incluído no nível "view" (qualquer comprador). */
  startIncluded: boolean;
};

const EBOOK: ReaderDoc = {
  slug: "guia-llm-local",
  contentId: "ebook-llm-local",
  title: "Guia Prático de LLMs Locais",
  bodyPath: "content/ebooks/ebook_llm_local_matrizcentral.md",
  kind: "ebook",
  startIncluded: true, // era o entregável do R$47 (antes via download)
};

const RELATORIOS: ReaderDoc[] = CONTENT_HUB.filter(
  (c): c is typeof c & { bodyPath: string } => c.type === "relatorio" && !!c.bodyPath,
).map((c) => ({
  slug: c.id,
  contentId: c.id,
  title: c.title,
  bodyPath: c.bodyPath,
  kind: "relatorio" as const,
  startIncluded: c.startIncluded === true,
}));

export const READER_DOCS: ReaderDoc[] = [EBOOK, ...RELATORIOS];

export function findDoc(slug: string): ReaderDoc | undefined {
  return READER_DOCS.find((d) => d.slug === slug);
}
```

- [ ] **Step 4: Gate**

Run: `npx tsc --noEmit && npm run test && npx next lint` → tudo limpo.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/0028_reading_progress.sql src/data/reader-docs.ts
git commit -m "feat(leitor): migration 0028 (reading_progress + reading_events) e registro de documentos"
```

---

### Task 3 — Acesso e persistência (`reader-data.ts`)

**Files:**
- Create: `src/lib/reader-data.ts`
- Test: `src/lib/reader-data.test.ts`

**Interfaces:**
- Consumes: `getSupabaseServerClient`, `tryConsume` (`entitlement-access.ts`),
  `ReaderDoc` (`reader-docs.ts`).
- Produces:
  ```ts
  export type ReadDecision = { allowed: boolean; reason: string };
  export function canRead(userId: string, doc: ReaderDoc): Promise<ReadDecision>;
  export function getProgress(userId: string, contentId: string): Promise<{ slug: string; index: number } | null>;
  export function recordRead(userId: string, contentId: string, slug: string, index: number): Promise<void>;
  ```

**Regra de acesso (nesta ordem):**
1. Se **todas** as compras do usuário estão `refunded`/`disputed` → `{allowed:false, reason:"revoked"}`.
   **É isto que torna a revogação real.**
2. Erro de banco em qualquer ponto → `{allowed:false, reason:"error"}` (fail-closed).
3. `kind === "ebook"` → exige ao menos uma compra com `status = 'paid'`.
4. `kind === "relatorio"` → delega a `tryConsume(userId, contentId, startIncluded)`.

- [ ] **Step 1: Escrever os testes que falham**

Seguir o padrão de mock de `src/lib/entitlement-access.test.ts` (`buildSupabaseMock`).

```ts
// src/lib/reader-data.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFrom = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: () => ({ from: mockFrom }),
}));
const mockTryConsume = vi.fn();
vi.mock("./entitlement-access", () => ({ tryConsume: (...a: unknown[]) => mockTryConsume(...a) }));

import { canRead } from "./reader-data";
import type { ReaderDoc } from "@/data/reader-docs";

const EBOOK: ReaderDoc = {
  slug: "guia", contentId: "ebook-llm-local", title: "Guia",
  bodyPath: "x.md", kind: "ebook", startIncluded: true,
};
const RELATORIO: ReaderDoc = { ...EBOOK, contentId: "rel-1", kind: "relatorio" };

/** Mock de `from("purchases").select(...).eq(...)` devolvendo `rows`. */
function mockPurchases(rows: { status: string }[] | null, error: unknown = null) {
  mockFrom.mockReturnValue({
    select: () => ({ eq: () => Promise.resolve({ data: rows, error }) }),
  });
}

beforeEach(() => {
  mockFrom.mockReset();
  mockTryConsume.mockReset();
});

describe("canRead", () => {
  it("nega quando todas as compras foram reembolsadas (revogacao real)", async () => {
    mockPurchases([{ status: "refunded" }]);
    expect(await canRead("u1", EBOOK)).toEqual({ allowed: false, reason: "revoked" });
  });

  it("nega quando a compra virou disputa", async () => {
    mockPurchases([{ status: "disputed" }]);
    expect((await canRead("u1", EBOOK)).allowed).toBe(false);
  });

  it("libera o ebook com uma compra paga", async () => {
    mockPurchases([{ status: "paid" }]);
    expect(await canRead("u1", EBOOK)).toEqual({ allowed: true, reason: "purchase" });
  });

  it("libera o ebook se ao menos UMA compra segue paga (reembolso parcial do historico)", async () => {
    mockPurchases([{ status: "refunded" }, { status: "paid" }]);
    expect((await canRead("u1", EBOOK)).allowed).toBe(true);
  });

  it("nega quando nao ha compra nenhuma", async () => {
    mockPurchases([]);
    expect((await canRead("u1", EBOOK)).allowed).toBe(false);
  });

  it("fail-closed: erro de banco nega", async () => {
    mockPurchases(null, { message: "boom" });
    expect(await canRead("u1", EBOOK)).toEqual({ allowed: false, reason: "error" });
  });

  it("relatorio delega a tryConsume", async () => {
    mockPurchases([{ status: "paid" }]);
    mockTryConsume.mockResolvedValue({ allowed: true, reason: "advanced" });
    expect(await canRead("u1", RELATORIO)).toEqual({ allowed: true, reason: "advanced" });
    expect(mockTryConsume).toHaveBeenCalledWith("u1", "rel-1", true);
  });

  it("relatorio: revogacao vence tryConsume", async () => {
    mockPurchases([{ status: "refunded" }]);
    mockTryConsume.mockResolvedValue({ allowed: true, reason: "advanced" });
    expect((await canRead("u1", RELATORIO)).reason).toBe("revoked");
    expect(mockTryConsume).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/lib/reader-data.test.ts` → FAIL (módulo não existe).

- [ ] **Step 3: Implementar**

```ts
// src/lib/reader-data.ts
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { tryConsume } from "./entitlement-access";
import type { ReaderDoc } from "@/data/reader-docs";

export type ReadDecision = { allowed: boolean; reason: string };

const REVOKED = new Set(["refunded", "disputed"]);

export async function canRead(userId: string, doc: ReaderDoc): Promise<ReadDecision> {
  const supabase = getSupabaseServerClient();
  const { data: purchases, error } = await supabase
    .from("purchases").select("status").eq("user_id", userId);

  // Fail-closed: sem leitura confiável do estado da compra, não libera.
  if (error || !purchases) {
    console.error("canRead: falha ao ler purchases", error);
    return { allowed: false, reason: "error" };
  }

  const active = purchases.filter((p) => !REVOKED.has(p.status));
  // Tinha compra, e toda ela foi revogada → acesso revogado (não "sem compra").
  if (purchases.length > 0 && active.length === 0) {
    return { allowed: false, reason: "revoked" };
  }
  if (active.length === 0) return { allowed: false, reason: "no-purchase" };

  if (doc.kind === "ebook") {
    return active.some((p) => p.status === "paid")
      ? { allowed: true, reason: "purchase" }
      : { allowed: false, reason: "no-purchase" };
  }
  return tryConsume(userId, doc.contentId, doc.startIncluded);
}

export async function getProgress(
  userId: string, contentId: string,
): Promise<{ slug: string; index: number } | null> {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("reading_progress").select("section_slug, section_index")
    .eq("user_id", userId).eq("content_id", contentId).maybeSingle();
  return data ? { slug: data.section_slug, index: data.section_index } : null;
}

/** Grava retomada (upsert) e o evento de auditoria (append-only).
 *  Falha aqui NUNCA bloqueia a leitura — só registra. */
export async function recordRead(
  userId: string, contentId: string, slug: string, index: number,
): Promise<void> {
  const supabase = getSupabaseServerClient();
  const row = { user_id: userId, content_id: contentId, section_slug: slug, section_index: index };
  const [{ error: pErr }, { error: eErr }] = await Promise.all([
    supabase.from("reading_progress").upsert(
      { ...row, updated_at: new Date().toISOString() },
      { onConflict: "user_id,content_id" },
    ),
    supabase.from("reading_events").insert(row),
  ]);
  if (pErr) console.error("recordRead: progresso", pErr);
  if (eErr) console.error("recordRead: evento", eErr);
}
```

- [ ] **Step 4: Rodar e ver passar** → 8 testes PASS. Depois o gate completo.

- [ ] **Step 5: Commit**

```bash
git add src/lib/reader-data.ts src/lib/reader-data.test.ts
git commit -m "feat(leitor): acesso revogavel (fail-closed) + progresso e livro-razao de leitura"
```

---

### Task 4 — A tela do leitor

**Files:**
- Create: `src/app/biblioteca/[slug]/page.tsx`
- Create: `src/components/reader/ReaderShell.tsx`
- Create: `src/components/reader/ReaderToc.tsx`
- Create: `src/components/reader/Watermark.tsx`

**Interfaces:**
- Consumes: `getSessionUser`, `findDoc`, `canRead`/`getProgress` (Task 3),
  `splitIntoSections`/`findSection` (Task 1), `parseMarkdown`, `Markdown.tsx`.

**Comportamento do server component:**
1. `getSessionUser()` → sem sessão: `redirect("/entrar?next=/biblioteca/<slug>")`.
2. `findDoc(slug)` → não achou: `notFound()`.
3. `canRead()` → negado: tela explicando o motivo (`revoked` tem copy própria,
   sóbria, com link para o suporte). **Nunca** vazar detalhe interno.
4. Ler o arquivo com `readFile(path.join(process.cwd(), doc.bodyPath), "utf-8")`.
5. `splitIntoSections(parseMarkdown(source))` e `findSection(sections, searchParams.s)`.
6. Renderizar **só** `section.blocks`. Passar ao cliente apenas a lista
   `{slug,title,index}` para o sumário — **nunca** os blocos das outras seções.

- [ ] **Step 1: Server component**

Pontos obrigatórios:
- `export const dynamic = "force-dynamic";` (depende de sessão).
- Progresso lido via `getProgress`; se existir e `searchParams.s` estiver ausente
  **e** o progresso não for a seção 0, renderizar o aviso de retomada com dois
  links: *"Continuar de <título>"* e *"Começar do início"*. **Não** teleportar
  automaticamente — desorienta.

- [ ] **Step 2: `ReaderShell.tsx`**

Layout dark-aware (tokens semânticos, **nenhuma** cor clara fixa):
- Cabeçalho: título do documento + progresso textual ("Seção 4 de 18") + barra
  (`bg-muted` / preenchimento `bg-violet-600`, `role="progressbar"` com
  `aria-valuenow/min/max`).
- Corpo: `<Markdown blocks={section.blocks} />`.
- Rodapé: anterior/próxima como `<Link>` para `?s=<slug>` (navegação real, funciona
  sem JS e é indexável no histórico). Desabilitar nos limites.
- Mobile-first: sumário vira sheet acionado por botão; alvos ≥ 44px.

- [ ] **Step 3: `ReaderToc.tsx`**

Lista de `{slug,title,index}` com a seção corrente marcada
(`aria-current="step"`). Desktop: coluna lateral fixa. Mobile: sheet.

- [ ] **Step 4: `Watermark.tsx`**

Rodapé discreto por seção: `text-xs text-muted-foreground/60`, com o e-mail do
comprador e um código curto. Legível, não intrusivo, **não** `position: fixed`
sobre o texto.

- [ ] **Step 5: Gate + verificação ao vivo**

`npx tsc --noEmit && npm run test && npx next lint`, e rodar
`npm run dev -- -p 3000`:
- `/biblioteca/guia-llm-local` logado: seção 1 renderiza, sumário lista todas,
  anterior/próxima navegam.
- **Dark e claro** (toggle do UserMenu).
- **Mobile** (DevTools 390px): sheet abre, texto legível, sem scroll horizontal.
- Teclado: Tab alcança sumário e navegação; foco visível.
- **View-source: o markdown das outras seções NÃO está no HTML.**

- [ ] **Step 6: Commit**

```bash
git add src/app/biblioteca src/components/reader
git commit -m "feat(leitor): tela do leitor (secao a secao, sumario, progresso, marca d'agua)"
```

---

### Task 5 — Registrar leitura e retomar

**Files:**
- Create: `src/app/api/leitura/route.ts`
- Create: `src/components/reader/ReadTracker.tsx`
- Modify: `src/components/reader/ReaderShell.tsx` (montar o tracker)

**Interfaces:**
- `POST /api/leitura` body `{ contentId: string, slug: string, index: number }`
  → `{ ok: true }`. Resolve o usuário **pela sessão** (nunca confia em `userId`
  do corpo). Aplica `createRateLimiter` (padrão da Trilha B).

- [ ] **Step 1: A rota**

```ts
// src/app/api/leitura/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-session";
import { recordRead } from "@/lib/reader-data";
import { findDoc } from "@/data/reader-docs";
import { createRateLimiter } from "@/lib/rate-limit";

// Uma seção a cada 2s por usuário: leitura humana passa; varredura sequencial não.
const limiter = createRateLimiter(2000);

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "não autenticado" }, { status: 401 });

    const body = await req.json().catch(() => null);
    const contentId = typeof body?.contentId === "string" ? body.contentId : null;
    const slug = typeof body?.slug === "string" ? body.slug : null;
    const index = Number.isInteger(body?.index) ? (body.index as number) : null;
    if (!contentId || !slug || index === null || index < 0) {
      return NextResponse.json({ error: "payload inválido" }, { status: 400 });
    }
    // Só aceita conteúdo que existe no registro — impede poluir o livro-razão.
    if (!findDoc(contentId) && !READER_CONTENT_IDS.has(contentId)) {
      return NextResponse.json({ error: "conteúdo desconhecido" }, { status: 400 });
    }
    if (!limiter.check(user.id, Date.now())) {
      return NextResponse.json({ ok: true }); // silencioso: não é erro do usuário
    }
    await recordRead(user.id, contentId, slug, index);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/leitura", e);
    return NextResponse.json({ error: "erro interno" }, { status: 500 });
  }
}
```

> **Nota ao implementador:** `findDoc` recebe *slug*, não *contentId*. Adicionar em
> `src/data/reader-docs.ts` um `export const READER_CONTENT_IDS = new Set(READER_DOCS.map(d => d.contentId));`
> e importá-lo aqui. Ajustar a condição para usar só o Set.

- [ ] **Step 2: `ReadTracker.tsx`**

Client component sem UI: `useEffect` dispara **um** POST ao montar (a seção já
está na tela — não há o que medir além disso). Sem `setInterval`, sem tracking de
scroll. Falha de rede é silenciosa (registrar leitura nunca pode atrapalhar ler).

- [ ] **Step 3: Aviso de retomada**

No server component da Task 4, quando há progresso e `searchParams.s` está
ausente e `progress.index > 0`, renderizar acima do conteúdo:

> Você parou em **<título da seção>**. [Continuar] [Começar do início]

Dispensável, discreto, com tokens semânticos.

- [ ] **Step 4: Gate + verificação ao vivo**

- Ler uma seção, sair, voltar em `/biblioteca/<slug>` → aviso de retomada aparece
  com a seção certa.
- "Continuar" leva à seção; "Começar do início" leva à primeira.
- No Supabase: `select * from reading_events order by created_at desc limit 5`
  → eventos com timestamp; `reading_progress` com **uma** linha por conteúdo.
- Avançar 5 seções rápido → `reading_progress` acompanha, sem erro na tela.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/leitura src/components/reader
git commit -m "feat(leitor): registra leitura (rate-limited) e retoma de onde parou"
```

---

### Task 6 — Aposentar o download + ponte de resgate

**Files:**
- Modify: `src/app/api/download/route.ts`
- Create: `src/app/entrar/resgate/page.tsx`
- Modify: `src/app/dashboard/[token]/page.tsx:199`

**Contexto crítico:** compradores atuais têm **token, não conta**. Remover o
download sem ponte quebra acesso de cliente pagante.

- [ ] **Step 1: `/api/download` responde 410**

Substituir o corpo por: valida o token como hoje; se válido, responde **410 Gone**
em JSON com mensagem em pt-BR explicando que o material agora é lido na plataforma
e um link para `/entrar/resgate?token=<token>`. Token inválido segue **404**.
**Não** deletar a rota — 404 mudo deixaria o cliente sem saída.
Remover o `readFile` e a constante `EBOOK_PATH`.

- [ ] **Step 2: Página de resgate**

`/entrar/resgate?token=<token>`:
1. Resolve o token → compra → `users.email`.
2. Token inválido/expirado: mensagem clara + link para `/suporte`.
3. Válido: cria a sessão para aquele usuário (`createSession`) e redireciona para
   `/biblioteca/guia-llm-local`.
4. **Uso único não se aplica** — o token já é a credencial existente do comprador;
   o que muda é que ele passa a ter sessão. Não invalidar o token aqui (o
   `/dashboard/[token]` ainda depende dele até a Trilha G).

- [ ] **Step 3: Repontar o botão do dashboard**

`src/app/dashboard/[token]/page.tsx:199`: trocar
`href={`/api/download?token=${params.token}`}` por
`href={`/entrar/resgate?token=${params.token}`}` e a copy do botão de
"Baixar" para **"Ler o guia"**.

- [ ] **Step 4: Gate + verificação ao vivo (obrigatória)**

- `/api/download?token=<válido>` → **410** com a mensagem e o link.
- `/api/download?token=lixo` → **404**.
- Abrir `/entrar/resgate?token=<válido>` deslogado → cria sessão → cai no leitor.
- Botão do dashboard leva ao leitor.
- `grep -rn "api/download" src/` → só a própria rota.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/download/route.ts src/app/entrar/resgate "src/app/dashboard/[token]/page.tsx"
git commit -m "feat(leitor): aposenta o download (410 + ponte de resgate para quem so tem token)"
```

---

## Ordem, dependências e riscos

- 1 → 2 → 3 → 4 → 5 → 6. **A Task 6 é a última de propósito:** só se remove o
  download depois que o leitor está no ar e verificado.
- **Migration antes do deploy:** a `0028` precisa estar aplicada no remoto antes
  de a Task 3 servir tráfego (mesmo erro de ordenação da Trilha B, onde o
  `ON CONFLICT` teria quebrado a produção).
- **Ponte obrigatória:** sem a Task 6 Step 2, comprador antigo fica sem acesso.

## Self-Review

- **Cobertura da spec:** seção como unidade (T1) ✓; tabelas separadas (T2) ✓;
  revogação real + fail-closed (T3) ✓; markdown nunca inteiro no cliente (T4
  Step 5) ✓; posição salva e retomada avisada (T5) ✓; download aposentado com
  ponte (T6) ✓; marca d'água (T4) ✓; sem bloqueio de menu/seleção ✓;
  dark-aware e mobile em todo componente ✓.
- **Consistência de tipos:** `ReaderSection`/`findSection` (T1) usados em T4;
  `ReaderDoc`/`findDoc` (T2) em T3 e T4; `canRead`/`getProgress`/`recordRead`
  (T3) em T4 e T5. Nomes batem entre tasks.
- **Fora do escopo (specs próprias):** fluxo de reembolso; quiz de
  validação/certificado; proteção de podcast/vídeo.
