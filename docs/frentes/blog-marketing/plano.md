# Blog + Marketing (MVP) — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use `- [ ]`.

**Goal:** Blog público (`/blog` + `/blog/[slug]`, SEO + CTA de funil, posts em markdown) + documento de estratégia de marketing (calendário/sazonalidade/funil).

**Architecture:** Manifesto tipado (`src/data/blog.ts`) + markdown em `content/blog/`; lógica pura (`blog.ts`) testada; renderer markdown compartilhado; páginas server com `generateMetadata`. Sem DB, sem gating (topo de funil).

## Global Constraints
- Custo zero. pt-BR. Gate: `tsc` 0 + `npm run test`. `npm run build` falha sem STRIPE_SECRET_KEY (pré-existente).
- Blog é **público** (sem login/entitlement). Sem migration.

## File Structure
**Criar:** `src/data/blog.ts`; `content/blog/por-que-ia-local.md`, `content/blog/quanto-hardware.md`; `src/lib/blog.ts`(+test); `src/components/ui/Markdown.tsx`; `src/app/blog/page.tsx`; `src/app/blog/[slug]/page.tsx`; `docs/frentes/blog-marketing/marketing.md`.
**Modificar:** `src/app/dashboard/[token]/conteudo/[id]/page.tsx` (usar o Markdown extraído); header/footer (link `/blog`).

---

## Task 1: manifesto + posts-semente + `blog.ts` puro (TDD)

**Files:** Create `src/data/blog.ts`, `content/blog/por-que-ia-local.md`, `content/blog/quanto-hardware.md`, `src/lib/blog.ts`, `src/lib/blog.test.ts`.

- [ ] **Step 1: manifesto** — Create `src/data/blog.ts`:
```ts
export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO
  author: string;
  bodyPath: string;
  tags?: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "por-que-ia-local",
    title: "Por que rodar IA localmente (e parar de pagar mensalidade)",
    excerpt: "Privacidade, custo e controle: o caso a favor de rodar modelos de IA no seu próprio computador.",
    date: "2026-07-01",
    author: "Matriz Central",
    bodyPath: "content/blog/por-que-ia-local.md",
    tags: ["ia-local", "privacidade", "custo"],
  },
  {
    slug: "quanto-hardware",
    title: "Quanto de hardware você precisa para rodar IA local",
    excerpt: "De CPU comum a GPU dedicada: o que dá pra rodar em cada faixa de máquina.",
    date: "2026-07-08",
    author: "Matriz Central",
    bodyPath: "content/blog/quanto-hardware.md",
    tags: ["hardware", "ia-local"],
  },
];
```

- [ ] **Step 2: posts-semente** — Create `content/blog/por-que-ia-local.md` (markdown pt-BR, ~10-15 linhas, headings `#`/`##`, listas `- `, temas: privacidade, fim de mensalidade, controle; fechar com um convite a aprender mais). Create `content/blog/quanto-hardware.md` (similar; faixas: só CPU/notebook, Apple Silicon, GPU dedicada; o que cada uma roda). Conteúdo autoral, sem inventar dados específicos como se fossem fato.

- [ ] **Step 3: teste puro** — Create `src/lib/blog.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { getSortedPosts, getPostBySlug } from "./blog";
import type { BlogPost } from "@/data/blog";

const posts: BlogPost[] = [
  { slug: "a", title: "A", excerpt: "", date: "2026-01-01", author: "x", bodyPath: "" },
  { slug: "b", title: "B", excerpt: "", date: "2026-03-01", author: "x", bodyPath: "" },
];

describe("getSortedPosts", () => {
  it("ordena por data desc", () => {
    expect(getSortedPosts(posts).map((p) => p.slug)).toEqual(["b", "a"]);
  });
});
describe("getPostBySlug", () => {
  it("acha", () => expect(getPostBySlug(posts, "a")?.title).toBe("A"));
  it("não acha → undefined", () => expect(getPostBySlug(posts, "z")).toBeUndefined());
});
```

- [ ] **Step 4:** `npm run test -- blog` → FAIL.
- [ ] **Step 5: implementar** — Create `src/lib/blog.ts`:
```ts
import type { BlogPost } from "@/data/blog";

export function getSortedPosts(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(posts: BlogPost[], slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}
```

- [ ] **Step 6:** `npm run test -- blog` → PASS.
- [ ] **Step 7: commit** — `git add src/data/blog.ts content/blog src/lib/blog.ts src/lib/blog.test.ts && git commit -m "feat(blog): manifesto + posts-semente + logica pura"`

---

## Task 2: extrair `Markdown` compartilhado

**Files:** Create `src/components/ui/Markdown.tsx`; Modify `src/app/dashboard/[token]/conteudo/[id]/page.tsx`.

**Interfaces — Produces:** `<Markdown source={string} />` (o mesmo render line-based que já existe na página de conteúdo).

- [ ] **Step 1:** Create `src/components/ui/Markdown.tsx` movendo a função `renderMarkdown` (de `conteudo/[id]/page.tsx`) para um componente:
```tsx
export default function Markdown({ source }: { source: string }) {
  return (
    <div>
      {source.split("\n").map((line, index) => {
        if (line.startsWith("# ")) return <h1 key={index} className="mt-6 text-2xl font-bold text-zinc-900">{line.slice(2)}</h1>;
        if (line.startsWith("## ")) return <h2 key={index} className="mt-5 text-xl font-bold text-zinc-900">{line.slice(3)}</h2>;
        if (line.startsWith("### ")) return <h3 key={index} className="mt-4 text-lg font-semibold text-zinc-900">{line.slice(4)}</h3>;
        if (line.startsWith("- ")) return <li key={index} className="ml-5 list-disc text-zinc-700">{line.slice(2)}</li>;
        if (line.trim() === "") return null;
        return <p key={index} className="mt-2 text-zinc-700">{line}</p>;
      })}
    </div>
  );
}
```

