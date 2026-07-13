# Blog + Marketing — Design (MVP)

> Decisões com autonomia autorizada, recomendadas e documentadas.

## Contexto

O produto precisa de um **blog** (topo de funil / SEO) e de uma **estrutura de
marketing** (calendário, sazonalidade, funil). Hoje só há um link placeholder no
footer. Existe `renderMarkdown` (em `dashboard/[token]/conteudo/[id]/page.tsx`) e
conteúdo markdown em `content/`. A newsletter já captura e-mails (`/api/newsletter`).

## Escopo do MVP

Duas entregas:

### A. Blog (código — superfície pública de SEO/funil)
- **`/blog`** — lista de posts (título, resumo, data, autor), pública, ordenada
  por data desc.
- **`/blog/[slug]`** — post renderizado (markdown), com **metadata de SEO**
  (`generateMetadata`: title/description) e **CTA para `/oferta`** (funil).
- Posts = **markdown em `content/blog/`** + manifesto tipado em `src/data/blog.ts`
  (`BLOG_POSTS`: slug, title, excerpt, date, author, bodyPath, tags?). Custo zero,
  sem DB (arquivos). 2 posts-semente reais de IA local.

### B. Marketing (estratégia — documento)
- **`docs/frentes/blog-marketing/marketing.md`** — o "como funcionará o
  marketing": **calendário editorial** (cadência de posts), **sazonalidade**
  (datas/temas do ano), **funil de vendas** (topo=blog/SEO → meio=newsletter →
  fundo=/oferta R$47 → upsell passes), **estratégias** (SEO, e-mail, comunidade).
  É artefato de planejamento (não código), como o prompt pediu ("entenda e
  estruture").

## Fora de escopo (YAGNI / v2)

- CMS/admin de blog (posts vêm de arquivos; publicar = adicionar markdown + entrada
  no manifesto). UGC de comentários no blog. Automação de calendário. Markdown rico
  (tabelas/imagens embutidas) além do `renderMarkdown` atual.

## Decisão técnica

### 1. Manifesto + conteúdo
- `src/data/blog.ts`: `interface BlogPost { slug; title; excerpt; date; author; bodyPath; tags?: string[] }` + `export const BLOG_POSTS: BlogPost[]`.
- `content/blog/*.md`: 2 posts-semente (pt-BR, temas de IA local — ex.: "Por que
  rodar IA localmente", "Quanto de hardware você precisa").

### 2. Lógica pura — `src/lib/blog.ts`
- `getSortedPosts(posts): BlogPost[]` — ordena por `date` desc.
- `getPostBySlug(posts, slug): BlogPost | undefined`.
- Testes: ordenação, busca (achado/não-achado).

### 3. Páginas
- **`/blog` (`src/app/blog/page.tsx`)**, server: `getSortedPosts(BLOG_POSTS)` →
  cards (título, resumo, data, link). CTA sutil ao final.
- **`/blog/[slug]` (`src/app/blog/[slug]/page.tsx`)**, server: `getPostBySlug` →
  `notFound()` se ausente; lê o markdown (`readFile`), renderiza (reusar/extrair o
  `renderMarkdown`); **`generateMetadata`** com title/description do post; **CTA
  para `/oferta`** ao final.

### 4. Navegação
- Corrigir/ativar o link "Blog" (footer) e adicionar ao header (`/blog`).

## Casos de borda
- Slug inexistente → `notFound()`. Post sem `bodyPath` → mostra só o resumo.
- Lista vazia → mensagem neutra.

## Verificação
- Lógica pura (`getSortedPosts`, `getPostBySlug`) → testes Vitest.
- `tsc` 0 + `npm run test`. Visual: `/blog` + um `/blog/[slug]` (SEO metadata + CTA).

## Dependências
`renderMarkdown` (extrair para reuso), `content/` (padrão de arquivos). Sem login/
entitlement (blog é público, topo de funil). Sem migration.
