# Frente 4 (Conteúdo/mídia) — Plano de Implementação

> REQUIRED SUB-SKILL: superpowers:subagent-driven-development.
> Spec: `docs/frentes/design-v2/spec-4-conteudo.md`. Programa: `README.md`.
> **Um commit por item.**

**Goal:** Players customizados (vídeo + áudio) sobre `embedUrl`, TOC
dynamic-island para artigos, TOC da jornada no dashboard e share social — sem
migration e sem dependência nova.

**Architecture:** Dois helpers puros novos (`media.ts` parsing de embed;
`markdown.ts` parser em blocos com ids de heading) alimentam os componentes
client (`VideoPlayer`, `MusicPlayerCard`, `ArticleToc`). `share.ts` puro +
`ShareLinks`. `JornadaToc` só consome `deriveRoadmapView` (já existe). A página
`conteudo/[id]` troca o iframe cru pelos players; blog e dashboard ganham TOC/share.

**Tech Stack:** Next.js App Router, framer-motion, Tailwind (tokens semânticos),
vitest (node-env, só lógica pura).

## Global Constraints (do programa — verbatim)
- Custo zero (sem dep npm; framer-motion + Tailwind + ícones caseiros via
  `makeIcon`). Violeta `#7c5cff` único acento alto, **nunca rosa**. Dark-aware
  (tokens `bg-card`/`text-foreground`/`border`). Commit por item; gate
  `npx tsc --noEmit` 0 + `npm run test` + `npx next lint` sem erros. A11y
  (teclado, aria-labels). pt-BR. Mídia = embeds gratuitos (YouTube/Spotify);
  `embedUrl === null` → estado "em breve".
- **Invariante de segurança (spec):** nunca compartilhar URL com token
  (`/dashboard/<token>/...`). `ShareLinks` não renderiza se `isTokenizedPath(url)`.

---

### Task 1 — `media.ts` puro (parsing de embed) + refactor `VideoThumb`

**Files:**
- Create: `src/lib/media.ts` + `src/lib/media.test.ts`
- Modify: `src/components/app/feed/VideoThumb.tsx` (remover `youtubeId` local,
  consumir `media.ts`; comportamento idêntico)

**Interfaces (produz):**
```ts
export type MediaSource =
  | { kind: "youtube"; id: string; embedSrc: string; thumbnailUrl: string }
  | { kind: "spotify"; embedSrc: string; height: number }
  | { kind: "generic"; embedSrc: string };
export function parseMediaSource(embedUrl: string | null): MediaSource | null;
export function withAutoplay(src: string): string;
```

- [ ] **Step 1: Teste (falha primeiro)** — `media.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { parseMediaSource, withAutoplay } from "./media";

describe("parseMediaSource", () => {
  it("youtube: watch, youtu.be e embed dão o mesmo id/thumb", () => {
    for (const url of [
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "https://youtu.be/dQw4w9WgXcQ",
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
      "https://www.youtube.com/shorts/dQw4w9WgXcQ",
    ]) {
      expect(parseMediaSource(url)).toEqual({
        kind: "youtube",
        id: "dQw4w9WgXcQ",
        embedSrc: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      });
    }
  });
  it("spotify: episode/track = 152, show/playlist = 232; normaliza p/ /embed/", () => {
    expect(parseMediaSource("https://open.spotify.com/episode/abc123DEF")).toEqual({
      kind: "spotify",
      embedSrc: "https://open.spotify.com/embed/episode/abc123DEF",
      height: 152,
    });
    expect(parseMediaSource("https://open.spotify.com/embed/show/xyz789")).toEqual({
      kind: "spotify",
      embedSrc: "https://open.spotify.com/embed/show/xyz789",
      height: 232,
    });
  });
  it("URL desconhecida vira generic; null vira null", () => {
    expect(parseMediaSource("https://example.com/player")).toEqual({
      kind: "generic",
      embedSrc: "https://example.com/player",
    });
    expect(parseMediaSource(null)).toBeNull();
  });
});

describe("withAutoplay", () => {
  it("anexa com ? ou & conforme a URL", () => {
    expect(withAutoplay("https://a.com/e")).toBe("https://a.com/e?autoplay=1");
    expect(withAutoplay("https://a.com/e?x=1")).toBe("https://a.com/e?x=1&autoplay=1");
  });
});
```