- [ ] **Step 2:** em `src/app/dashboard/[token]/conteudo/[id]/page.tsx`, remover a função local `renderMarkdown` e o seu uso; importar `Markdown` e trocar `<div>{renderMarkdown(body)}</div>` por `<Markdown source={body} />`. Não mudar mais nada.

- [ ] **Step 3:** `npx tsc --noEmit` → exit 0.
- [ ] **Step 4: commit** — `git add "src/components/ui/Markdown.tsx" "src/app/dashboard/[token]/conteudo/[id]/page.tsx" && git commit -m "refactor: extrai componente Markdown compartilhado"`

---

## Task 3: páginas `/blog` e `/blog/[slug]`

**Files:** Create `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`.

- [ ] **Step 1: /blog** — Create `src/app/blog/page.tsx`:
```tsx
import { BLOG_POSTS } from "@/data/blog";
import { getSortedPosts } from "@/lib/blog";

export const metadata = { title: "Blog — Matriz Central", description: "Artigos sobre IA local: privacidade, custo, hardware e como sair das mensalidades." };

export default function BlogPage() {
  const posts = getSortedPosts(BLOG_POSTS);
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Blog</h1>
      <ul className="space-y-4">
        {posts.map((p) => (
          <li key={p.slug} className="rounded-xl border border-zinc-200 bg-white p-4">
            <a href={`/blog/${p.slug}`} className="text-lg font-semibold text-zinc-900 hover:text-violet-600">{p.title}</a>
            <p className="mt-1 text-sm text-zinc-600">{p.excerpt}</p>
            <p className="mt-2 text-xs text-zinc-400">{new Date(p.date).toLocaleDateString("pt-BR")} · {p.author}</p>
          </li>
        ))}
        {posts.length === 0 && <p className="text-sm text-zinc-500">Em breve, novos artigos.</p>}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: /blog/[slug]** — Create `src/app/blog/[slug]/page.tsx`:
```tsx
import { readFile } from "fs/promises";
import path from "path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BLOG_POSTS } from "@/data/blog";
import { getPostBySlug } from "@/lib/blog";
import Markdown from "@/components/ui/Markdown";

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPostBySlug(BLOG_POSTS, params.slug);
  if (!post) return { title: "Artigo não encontrado — Matriz Central" };
  return { title: `${post.title} — Matriz Central`, description: post.excerpt };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(BLOG_POSTS, params.slug);
  if (!post) notFound();

  let body = "";
  try { body = await readFile(path.join(process.cwd(), post.bodyPath), "utf-8"); } catch { body = post.excerpt; }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <article>
        <h1 className="text-2xl font-bold text-zinc-900">{post.title}</h1>
        <p className="mt-1 text-xs text-zinc-400">{new Date(post.date).toLocaleDateString("pt-BR")} · {post.author}</p>
        <div className="mt-4"><Markdown source={body} /></div>
      </article>
      <div className="rounded-xl border border-violet-200 bg-violet-50 p-5 text-center">
        <p className="font-semibold text-zinc-900">Quer sair das mensalidades de IA?</p>
        <p className="mt-1 text-sm text-zinc-600">Descubra seu roadmap de IA local por R$47 — pagamento único.</p>
        <a href="/oferta" className="mt-3 inline-block rounded-lg bg-violet-600 px-5 py-2 font-semibold text-white">Começar por R$47</a>
      </div>
    </div>
  );
}
```

- [ ] **Step 3:** `npx tsc --noEmit` → exit 0.
- [ ] **Step 4: verificar no navegador** — `/blog` lista; `/blog/por-que-ia-local` renderiza + CTA; SEO metadata no `<head>`. *(Controller conduz.)*
- [ ] **Step 5: commit** — `git add "src/app/blog" && git commit -m "feat(blog): paginas /blog e /blog/[slug] (SEO + CTA de funil)"`

---

## Task 4: navegação + estratégia de marketing + continuidade

**Files:** Modify header/footer (link `/blog`); Create `docs/frentes/blog-marketing/marketing.md`; Modify `docs/frentes/blog-marketing/README.md`, `docs/ESTADO-ATUAL.md`, `docs/ROADMAP-EXECUCAO.md`.

- [ ] **Step 1: link** — adicionar `{ href: "/blog", label: "Blog" }` ao `LINKS` do `LandingHeader` (e/ou ativar o link "Blog" do footer se for placeholder). `tsc` 0.
- [ ] **Step 2: doc de marketing** — Create `docs/frentes/blog-marketing/marketing.md` com: **funil** (topo blog/SEO → meio newsletter → fundo `/oferta` R$47 → upsell passes Regular/Advanced); **calendário editorial** (cadência sugerida, ex.: 1 post/semana; pilares de conteúdo: IA local, hardware, privacidade, custo); **sazonalidade** (datas/temas: início de ano "organize sua IA", Black Friday, volta às aulas); **estratégias** (SEO on-page, e-mail de nutrição via Brevo, prova social via comunidade/feed). Artefato de planejamento (pt-BR).
- [ ] **Step 3: continuidade** — atualizar `README.md` da frente, `ESTADO-ATUAL.md`, `ROADMAP-EXECUCAO.md` (Frente 5 ✅).
- [ ] **Step 4: gate + commit** — `npx tsc --noEmit && npm run test` (inclui `blog`); `git add . && git commit -m "docs(blog): link + estrategia de marketing + Frente 5 concluida"`

## Notas de execução
- Sem migration. Blog é público (topo de funil), sem login/entitlement.
- `Markdown` extraído é reusado pela página de conteúdo e pelo blog (DRY).
