# Barra de Histórias do Feed — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.
> Steps use checkbox (`- [ ]`) syntax. Spec: `docs/frentes/feed-stories/spec.md`.

**Goal:** Barra de histórias no topo do feed logado — círculos por categoria que
abrem um viewer fullscreen com auto-avanço de 15s, derivada dos conteúdos
publicados nos últimos 7 dias.

**Architecture:** Lógica pura em `src/lib/stories.ts` (`buildStories(items, now,
token)`) alimentada por um novo campo `publishedAt` no `CONTENT_HUB`; dois
componentes client (`StoryBar` + `StoryViewer`) montados no `feed/page.tsx`.

**Tech Stack:** Next.js 14 App Router, React client components, Tailwind (tokens
semânticos + violeta), framer-motion (já instalado), ícones SVG caseiros.

## Global Constraints

- **Custo zero:** proibido adicionar dependência npm. Usar framer-motion
  (`^` já instalado) e os ícones de `src/components/ui/icons`. Nada de
  next-themes/bibliotecas de ícone/carrossel.
- **Marca violeta `#7c5cff`** (nunca rosa). Área logada é dark-aware (tokens
  semânticos `bg-card`/`text-foreground` + utilitários `violet-*`).
- **Histórias derivadas** do conteúdo — sem tabela nova, sem upload, sem
  `AddStoryButton`.
- **Janela de 7 dias** = `STORY_WINDOW_DAYS`; **duração** = `STORY_DURATION_MS`
  (15000). `buildStories` recebe `now: Date` (determinístico) — `new Date()` só
  no server component.
- **Gate:** `npx tsc --noEmit` exit 0 + `npm run test` verde + `npx next lint`
  sem erros. Componentes verificados rodando o app.
- **A11y:** círculos `button` com `aria-label`; viewer `role="dialog"`
  `aria-modal`, `Escape` fecha, setas navegam.
- **pt-BR.** Nunca commitar `CLAUDE.local-draft.md`, `SETUP.md`, `claude-chat.md`.

---

### Task 1: Modelo de dados + lógica pura (`buildStories`)

**Files:**
- Modify: `src/data/content-hub.ts` (campo `publishedAt` + seed)
- Modify: `src/lib/feed.ts` (extrair `contentHref`)
- Create: `src/lib/stories.ts`
- Test: `src/lib/stories.test.ts`

**Interfaces:**
- Produces: `buildStories(items: ContentItem[], now: Date, token?: string):
  StoryGroup[]`; `StorySlide`, `StoryGroup` types; `STORY_WINDOW_DAYS`,
  `STORY_DURATION_MS` consts; `contentHref(id: string, token?: string): string`.

- [ ] **Step 1: Extrair `contentHref` em `feed.ts`**

```ts
// src/lib/feed.ts — adicionar export e usar dentro de buildContentFeed
export function contentHref(id: string, token?: string): string {
  return token ? `/dashboard/${token}/conteudo/${id}` : "/oferta";
}
// em buildContentFeed: href: contentHref(item.id, token),
```

- [ ] **Step 2: Adicionar `publishedAt` ao tipo + seed no CONTENT_HUB**

Em `src/data/content-hub.ts`, adicionar ao `interface ContentItem`:
```ts
  /** Data de publicação (ISO). Ausente = não publicado. Entra nas histórias
   *  se estiver dentro de STORY_WINDOW_DAYS. */
  publishedAt?: string;
```
Seed (datas relativas a 2026-07-14): `relatorio-panorama-llms-locais` →
`publishedAt: "2026-07-13"`; `relatorio-comparativo-modelos` →
`publishedAt: "2026-07-11"`; `pesquisa-hardware-atual` →
`publishedAt: "2026-07-12"`. (Podcasts/vídeos permanecem sem `publishedAt`.)

- [ ] **Step 3: Escrever o teste (falha primeiro)**