- [ ] **Step 2: Rodar/ver falhar** (`npx vitest run src/lib/media.test.ts`).

- [ ] **Step 3: Implementar `media.ts`:**
```ts
export type MediaSource =
  | { kind: "youtube"; id: string; embedSrc: string; thumbnailUrl: string }
  | { kind: "spotify"; embedSrc: string; height: number }
  | { kind: "generic"; embedSrc: string };

const YOUTUBE_RE = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=|shorts\/))([\w-]{11})/;
const SPOTIFY_RE = /open\.spotify\.com\/(?:embed\/)?(track|episode|show|playlist|album)\/([A-Za-z0-9]+)/;

/** Fonte única de parsing de embedUrl (YouTube/Spotify/genérico). */
export function parseMediaSource(embedUrl: string | null): MediaSource | null {
  if (!embedUrl) return null;
  const yt = embedUrl.match(YOUTUBE_RE);
  if (yt) {
    const id = yt[1];
    return {
      kind: "youtube",
      id,
      embedSrc: `https://www.youtube.com/embed/${id}`,
      thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    };
  }
  const sp = embedUrl.match(SPOTIFY_RE);
  if (sp) {
    return {
      kind: "spotify",
      embedSrc: `https://open.spotify.com/embed/${sp[1]}/${sp[2]}`,
      height: sp[1] === "track" || sp[1] === "episode" ? 152 : 232,
    };
  }
  return { kind: "generic", embedSrc: embedUrl };
}

export function withAutoplay(src: string): string {
  return `${src}${src.includes("?") ? "&" : "?"}autoplay=1`;
}
```

- [ ] **Step 4: Rodar/ver passar.**

- [ ] **Step 5: Refactor `VideoThumb.tsx`** — apagar `youtubeId()` e a montagem
  manual de thumb/autoplay; usar `parseMediaSource(embedUrl)` (thumb =
  `source?.kind === "youtube" ? source.thumbnailUrl : null`) e
  `withAutoplay(embedUrl)` no iframe. **Comportamento idêntico** (mesmas classes,
  mesmo fallback gradiente).

- [ ] **Step 6: Gate + Commit** `feat(design-v2): media.ts (parsing YouTube/Spotify) + refactor VideoThumb`.

---

### Task 2 — `markdown.ts` puro (blocos + ids) + Markdown v2

**Files:**
- Create: `src/lib/markdown.ts` + `src/lib/markdown.test.ts`
- Modify: `src/components/ui/Markdown.tsx` (renderiza os blocos; preserva as
  classes atuais de h1/h2/h3/li/p; adiciona h4 e tabela)

**Interfaces (produz):**
```ts
export type MdHeading = { level: 1 | 2 | 3 | 4; text: string; id: string };
export type MdBlock =
  | ({ kind: "heading" } & MdHeading)
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "table"; header: string[]; rows: string[][] };
export function slugify(text: string): string;
export function parseMarkdown(source: string): MdBlock[];
export function extractHeadings(blocks: MdBlock[], maxLevel?: number): MdHeading[]; // default 4
```

- [ ] **Step 1: Teste (falha primeiro)** — `markdown.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { parseMarkdown, extractHeadings, slugify } from "./markdown";

describe("slugify", () => {
  it("minúsculas, sem acento, hífens", () => {
    expect(slugify("1. Introdução às LLMs Locais")).toBe("1-introducao-as-llms-locais");
  });
});

