# Frente 2 (Feed) — Plano de Implementação

> REQUIRED SUB-SKILL: superpowers:subagent-driven-development.
> Spec: `docs/frentes/design-v2/spec-2-feed.md`. Programa: `README.md`.
> **Um commit por item.** Ordem: backend → visual.

**Goal:** Feed no padrão modern-timeline (infinito+animado) com posts de usuário,
rail em galeria, post-card, thumbnail de vídeo e transição feed→conteúdo.

**Architecture:** `feed_posts` (Supabase) + `feed-posts.ts` (puro + data) + rota
`POST /api/feed/post` e `GET /api/feed/page`. `buildFeedTimeline` (puro) unifica
posts+threads+conteúdo. Client `FeedTimeline` faz revelação infinita
(IntersectionObserver) com entrada staggered (framer-motion). Componentes visuais:
`PostCard`, `VideoThumb`, galeria do rail, `ExpandableContentCard`.

## Global Constraints (do programa — verbatim)
- Custo zero (sem dep npm; framer-motion + Tailwind + ícones caseiros; imagem só
  URL externa, sem upload). Violeta único acento, nunca rosa. Dark-aware (tokens).
- Commit por item; gate `tsc` 0 + `npm run test` + `next lint` sem erros.
- Padrões do projeto: rota com `getSessionUser()` → 401 sem sessão;
  `getSupabaseServerClient()` (service_role, bypassa RLS); `display_name` em
  `users` (fallback "Aluno"). RLS = enable sem policies (default-deny), como 0020.
- A11y, pt-BR. Nunca commitar drafts (`CLAUDE.local-draft.md` etc.).

---

### Task 1 — Backend de posts (`feed_posts`)

**Files:**
- Create: `supabase/migrations/0024_feed_posts.sql`
- Create: `src/lib/feed-posts.ts` + `src/lib/feed-posts.test.ts`
- Create: `src/app/api/feed/post/route.ts`

- [ ] **Step 1: Migration** `0024_feed_posts.sql`:
```sql
create table if not exists feed_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  body text not null,
  link_url text,
  image_url text,
  created_at timestamptz not null default now()
);
create index if not exists feed_posts_created_idx on feed_posts(created_at desc);
alter table feed_posts enable row level security;
```

- [ ] **Step 2: Teste de `parseNewPost` (falha primeiro)** — `feed-posts.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { parseNewPost } from "./feed-posts";

describe("parseNewPost", () => {
  it("aceita body válido, apara espaços", () => {
    expect(parseNewPost({ body: "  olá mundo " })).toEqual({
      body: "olá mundo", link_url: null, image_url: null,
    });
  });
  it("rejeita body vazio/whitespace", () => {
    expect(parseNewPost({ body: "   " })).toBeNull();
    expect(parseNewPost({})).toBeNull();
    expect(parseNewPost(null)).toBeNull();
  });
  it("trunca body em 2000 chars", () => {
    const p = parseNewPost({ body: "a".repeat(3000) });
    expect(p?.body.length).toBe(2000);
  });
  it("aceita link/image http(s); descarta inválidos", () => {
    expect(parseNewPost({ body: "x", link_url: "https://a.com", image_url: "http://b.com/i.png" }))
      .toEqual({ body: "x", link_url: "https://a.com", image_url: "http://b.com/i.png" });
    expect(parseNewPost({ body: "x", link_url: "javascript:alert(1)", image_url: "ftp://x" }))
      .toEqual({ body: "x", link_url: null, image_url: null });
  });
});
```

- [ ] **Step 3: Rodar e ver falhar.**