```ts
// src/lib/stories.test.ts
import { describe, it, expect } from "vitest";
import { buildStories, STORY_WINDOW_DAYS, STORY_DURATION_MS } from "./stories";
import type { ContentItem } from "@/data/content-hub";

const now = new Date("2026-07-14T12:00:00Z");
const item = (over: Partial<ContentItem>): ContentItem => ({
  id: "x", type: "relatorio", title: "T", description: "D",
  durationMinutes: 5, xpReward: 10, embedUrl: null, ...over,
});

describe("buildStories", () => {
  it("agrupa itens dentro da janela por tipo, mais novo primeiro", () => {
    const groups = buildStories(
      [
        item({ id: "r1", type: "relatorio", publishedAt: "2026-07-10" }),
        item({ id: "r2", type: "relatorio", publishedAt: "2026-07-13" }),
        item({ id: "p1", type: "podcast", embedUrl: "http://e", publishedAt: "2026-07-12" }),
      ],
      now,
    );
    expect(groups.map((g) => g.type)).toEqual(["relatorio", "podcast"]);
    expect(groups[0].slides.map((s) => s.contentId)).toEqual(["r2", "r1"]);
  });

  it("exclui itens fora da janela e sem publishedAt", () => {
    const groups = buildStories(
      [
        item({ id: "old", publishedAt: "2026-06-01" }),
        item({ id: "nodate" }),
        item({ id: "future", publishedAt: "2026-07-20" }),
      ],
      now,
    );
    expect(groups).toEqual([]);
  });

  it("descarta grupos vazios", () => {
    const groups = buildStories([item({ id: "r", publishedAt: "2026-07-13" })], now);
    expect(groups).toHaveLength(1);
    expect(groups[0].type).toBe("relatorio");
  });

  it("href respeita token; emBreve para podcast/vídeo sem embed", () => {
    const [g] = buildStories(
      [item({ id: "v", type: "video", publishedAt: "2026-07-13" })],
      now,
      "TOK",
    );
    expect(g.slides[0].href).toBe("/dashboard/TOK/conteudo/v");
    expect(g.slides[0].emBreve).toBe(true);
    const [g2] = buildStories([item({ id: "v", type: "video", publishedAt: "2026-07-13" })], now);
    expect(g2.slides[0].href).toBe("/oferta");
  });

  it("constantes expostas", () => {
    expect(STORY_WINDOW_DAYS).toBe(7);
    expect(STORY_DURATION_MS).toBe(15000);
  });
});
```

- [ ] **Step 4: Rodar e ver falhar** — `npm run test -- stories` → FAIL (módulo inexistente).

- [ ] **Step 5: Implementar `src/lib/stories.ts`**

```ts
import type { ContentItem, ContentType } from "@/data/content-hub";
import { contentHref } from "@/lib/feed";

export const STORY_WINDOW_DAYS = 7;
export const STORY_DURATION_MS = 15_000;

export type StorySlide = {
  contentId: string;
  type: ContentType;
  title: string;
  hook: string;
  href: string;
  ctaLabel: string;
  embedUrl: string | null;
  emBreve: boolean;
};
export type StoryGroup = { type: ContentType; label: string; slides: StorySlide[] };

const GROUP_ORDER: ContentType[] = ["relatorio", "podcast", "video", "pesquisa"];
const GROUP_LABEL: Record<ContentType, string> = {
  relatorio: "Relatórios", podcast: "Podcasts", video: "Vídeos", pesquisa: "Pesquisas",
};
const CTA_LABEL: Record<ContentType, string> = {
  relatorio: "Ler agora", podcast: "Ouvir", video: "Assistir", pesquisa: "Responder",
};

function withinWindow(publishedAt: string | undefined, now: Date, days: number): boolean {
  if (!publishedAt) return false;
  const t = new Date(publishedAt).getTime();
  if (Number.isNaN(t)) return false;
  const diff = now.getTime() - t;
  return diff >= 0 && diff <= days * 86_400_000;
}

function isEmBreve(item: ContentItem): boolean {
  return item.embedUrl === null && item.type !== "relatorio" && item.type !== "pesquisa";
}

export function buildStories(items: ContentItem[], now: Date, token?: string): StoryGroup[] {
  const fresh = items.filter((i) => withinWindow(i.publishedAt, now, STORY_WINDOW_DAYS));
  return GROUP_ORDER.map((type) => {
    const slides: StorySlide[] = fresh
      .filter((i) => i.type === type)
      .sort((a, b) => new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime())
      .map((i) => ({
        contentId: i.id,
        type: i.type,
        title: i.title,
        hook: i.description,
        href: contentHref(i.id, token),
        ctaLabel: CTA_LABEL[i.type],
        embedUrl: i.embedUrl,
        emBreve: isEmBreve(i),
      }));
    return { type, label: GROUP_LABEL[type], slides };
  }).filter((g) => g.slides.length > 0);
}
```