describe("parseMarkdown", () => {
  it("headings 1-4 com id; dedupe com sufixo", () => {
    const blocks = parseMarkdown("# Título\n#### Seção\n#### Seção");
    expect(blocks).toEqual([
      { kind: "heading", level: 1, text: "Título", id: "titulo" },
      { kind: "heading", level: 4, text: "Seção", id: "secao" },
      { kind: "heading", level: 4, text: "Seção", id: "secao-2" },
    ]);
  });
  it("desescapa \\. em texto de heading e parágrafo", () => {
    const blocks = parseMarkdown("#### 1\\. Intro\ntexto 2\\. aqui");
    expect(blocks[0]).toMatchObject({ text: "1. Intro", id: "1-intro" });
    expect(blocks[1]).toEqual({ kind: "paragraph", text: "texto 2. aqui" });
  });
  it("agrupa lista e parseia tabela pipe (ignora separador)", () => {
    const blocks = parseMarkdown(
      "- a\n- b\n\n| Col1 | Col2 |\n|---|---|\n| x | y |",
    );
    expect(blocks).toEqual([
      { kind: "list", items: ["a", "b"] },
      { kind: "table", header: ["Col1", "Col2"], rows: [["x", "y"]] },
    ]);
  });
});

describe("extractHeadings", () => {
  it("filtra por nível máximo", () => {
    const blocks = parseMarkdown("# A\n#### B\nparágrafo");
    expect(extractHeadings(blocks)).toHaveLength(2);
    expect(extractHeadings(blocks, 3)).toEqual([
      { level: 1, text: "A", id: "a" },
    ]);
  });
});
```

- [ ] **Step 2: Rodar/ver falhar.**

- [ ] **Step 3: Implementar `markdown.ts`:**
```ts
export type MdHeading = { level: 1 | 2 | 3 | 4; text: string; id: string };
export type MdBlock =
  | ({ kind: "heading" } & MdHeading)
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "table"; header: string[]; rows: string[][] };

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Desescapa `\.` e `\\` (usados nos relatórios publicados). */
function unescapeMd(text: string): string {
  return text.replace(/\\([.\\])/g, "$1");
}

function splitRow(line: string): string[] {
  return line.replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
}

const SEPARATOR_ROW = /^[\s|:-]+$/;