- [ ] **Step 4: Implementar `feed-posts.ts`:**
```ts
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type NewPost = { body: string; link_url: string | null; image_url: string | null };
export type FeedPost = {
  id: string; author: string; body: string;
  link_url: string | null; image_url: string | null; created_at: string;
};

const MAX = 2000;

function safeUrl(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return /^https?:\/\/\S+$/i.test(s) ? s : null;
}

export function parseNewPost(input: unknown): NewPost | null {
  if (!input || typeof input !== "object") return null;
  const o = input as Record<string, unknown>;
  if (typeof o.body !== "string") return null;
  const body = o.body.trim().slice(0, MAX);
  if (body.length === 0) return null;
  return { body, link_url: safeUrl(o.link_url), image_url: safeUrl(o.image_url) };
}

export async function createPost(userId: string, post: NewPost): Promise<FeedPost | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("feed_posts")
    .insert({ user_id: userId, body: post.body, link_url: post.link_url, image_url: post.image_url })
    .select("id, user_id, body, link_url, image_url, created_at").single();
  if (error || !data) return null;
  const { data: u } = await supabase.from("users").select("display_name").eq("id", userId).maybeSingle();
  return {
    id: data.id, author: u?.display_name ?? "Aluno", body: data.body,
    link_url: data.link_url, image_url: data.image_url, created_at: data.created_at,
  };
}

export async function listPosts(limit = 15, before?: string): Promise<FeedPost[]> {
  const supabase = getSupabaseServerClient();
  let q = supabase.from("feed_posts")
    .select("id, user_id, body, link_url, image_url, created_at")
    .order("created_at", { ascending: false }).limit(limit);
  if (before) q = q.lt("created_at", before);
  const { data: rows } = await q;
  const list = rows ?? [];
  if (list.length === 0) return [];
  const ids = Array.from(new Set(list.map((r) => r.user_id)));
  const { data: users } = await supabase.from("users").select("id, display_name").in("id", ids);
  const nameById = new Map((users ?? []).map((u) => [u.id, u.display_name ?? "Aluno"]));
  return list.map((r) => ({
    id: r.id, author: nameById.get(r.user_id) ?? "Aluno", body: r.body,
    link_url: r.link_url, image_url: r.image_url, created_at: r.created_at,
  }));
}
```

- [ ] **Step 5: Rodar e ver passar** (`npm run test -- feed-posts`).

- [ ] **Step 6: Rota `POST /api/feed/post`** (`src/app/api/feed/post/route.ts`):
```ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-session";
import { parseNewPost, createPost } from "@/lib/feed-posts";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "não autenticado" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = parseNewPost(body);
  if (!parsed) return NextResponse.json({ error: "post inválido" }, { status: 400 });
  const post = await createPost(user.id, parsed);
  if (!post) return NextResponse.json({ error: "falha ao publicar" }, { status: 500 });
  return NextResponse.json({ post });
}
```

- [ ] **Step 7: Gate** (`tsc` 0, test verde, `next lint`) + **Commit**
  `feat(design-v2): backend de posts do feed (feed_posts + rota)`.
  (Migration aplicada no remoto pelo coordenador via SQL Editor — hand-off.)

---

### Task 2 — `relativeTime` + `PostCard` (modelo post-card)

**Files:**
- Create: `src/lib/relative-time.ts` + `.test.ts`
- Create: `src/components/app/feed/PostCard.tsx`
- Modify: `src/components/ui/icons/index.tsx` (add `IconHeart`, `IconComment`, `IconShare`)

- [ ] **Step 1: Teste `relativeTime` (falha primeiro):**
```ts
import { describe, it, expect } from "vitest";
import { relativeTime } from "./relative-time";
const now = new Date("2026-07-15T12:00:00Z");
describe("relativeTime", () => {
  it("agora / minutos / horas / dias", () => {
    expect(relativeTime("2026-07-15T11:59:30Z", now)).toBe("agora");
    expect(relativeTime("2026-07-15T11:45:00Z", now)).toBe("há 15 min");
    expect(relativeTime("2026-07-15T09:00:00Z", now)).toBe("há 3 h");
    expect(relativeTime("2026-07-12T12:00:00Z", now)).toBe("há 3 d");
  });
  it("acima de 7 dias vira data curta", () => {
    expect(relativeTime("2026-06-01T12:00:00Z", now)).toMatch(/\d/);
  });
});
```

- [ ] **Step 2: Implementar `relative-time.ts`:**
```ts
export function relativeTime(fromIso: string, now: Date): string {
  const t = new Date(fromIso).getTime();
  if (Number.isNaN(t)) return "";
  const s = Math.floor((now.getTime() - t) / 1000);
  if (s < 60) return "agora";
  const min = Math.floor(s / 60);
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  if (d <= 7) return `há ${d} d`;
  return new Date(fromIso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}
```

- [ ] **Step 3: Rodar/passar.** Add ícones `IconHeart`, `IconComment`, `IconShare`
  em `icons/index.tsx` (SVGs stroke no padrão `makeIcon`).