- [ ] **Step 6: Rodar e ver passar** — `npm run test -- stories` → PASS. Depois
  `npx tsc --noEmit` → 0. `npm run test` full → verde.

- [ ] **Step 7: Commit** — `feat(stories): modelo publishedAt + buildStories puro`

---

### Task 2: `StoryViewer` — overlay fullscreen com auto-avanço de 15s

**Files:**
- Create: `src/components/app/stories/StoryViewer.tsx`

**Interfaces:**
- Consumes: `StoryGroup`, `StorySlide`, `STORY_DURATION_MS` de `@/lib/stories`;
  `CONTENT_ICON` de `@/lib/content-icons`; `IconClose` de `@/components/ui/icons`.
- Produces (props):
```ts
export type StoryViewerProps = {
  groups: StoryGroup[];
  startGroup: number;                 // índice do grupo inicial
  onClose: () => void;
  onSlideSeen: (contentId: string) => void;
};
```

- [ ] **Step 1: Implementar o componente** (client). Comportamento:
  - Estado `groupIdx`/`slideIdx`; slide atual = `groups[groupIdx].slides[slideIdx]`.
  - `useEffect` com timer que avança a cada `STORY_DURATION_MS`; barrinha de
    progresso anima (largura por `requestAnimationFrame` ou transição CSS de
    `STORY_DURATION_MS`). Ao chamar `onSlideSeen(contentId)` ao exibir cada slide.
  - Navegação: fim do slide → próximo slide; fim do grupo → próximo grupo;
    fim do último grupo → `onClose()`. Voltar no primeiro → mantém.
  - Zonas de toque: metade esquerda = anterior, metade direita = próximo.
  - Segurar (pointerdown) pausa o timer; soltar retoma.
  - Teclado: `ArrowRight`/`ArrowLeft` navegam, `Escape` fecha (listener em
    `useEffect`, cleanup no unmount).
  - Layout: `fixed inset-0 z-[100] bg-black/90 flex flex-col`. Topo: fileira de
    barrinhas (uma por slide do grupo atual) + botão X (`IconClose`,
    `aria-label="Fechar"`). Centro: **card de marca** — gradiente violeta,
    `CONTENT_ICON[type]` grande, `label` do grupo, `title`, `hook`; rodapé com
    CTA: se `emBreve` → selo "Em breve"; senão `Link href={slide.href}` com
    `slide.ctaLabel` (fecha o viewer ao navegar).
  - Slot de embed: se `slide.embedUrl` existir, renderiza `<iframe>` no lugar do
    card (baseline: todos os slides atuais são card, pois embeds são null).
  - `role="dialog"` `aria-modal="true"` `aria-label="Histórias"`; foco inicial
    no container; ícones decorativos `aria-hidden`.
  - **Sem `Date.now()` fora de handlers** (ok em event handlers/effects do
    client; proibido é em scripts de workflow — aqui é componente).