export function parseMarkdown(source: string): MdBlock[] {
  const blocks: MdBlock[] = [];
  const slugCount = new Map<string, number>();
  let list: string[] | null = null;
  let table: { header: string[]; rows: string[][] } | null = null;

  const flush = () => {
    if (list) blocks.push({ kind: "list", items: list });
    if (table) blocks.push({ kind: "table", ...table });
    list = null;
    table = null;
  };

  for (const raw of source.split("\n")) {
    const line = raw.trimEnd();
    const heading = line.match(/^(#{1,4}) (.+)$/);
    if (heading) {
      flush();
      const text = unescapeMd(heading[2].trim());
      const base = slugify(text);
      const n = (slugCount.get(base) ?? 0) + 1;
      slugCount.set(base, n);
      blocks.push({
        kind: "heading",
        level: heading[1].length as 1 | 2 | 3 | 4,
        text,
        id: n === 1 ? base : `${base}-${n}`,
      });
      continue;
    }
    if (line.startsWith("- ")) {
      if (table) flush();
      (list ??= []).push(unescapeMd(line.slice(2)));
      continue;
    }
    if (line.startsWith("|")) {
      if (list) flush();
      if (SEPARATOR_ROW.test(line)) continue;
      const cells = splitRow(line).map(unescapeMd);
      if (!table) table = { header: cells, rows: [] };
      else table.rows.push(cells);
      continue;
    }
    flush();
    if (line.trim() !== "") blocks.push({ kind: "paragraph", text: unescapeMd(line) });
  }
  flush();
  return blocks;
}

export function extractHeadings(blocks: MdBlock[], maxLevel = 4): MdHeading[] {
  return blocks.flatMap((b) =>
    b.kind === "heading" && b.level <= maxLevel
      ? [{ level: b.level, text: b.text, id: b.id }]
      : [],
  );
}
```

- [ ] **Step 4: Rodar/ver passar.**

- [ ] **Step 5: `Markdown.tsx` v2** — trocar o split manual por
  `parseMarkdown(source)` e renderizar por bloco: headings ganham
  `id={block.id}` e `scroll-mt-24` (âncora não some sob o header), **mantendo as
  classes atuais** de h1/h2/h3 (ler o arquivo) e h4 = h3 um passo menor
  (`text-base font-semibold`); `list` → `<ul className="list-disc pl-5 space-y-1">`
  com os `<li>` de classe atual; `table` → wrapper
  `<div className="overflow-x-auto">` + `<table>` com `border-border`,
  header `bg-card font-semibold`, células `px-3 py-2 border`. Dark-aware via
  tokens (sem cor fixa).

- [ ] **Step 6: Gate + Commit** `feat(design-v2): markdown.ts (blocos+ids) e Markdown v2 (h4+tabelas)`.

---

### Task 3 — `VideoPlayer` + `MusicPlayerCard` na página de conteúdo

**Files:**
- Create: `src/components/app/content/VideoPlayer.tsx`
- Create: `src/components/app/content/MusicPlayerCard.tsx`
- Modify: `src/app/dashboard/[token]/conteudo/[id]/page.tsx` (trecho do iframe
  cru/"em breve" no branch permitido)

**Interfaces:**
- Consome (Task 1): `parseMediaSource`, `withAutoplay`, `MediaSource`.
- Produz: `VideoPlayer` props `{ title: string; embedUrl: string | null;
  durationMinutes?: number }`; `MusicPlayerCard` props `{ title: string;
  description?: string; embedUrl: string | null; durationMinutes?: number }`.

- [ ] **Step 1: `VideoPlayer.tsx` ("use client", modelo video-player).**
  - `const source = parseMediaSource(embedUrl)`. Estado `playing`.
  - **Em breve** (`!source`): moldura 16:9 `rounded-2xl border border-border
    bg-card` com gradiente violeta suave, `IconVideo` central e selo âmbar
    "Em breve" — sem botão play.
  - **Poster** (`source && !playing`): 16:9; fundo = `source.kind==="youtube" ?
    <img src={source.thumbnailUrl} className="h-full w-full object-cover">` :
    gradiente violeta; overlay escuro suave; **botão play central** (`<button
    aria-label={`Reproduzir ${title}`}>`, círculo `bg-violet-600 text-white`
    com triângulo SVG inline, hover scale via framer-motion `whileHover`);
    barra inferior (gradiente p/ baixo) com `title` (truncate) e
    `durationMinutes` ("N min").
  - **Playing:** `<iframe src={withAutoplay(source.embedSrc)} className="aspect-video
    w-full rounded-2xl" allow="autoplay; encrypted-media" allowFullScreen
    title={title} />`.

- [ ] **Step 2: `MusicPlayerCard.tsx` ("use client", modelo music-player-card).**
  - `const source = parseMediaSource(embedUrl)`. Estado `playing`.
  - Card `rounded-2xl border border-border bg-card p-4 flex gap-4 items-center`:
    **artwork** quadrado 96px `rounded-xl` gradiente violeta com
    `IconHeadphones` (branco); coluna com `title` (semibold), `description`
    (muted, line-clamp-2), meta "N min"; **botão play** circular violeta à
    direita (`aria-label={`Ouvir ${title}`}`). `!source` → selo âmbar "Em breve"
    no lugar do play.
  - `playing` → o card inteiro dá lugar ao embed: Spotify usa
    `<iframe src={source.embedSrc} height={source.height} className="w-full
    rounded-xl" allow="autoplay; encrypted-media">`; YouTube/generic usam
    `aspect-video` com `withAutoplay`.

- [ ] **Step 3: Montagem em `conteudo/[id]/page.tsx`** — no branch permitido
  (depois do corpo markdown, hoje `body ? <Markdown/> : embedUrl ? <iframe/> :
  "Em breve"`): manter `body` como está; substituir o par iframe/"em breve" por
  `item.type === "video" ? <VideoPlayer title={item.title}
  embedUrl={item.embedUrl} durationMinutes={item.durationMinutes} /> :
  item.type === "podcast" ? <MusicPlayerCard title={item.title}
  description={item.description} embedUrl={item.embedUrl}
  durationMinutes={item.durationMinutes} /> : <fallback atual>` (relatorio sem
  body e tipos futuros mantêm o comportamento de hoje). `PesquisaForm`/gating/
  `CompleteContentButton` intocados.

- [ ] **Step 4: Gate + Commit** `feat(design-v2): VideoPlayer e MusicPlayerCard na pagina de conteudo`.

---

### Task 4 — `ArticleToc` (dynamic-island-toc) no relatório e no blog

**Files:**
- Create: `src/components/app/content/ArticleToc.tsx`
- Modify: `src/app/dashboard/[token]/conteudo/[id]/page.tsx` (quando há `body`)
- Modify: `src/app/blog/[slug]/page.tsx`

**Interfaces:**
- Consome (Task 2): `parseMarkdown`, `extractHeadings`, `MdHeading`.
- Produz: `ArticleToc` props `{ headings: MdHeading[] }`.

- [ ] **Step 1: `ArticleToc.tsx` ("use client").**
  - `if (headings.length < 3) return null`.
  - **Ilha recolhida:** `fixed top-3 left-1/2 -translate-x-1/2 z-40` (abaixo do
    z do header/drawer), pill `rounded-full border border-border bg-card/90
    backdrop-blur px-4 py-2 shadow-lg max-w-[90vw] sm:max-w-md`; mostra
    `IconContent` + o `text` do heading **ativo** (truncate).
  - **Ativo por scroll:** `IntersectionObserver` (`rootMargin: "-20% 0px -70%
    0px"`) sobre `headings.map(h => document.getElementById(h.id))`; guarda o
    último que entrou.
  - **Expansão:** clique alterna `open` — a ilha expande (framer-motion:
    `layout` na pill + `AnimatePresence` na lista, spring) para uma lista
    vertical `<nav aria-label="Sumário">` com `<a href={"#"+h.id}>` (indent por
    `level`, ativo em violeta); clique em item fecha e faz smooth scroll
    (`scrollIntoView({behavior:"smooth"})` + `preventDefault`). Escape e
    click-fora fecham (listener em `document`, limpo no unmount).
  - Dark-aware; sem rosa; texto `text-foreground`/`text-muted-foreground`.

- [ ] **Step 2: Montar no relatório** — em `conteudo/[id]/page.tsx`, onde `body`
  existe: `const headings = extractHeadings(parseMarkdown(body));` e renderizar
  `<ArticleToc headings={headings} />` junto do `<Markdown source={body} />`.

- [ ] **Step 3: Montar no blog** — `blog/[slug]/page.tsx`: mesmo par
  (`extractHeadings(parseMarkdown(body))` + `<ArticleToc/>`).

- [ ] **Step 4: Gate + Commit** `feat(design-v2): ArticleToc (ilha dinamica) em relatorios e blog`.

---

### Task 5 — `JornadaToc` (table-of-contents da jornada) no dashboard

**Files:**
- Create: `src/components/dashboard/JornadaToc.tsx`
- Modify: `src/components/dashboard/RoadmapCard.tsx` (adicionar
  `id={"etapa-" + key}` e `scroll-mt-24` em cada bloco de etapa — só isso)
- Modify: `src/app/dashboard/[token]/page.tsx` (montar ao lado do RoadmapCard)

**Interfaces:**
- Consome (existente): `ROADMAP_STAGE_KEYS`, `ROADMAP_STAGE_LABELS`
  (`src/data/roadmap-stages.ts`), `deriveRoadmapView(completedStages)`
  (`src/lib/roadmap-progress.ts` → `{ progressPercent, statusFor }`).
- Produz: `JornadaToc` props `{ completedStages: string[] }` (client; deriva a
  view internamente com `deriveRoadmapView` — puro, roda no client).

- [ ] **Step 1: `JornadaToc.tsx` ("use client").**
  - `const view = deriveRoadmapView(completedStages)`.
  - Coluna `hidden xl:block sticky top-24 w-56 shrink-0`: título pequeno
    "Sua jornada" (uppercase muted), barra de progresso fina
    (`view.progressPercent`, `bg-violet-600` sobre `bg-border`), depois
    `<nav aria-label="Etapas da jornada">` com as 5 etapas
    (`ROADMAP_STAGE_KEYS.map`): `<a href={"#etapa-" + key}>` com ícone por
    status — `done` = `IconCheck` violeta, `active` = ponto pulsante violeta
    (framer-motion `animate={{scale:[1,1.25,1]}}` repeat), `locked` =
    `IconLock` muted — e `ROADMAP_STAGE_LABELS[key]` (ativo
    `text-foreground font-medium`, resto muted). Smooth scroll como na Task 4.

- [ ] **Step 2: `RoadmapCard.tsx`** — cada etapa ganha `id={"etapa-" + key}` e
  `scroll-mt-24` (nenhuma outra mudança).

- [ ] **Step 3: `dashboard/[token]/page.tsx`** — envolver o `<RoadmapCard/>` num
  `div className="flex gap-6 items-start"` com
  `<JornadaToc completedStages={completedStages} />` ao lado (a variável já
  existe na página; `xl:` esconde a coluna em telas menores, layout atual
  intacto abaixo de xl).

- [ ] **Step 4: Gate + Commit** `feat(design-v2): JornadaToc (sumario da jornada) no dashboard`.

---

### Task 6 — `share.ts` + ícones sociais + `ShareLinks`

**Files:**
- Create: `src/lib/share.ts` + `src/lib/share.test.ts`
- Modify: `src/components/ui/icons/index.tsx` (adicionar `IconWhatsApp`,
  `IconXTwitter`, `IconLinkedIn` via `makeIcon`, mesmo estilo do set)
- Create: `src/components/app/content/ShareLinks.tsx`
- Modify: `src/app/blog/[slug]/page.tsx` e
  `src/app/dashboard/[token]/conteudo/[id]/page.tsx` (montagem)

**Interfaces (produz):**
```ts
export type SharePlatform = "whatsapp" | "x" | "linkedin";
export function buildShareUrl(platform: SharePlatform, url: string, text: string): string;
export function isTokenizedPath(url: string): boolean;
// ShareLinks props: { url: string; text: string }
```

- [ ] **Step 1: Teste (falha primeiro)** — `share.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { buildShareUrl, isTokenizedPath } from "./share";

describe("buildShareUrl", () => {
  const url = "https://www.matrizcentral.com.br/blog/meu-post";
  const text = "IA local: guia";
  it("whatsapp", () => {
    expect(buildShareUrl("whatsapp", url, text)).toBe(
      "https://wa.me/?text=IA%20local%3A%20guia%20https%3A%2F%2Fwww.matrizcentral.com.br%2Fblog%2Fmeu-post",
    );
  });
  it("x", () => {
    expect(buildShareUrl("x", url, text)).toBe(
      "https://twitter.com/intent/tweet?text=IA%20local%3A%20guia&url=https%3A%2F%2Fwww.matrizcentral.com.br%2Fblog%2Fmeu-post",
    );
  });
  it("linkedin", () => {
    expect(buildShareUrl("linkedin", url, text)).toBe(
      "https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fwww.matrizcentral.com.br%2Fblog%2Fmeu-post",
    );
  });
});

describe("isTokenizedPath", () => {
  it("bloqueia qualquer caminho /dashboard/<token>", () => {
    expect(isTokenizedPath("https://x.com/dashboard/abc/conteudo/i")).toBe(true);
    expect(isTokenizedPath("/dashboard/abc123")).toBe(true);
  });
  it("libera URLs públicas", () => {
    expect(isTokenizedPath("https://www.matrizcentral.com.br")).toBe(false);
    expect(isTokenizedPath("/blog/meu-post")).toBe(false);
  });
});
```

- [ ] **Step 2: Rodar/ver falhar.**

- [ ] **Step 3: Implementar `share.ts`:**
```ts
export type SharePlatform = "whatsapp" | "x" | "linkedin";

export function buildShareUrl(platform: SharePlatform, url: string, text: string): string {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  switch (platform) {
    case "whatsapp":
      return `https://wa.me/?text=${t}%20${u}`;
    case "x":
      return `https://twitter.com/intent/tweet?text=${t}&url=${u}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
  }
}

/** Guarda de segurança: URLs /dashboard/<token>/... dão acesso à conta e NUNCA
 *  podem ser compartilhadas. */
export function isTokenizedPath(url: string): boolean {
  return /\/dashboard\/[^/]+/.test(url);
}
```

- [ ] **Step 4: Rodar/ver passar.**

- [ ] **Step 5: Ícones** — em `src/components/ui/icons/index.tsx`, adicionar via
  `makeIcon` (stroke 1.7, viewBox 24, path simples caseiro): `IconWhatsApp`
  (balão com fone), `IconXTwitter` (X de dois traços), `IconLinkedIn`
  (retângulo arredondado + "in" estilizado em traços). Sem copiar SVG de marca
  de terceiros — silhuetas próprias, monocromáticas (`currentColor`).

- [ ] **Step 6: `ShareLinks.tsx` ("use client").**
  - Props `{ url: string; text: string }`. `if (isTokenizedPath(url)) return null;`.
  - Linha `flex items-center gap-2`: label "Compartilhar" (muted, text-sm) +
    botões-ícone circulares (`rounded-full border border-border p-2
    text-muted-foreground hover:text-violet-600 hover:border-violet-600`):
    WhatsApp / X / LinkedIn abrem `window.open(buildShareUrl(...), "_blank",
    "noopener,noreferrer")`; botão **copiar** (`IconShare`) usa
    `navigator.clipboard.writeText(url)` e troca por "Copiado!" (`aria-live=
    "polite"`, volta em 2s); se `navigator.share` existir, um botão nativo
    "Compartilhar" vem primeiro (`navigator.share({ title: text, url })` em
    try/catch vazio — cancelar não é erro). `aria-label` pt-BR em todos.

- [ ] **Step 7: Montagem.**
  - `blog/[slug]/page.tsx`: após o corpo, `<ShareLinks url={base + "/blog/" +
    post.slug} text={post.title} />` com `const base =
    process.env.NEXT_PUBLIC_URL ?? "https://www.matrizcentral.com.br"`.
  - `conteudo/[id]/page.tsx` (branch permitido, após o conteúdo):
    `<ShareLinks url={base} text={item.title} />` — **a home, nunca a URL da
    página** (invariante).

- [ ] **Step 8: Gate + Commit** `feat(design-v2): ShareLinks (WhatsApp/X/LinkedIn/copiar) no blog e conteudo`.

---

## Self-Review

- **Cobertura do spec:** Item 1 → Task 1 ✓; Item 2 → Task 2 ✓; Item 3 → Task 3 ✓;
  Item 4 → Task 4 ✓; Item 5 → Task 5 ✓; Item 6 → Task 6 ✓; invariante de token
  → Task 6 (`isTokenizedPath` + guarda no componente + montagem com home) ✓.
- **Puros testados:** `parseMediaSource`/`withAutoplay`, `slugify`/
  `parseMarkdown`/`extractHeadings`, `buildShareUrl`/`isTokenizedPath`.
  Componentes verificados rodando o app (vitest é node-env).
- **Consistência de tipos:** `MediaSource` (T1) consumido por T3;
  `MdHeading`/`extractHeadings` (T2) consumidos por T4; `ShareLinks` (T6) usa
  só `share.ts`. `deriveRoadmapView` já existe (não redefinido).
- Sem migration; sem dependência nova; nenhum item toca gating/entitlements.