- [ ] **Step 4: `PostCard.tsx` (client).** Props: `{ post: FeedPost }`.
  - Card `rounded-2xl border border-border bg-card p-4 shadow-sm`.
  - Cabeçalho: avatar (círculo violeta com inicial de `author`), `author`
    (font-semibold), `relativeTime(post.created_at, new Date())`
    (`text-xs text-muted-foreground`).
  - Corpo: `post.body` (`whitespace-pre-wrap text-sm`), link opcional
    (`post.link_url` como `<a target=_blank rel="noopener noreferrer">`), imagem
    opcional (`post.image_url` → `<img loading="lazy" className="rounded-xl max-h-96 w-full object-cover">`).
  - Rodapé de ações: 3 botões (`IconHeart` curtir · `IconComment` comentar ·
    `IconShare` compartilhar) com contador `0` e `title="Em breve"` (persistência
    é item futuro; curtir pode ser otimista-local com `useState`, mas sem gravar).
  - A11y: botões com `aria-label`.

- [ ] **Step 5: Gate + Commit** `feat(design-v2): PostCard + relativeTime`.

---

### Task 3 — Timeline infinita (modelo modern-timeline)

**Files:**
- Create: `src/lib/feed-timeline.ts` + `.test.ts`
- Create: `src/components/app/feed/FeedTimeline.tsx`
- Create: `src/app/api/feed/page/route.ts`
- Modify: `src/components/app/feed/CenterColumn.tsx` (usar FeedTimeline na lista)
- Modify: `src/app/feed/page.tsx` (carregar posts + passar timeline inicial)

**Interfaces (produz):**
```ts
export type FeedEntry =
  | { kind: "post"; at: string; post: FeedPost }
  | { kind: "thread"; at: string; thread: TopicListItem }
  | { kind: "content"; at: string; card: FeedCard };
export function buildFeedTimeline(
  posts: FeedPost[], threads: TopicListItem[], contents: { card: FeedCard; at: string }[],
): FeedEntry[]; // ordena por `at` desc
```

- [ ] **Step 1: Teste `buildFeedTimeline` (falha primeiro)** — cobre: mescla os 3
  tipos, ordena por `at` desc, mantém o payload certo, lista vazia → []. (Escreva
  casos concretos com datas fixas.)

- [ ] **Step 2: Implementar `feed-timeline.ts`** — mapeia cada array para
  `FeedEntry` com `at` e `kind`, concatena, `sort((a,b)=> b.at localeCompare a.at)`
  (ISO compara lexicograficamente = cronológico). Sem `Date.now()`.

- [ ] **Step 3: Rota `GET /api/feed/page?before=<iso>`** — retorna próxima página
  **de posts + threads** (conteúdo do hub é finito, vai só na 1ª carga):
  `listPosts(15, before)` + threads via `listTopics` filtrado por `created_at <
  before` (ou uma função `listTopicsBefore`). Retorna `{ entries: FeedEntry[],
  nextCursor: string | null }` (nextCursor = menor `at` retornado, ou null se
  veio menos que o limite).

- [ ] **Step 4: `FeedTimeline.tsx` (client).** Props: `{ initial: FeedEntry[];
  initialCursor: string | null }`.
  - Estado `entries`, `cursor`, `loading`, `done`.
  - Renderiza cada entry pelo `kind`: `post`→`PostCard`; `thread`→card de thread
    (reusar visual atual); `content`→`ExpandableContentCard` (Task 6) ou o card de
    conteúdo atual (integrar na Task 6).
  - **Entrada staggered:** cada item num `motion.div` com
    `initial={{opacity:0, y:16}} whileInView={{opacity:1, y:0}}
    viewport={{ once: true, margin: "-40px" }}` + `transition delay` leve por
    índice de página.
  - **Infinito:** `IntersectionObserver` num `<div ref={sentinel}>` ao fim; ao
    intersectar e não `done`/`loading`, `fetch('/api/feed/page?before='+cursor)`,
    anexa entries, atualiza cursor; se `nextCursor===null` → `done`. Cleanup do
    observer no unmount. Sem lib.
  - Estado vazio: "Ainda não há novidades por aqui."

- [ ] **Step 5: Integrar** em `CenterColumn` (a seção "Do hub e da comunidade"
  passa a renderizar `FeedTimeline`) e em `feed/page.tsx` (carrega
  `listPosts(15)` + threads + monta `buildFeedTimeline(...)` p/ a 1ª página,
  passando `initial`/`initialCursor`). O rail "Comece por aqui" segue (vira galeria
  na Task 4-bis/5). Preservar o `StoryBar` e o `DiagnosticoInline`.
  Adicionar um **campo de novo post** (textarea + botão "Publicar") no topo da
  coluna central para logados, que faz `POST /api/feed/post` e insere o post no
  topo do `entries` (otimista).