- [ ] **Step 2: Gate** — `npx tsc --noEmit` → 0; `npm run test` → verde
  (sem teste de componente; só garante que nada quebrou). `npx next lint` sem erros.

- [ ] **Step 3: Commit** — `feat(stories): StoryViewer fullscreen 15s`

---

### Task 3: `StoryBar` (círculos + estado visto) + montagem no feed

**Files:**
- Create: `src/components/app/stories/StoryBar.tsx`
- Modify: `src/app/feed/page.tsx` (montar a barra)

**Interfaces:**
- Consumes: `StoryGroup` de `@/lib/stories`; `StoryViewer` (Task 2);
  `CONTENT_ICON`; `buildStories` no server component.
- Produces (props):
```ts
export type StoryBarProps = { groups: StoryGroup[] };
```

- [ ] **Step 1: Implementar `StoryBar.tsx`** (client):
  - Se `groups.length === 0` → `return null`.
  - Estado `viewer: number | null` (índice do grupo aberto) e `seen: Set<string>`
    hidratado do `localStorage["mc-stories-seen"]` (parse defensivo; SSR-safe:
    ler em `useEffect`).
  - Render: `section` com fileira horizontal rolável (`flex gap-4 overflow-x-auto`).
    Cada grupo = `button` (`aria-label={`Histórias de ${g.label}`}`) com círculo
    72px: anel gradiente violeta quando **algum** slide não-visto, anel
    `border-border` apagado quando todos vistos; dentro, `CONTENT_ICON[g.type]`;
    label curto embaixo (`text-xs`). `onClick` → `setViewer(idx)`.
  - Ao abrir/fechar o viewer: renderiza `<StoryViewer groups={groups}
    startGroup={viewer} onClose={() => setViewer(null)} onSlideSeen={markSeen} />`
    quando `viewer !== null`. `markSeen(id)` adiciona ao Set e persiste no
    localStorage.
  - "Grupo visto" = todos os `slides[].contentId` no Set `seen`.

- [ ] **Step 2: Montar no feed** — em `src/app/feed/page.tsx`:
```ts
import { buildStories } from "@/lib/stories";
import { StoryBar } from "@/components/app/stories/StoryBar";
// ...dentro do componente, após resolver `token`:
const stories = buildStories(CONTENT_HUB, new Date(), token);
// no slot center, ANTES do CenterColumn e depois do DiagnosticoInline:
center={
  <>
    {user && !profileId && <DiagnosticoInline />}
    <StoryBar groups={stories} />
    <CenterColumn cards={cards} threads={threads} access={access} />
  </>
}
```

- [ ] **Step 3: Gate** — `npx tsc --noEmit` → 0; `npm run test` → verde;
  `npx next lint` sem erros. Verificar no app (`npm run dev -- -p 3000`,
  `/feed` logado): barra aparece com Relatórios + Pesquisas, círculo abre o
  viewer, 15s avança, X/Escape fecha, anel apaga após visto, CTA navega.

- [ ] **Step 4: Commit** — `feat(stories): StoryBar + montagem no feed`

---

## Self-Review (checklist)

- **Cobertura do spec:** publishedAt+seed (T1) ✓; buildStories 7d/grupos/ordem
  (T1) ✓; contentHref DRY (T1) ✓; viewer 15s/progress/nav/teclado/CTA/emBreve
  (T2) ✓; StoryBar círculos/anel/visto/localStorage + mount (T3) ✓; custo zero /
  a11y / dark nos três ✓.
- **Sem placeholders:** código completo em T1; T2/T3 descrevem comportamento
  exato (sem unit-test de componente por limitação do vitest node-env — gate é
  tsc/lint + verificação no app, conforme o projeto).
- **Consistência de tipos:** `StoryGroup`/`StorySlide`/`STORY_DURATION_MS`
  produzidos em T1 e consumidos em T2/T3; `StoryViewerProps`/`StoryBarProps`
  batem entre tasks.