- [ ] **Step 6: Gate + Commit** `feat(design-v2): feed timeline infinito + composer de post`.

---

### Task 4 — Rail "Comece por aqui" como galeria (modelo image-gallery)

**Files:**
- Modify: `src/app/globals.css` (utilitário `.no-scrollbar`)
- Modify: `src/components/app/feed/CenterColumn.tsx` (rail vira galeria)

- [ ] **Step 1:** Add em `globals.css`:
```css
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.no-scrollbar::-webkit-scrollbar { display: none; }
```
- [ ] **Step 2:** O rail (hoje `flex gap-4 overflow-x-auto`) vira galeria: manter
  `overflow-x-auto` + adicionar `.no-scrollbar snap-x snap-mandatory`, cada card
  `snap-start`. Handler de **wheel vertical → scroll horizontal** (client:
  `onWheel` que faz `el.scrollLeft += e.deltaY`) — extrair o rail para um pequeno
  client `RailGallery` se preciso (o resto do CenterColumn pode seguir server;
  mas CenterColumn já é chamado com dados — criar `RailGallery.tsx` client
  recebendo os cards). Sem barra visível; desliza suave.
- [ ] **Step 3: Gate + Commit** `feat(design-v2): rail Comece por aqui vira galeria deslizante`.

---

### Task 5 — Thumbnail de vídeo (modelo video-thumbnail-player)

**Files:**
- Create: `src/components/app/feed/VideoThumb.tsx`
- Modify: onde um card de conteúdo `video` é renderizado (CenterColumn/FeedTimeline)

- [ ] **Step 1: `VideoThumb.tsx` (client).** Props: `{ title: string; embedUrl:
  string | null; durationMinutes?: number }`.
  - Estado `playing`. Se `!playing`: capa (gradiente violeta ou thumb derivada do
    YouTube se `embedUrl` for youtube — `img.youtube.com/vi/<id>/hqdefault.jpg`),
    **botão play central** (círculo com `IconVideo`/triângulo), **selo de duração**
    (`durationMinutes` → "12 min", canto inferior direito), título overlay
    (bottom-left). Clique (só se `embedUrl`) → `playing=true`.
  - Se `playing`: `<iframe src={embedUrl + (autoplay param)} allow="autoplay; encrypted-media">`.
  - `embedUrl===null` → sem play, selo "Em breve".
- [ ] **Step 2:** Usar `VideoThumb` para itens `content` do tipo `video` no feed.
- [ ] **Step 3: Gate + Commit** `feat(design-v2): thumbnail de video com play inline`.

---

### Task 6 — Transição feed → conteúdo (modelo expandable-card)

**Files:**
- Create: `src/components/app/feed/ExpandableContentCard.tsx`
- Modify: `FeedTimeline.tsx` (usar para itens `content`)

- [ ] **Step 1: `ExpandableContentCard.tsx` (client).** Props: `{ card: FeedCard }`
  (id/title/description/type/href/emBreve).
  - Estado `open`. Card compacto com `layoutId={"content-"+card.id}` (único).
    Clique abre um **overlay** (`AnimatePresence`) com `motion.div
    layoutId={"content-"+card.id}` expandido: ícone do tipo, título, descrição,
    selo NOVO/Em breve, e **CTA "Abrir conteúdo"** (`Link href={card.href}` — que
    já respeita o gating). `Escape`/clique no backdrop fecha; `role="dialog"`
    `aria-modal`; trava scroll do body; foco inicial.
  - `layoutId` **único por card** (nunca compartilhado entre instâncias — cuidado
    se o card aparece 2x; usar só na instância do feed).
- [ ] **Step 2:** `FeedTimeline` usa `ExpandableContentCard` para `kind==="content"`.
- [ ] **Step 3: Gate + Commit** `feat(design-v2): transicao feed->conteudo (expandable card)`.

---

## Self-Review
- Cobertura: posts backend (T1) ✓; post-card+relativeTime (T2) ✓; timeline
  infinito+composer (T3) ✓; galeria (T4) ✓; thumbnail (T5) ✓; expandable (T6) ✓.
- Puros testados: `parseNewPost`, `relativeTime`, `buildFeedTimeline`.
- Consistência de tipos: `FeedPost` (T1) consumido por PostCard/timeline/rota;
  `FeedEntry` (T3) por FeedTimeline/rota; `layoutId` único por card (T6).
- Hand-off: migration `0024` aplicada no remoto via SQL Editor antes do teste ao
  vivo dos posts.
