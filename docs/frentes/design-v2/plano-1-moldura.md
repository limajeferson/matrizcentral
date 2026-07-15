# Frente 1 (Moldura) — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.
> Spec: `docs/frentes/design-v2/spec-1-moldura.md`. Programa: `README.md`.
> Steps usam checkbox `- [ ]`. **Um commit por item.**

**Goal:** Moldura do app logado no padrão dos modelos header-3 / sidebar-showcase
/ footer: header animado (esconde ao rolar + drawer mobile), sidebar em seções
com item ativo/colapsável, e rodapé multi-coluna.

**Architecture:** `AppShell` compõe `AppHeader` (client, framer-motion) + grid
(inalterado) + `AppFooter` (server). `LeftSidebar` vira client com `usePathname`.
Helper puro `formatAvailability` alimenta os selos "Em breve" da sidebar.

## Global Constraints (do programa — verbatim)

- Custo zero (sem dep npm nova; framer-motion + Tailwind + ícones caseiros).
- Violeta `#7c5cff` único acento; nunca rosa. Dark-aware (tokens semânticos).
- Commit por item; gate `tsc` 0 + `npm run test` + `next lint` sem erros.
- A11y (aria-labels, dialog/aria-modal, aria-current, aria-expanded). pt-BR.

---

### Task 1 — Header animado (Item header-3)

**Files:**
- Create: `src/components/app/AppHeader.tsx`
- Modify: `src/components/app/AppShell.tsx`
- Modify: `src/components/ui/icons/index.tsx` (add `IconMenu`)

**Interfaces:**
- Produces: `AppHeader({ userMenu: ReactNode; mobileNav: ReactNode })`.
- `AppShell` consome: passa `mobileNav={left}`.

- [ ] **Step 1: Add `IconMenu`** em `icons/index.tsx`:
```tsx
export const IconMenu = makeIcon(<path d="M4 7h16M4 12h16M4 17h16" />);
```

- [ ] **Step 2: Criar `AppHeader.tsx` (client).** Requisitos:
  - `"use client"`. Estrutura interna igual ao header atual do AppShell (logo,
    busca desktop `md+` desabilitada, sino, `{userMenu}`), mas dentro de um
    `motion.header` (`role="banner"`) `sticky top-0 z-40 h-16` com
    `bg-background/95 backdrop-blur border-b`.
  - **Scroll-aware:** `useEffect` com listener `scroll` passivo; `lastY` em
    `useRef`. Estado `hidden` (bool) e `scrolled` (bool). Se `y>lastY && y>80`
    → `hidden=true`; se `y<lastY` → `hidden=false`. `scrolled = y>8` (intensifica
    sombra). `motion.header` anima `y: hidden ? -72 : 0` (transition ~0.25s).
  - **Botão hambúrguer** (`IconMenu`, `aria-label="Abrir menu"`) visível só
    `md:hidden`, à esquerda do logo; abre o drawer (`useState open`).
  - **Drawer** (`AnimatePresence`): quando `open`, renderiza overlay
    (`fixed inset-0 z-50 bg-black/60`, clique fecha) + `motion.aside`
    (`fixed inset-y-0 left-0 z-50 w-72 bg-card p-4 overflow-y-auto`,
    `initial x:-300 / animate x:0 / exit x:-300`), `role="dialog"`
    `aria-modal="true"` `aria-label="Menu"`, com botão fechar (`IconClose`) e
    o slot `{mobileNav}`. `Escape` fecha (listener em `useEffect`); trava
    `document.body.style.overflow` enquanto aberto; foco inicial no painel.
  - Sem `Date.now()` — só timestamps de evento/scroll.

- [ ] **Step 3: Refatorar `AppShell.tsx`** para usar o header novo:
  - Remover o `<header>` inline; importar e renderizar
    `<AppHeader userMenu={userMenu} mobileNav={left} />` no topo do wrapper.
  - Grid e `aside/main/aside` permanecem iguais (a `aside` esquerda continua
    visível `lg+`; no mobile o nav vem do drawer — manter o `aside` order-2 no
    mobile é redundante com o drawer, então **esconder a aside esquerda abaixo de
    `lg`** (`hidden lg:block`) já que o drawer cobre o mobile).

- [ ] **Step 4: Gate** — `npx tsc --noEmit` 0; `npx next lint` sem erros;
  `npm run test` verde. Verificar no app: header some ao rolar p/ baixo, volta ao
  subir; drawer abre/fecha (hambúrguer, Escape, overlay).

- [ ] **Step 5: Commit** — `feat(design-v2): header animado (scroll-hide + drawer mobile)`

---

### Task 2 — Sidebar em seções (Item sidebar-showcase)

**Files:**
- Create: `src/lib/format-availability.ts` + `.test.ts`
- Modify: `src/components/app/feed/LeftSidebar.tsx` (server → client)

**Interfaces:**
- Produces: `formatAvailability(items: ContentItem[]): Record<ContentType,
  { emBreve: boolean }>`.

- [ ] **Step 1: Teste do helper (falha primeiro)** — `src/lib/format-availability.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { formatAvailability } from "./format-availability";
import type { ContentItem } from "@/data/content-hub";

const item = (o: Partial<ContentItem>): ContentItem => ({
  id: "x", type: "podcast", title: "T", description: "D",
  durationMinutes: 5, xpReward: 10, embedUrl: null, ...o,
});

describe("formatAvailability", () => {
  it("categoria toda sem embed (podcast/video) = em breve", () => {
    const r = formatAvailability([item({ type: "podcast" }), item({ type: "video" })]);
    expect(r.podcast.emBreve).toBe(true);
    expect(r.video.emBreve).toBe(true);
  });
  it("relatorio/pesquisa nunca em breve", () => {
    const r = formatAvailability([item({ type: "relatorio" }), item({ type: "pesquisa" })]);
    expect(r.relatorio.emBreve).toBe(false);
    expect(r.pesquisa.emBreve).toBe(false);
  });
  it("podcast com ao menos 1 embed publicado = disponível", () => {
    const r = formatAvailability([item({ type: "podcast", embedUrl: "http://e" }), item({ type: "podcast" })]);
    expect(r.podcast.emBreve).toBe(false);
  });
  it("categoria ausente = em breve (nada publicado)", () => {
    const r = formatAvailability([]);
    expect(r.video.emBreve).toBe(true);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar** — `npm run test -- format-availability` → FAIL.

- [ ] **Step 3: Implementar `src/lib/format-availability.ts`:**
```ts
import type { ContentItem, ContentType } from "@/data/content-hub";

const TYPES: ContentType[] = ["relatorio", "podcast", "video", "pesquisa"];

/** Uma categoria está "em breve" quando NÃO tem nenhum item publicado.
 *  Relatório/pesquisa são sempre publicados (não dependem de embed). */
export function formatAvailability(
  items: ContentItem[],
): Record<ContentType, { emBreve: boolean }> {
  const out = {} as Record<ContentType, { emBreve: boolean }>;
  for (const type of TYPES) {
    if (type === "relatorio" || type === "pesquisa") {
      out[type] = { emBreve: false };
      continue;
    }
    const anyPublished = items.some((i) => i.type === type && i.embedUrl !== null);
    out[type] = { emBreve: !anyPublished };
  }
  return out;
}
```

- [ ] **Step 4: Rodar e ver passar** — `npm run test -- format-availability` → PASS.

- [ ] **Step 5: Reescrever `LeftSidebar.tsx` (client).** Requisitos:
  - `"use client"`; `usePathname()` de `next/navigation`; `motion` de framer-motion;
    importar `CONTENT_HUB` (array estático, ok no client) + `formatAvailability`.
  - **Seções:** dados `NAV_MAIN` = [Feed `/feed`, Conteúdos `/feed#conteudos`,
    Fórum `/forum`]; `NAV_ACCOUNT` = [Conta `/conta`, Suporte `/suporte`]. Cada
    seção num card `rounded-2xl border bg-card`, com rótulo
    `text-xs uppercase text-muted-foreground` ("Navegar" / "Sua conta").
  - **Item ativo:** `isActive = pathname === baseHref` (comparar só o path, sem
    hash); ativo → `bg-accent text-foreground` + `aria-current="page"` + barra
    violeta à esquerda via `<motion.span layoutId="sidebar-active" className="...
    w-1 rounded-full bg-violet-600" />` renderizada dentro do item ativo.
  - **Grupo colapsável "Explorar por formato":** `useState(open=true)`; cabeçalho
    é `button` com `aria-expanded={open}` + `IconChevron` (rotaciona 180° quando
    aberto). Lista dentro de `<AnimatePresence>`: `motion.div` com
    `initial/animate/exit` de `height` (`0`↔`auto`) e `opacity`. Cada formato usa
    `CONTENT_ICON[type]`; se `avail[type].emBreve` → selo âmbar "Em breve"
    (`text-[10px] uppercase text-amber-600`).
  - Sem bloco de perfil (YAGNI).

- [ ] **Step 6: Gate** — `tsc` 0; `next lint` sem erros; `npm run test` verde.
  Verificar no app: item ativo destacado com a barra violeta; grupo de formato
  colapsa/expande; selos "Em breve" em Podcasts e Vídeos.

- [ ] **Step 7: Commit** — `feat(design-v2): sidebar em secoes (ativo + colapsavel + selos)`

---

### Task 3 — Rodapé do app (Item footer @rapid-ui)

**Files:**
- Create: `src/components/app/AppFooter.tsx`
- Modify: `src/components/app/AppShell.tsx` (montar o rodapé)
- Modify: `src/components/ui/icons/index.tsx` (add `IconMail`)

- [ ] **Step 1: Add `IconMail`** em `icons/index.tsx`:
```tsx
export const IconMail = makeIcon(
  <>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </>
);
```

- [ ] **Step 2: Criar `AppFooter.tsx` (server).** Estrutura (dark-aware, tokens):
  - `<footer className="border-t border-border bg-card/40">` com container
    `mx-auto max-w-[1400px] px-4 lg:px-6 py-10`.
  - Grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8`:
    - **Marca:** "Matriz <span violet>Central</span>" + tagline "Sua central de
      IA local — relatórios, podcasts, vídeos e comunidade."
    - **Plataforma:** Feed `/feed` · Conteúdos `/feed#conteudos` · Fórum `/forum`.
    - **Conta:** Minha conta `/conta` · Suporte `/suporte`.
    - **Legal:** Sobre `/sobre` · Privacidade `/legal/privacidade` · Termos
      `/legal/termos`.
    Colunas de links com título `text-xs uppercase text-muted-foreground` e
    `Link` `text-sm text-muted-foreground hover:text-foreground`.
  - **Linha de contato:** `IconMail` + `mailto:contato@matrizcentral.com.br`
    (link de suporte); sem redes sociais inventadas.
  - **Barra inferior:** borda superior + "© 2026 Matriz Central. Todos os
    direitos reservados." (`text-xs text-muted-foreground`).

- [ ] **Step 3: Montar no `AppShell`** — renderizar `<AppFooter />` após o
  `<div>` do grid (dentro do wrapper `min-h-screen`).

- [ ] **Step 4: Gate** — `tsc` 0; `next lint` sem erros; `npm run test` verde.
  Verificar no app: rodapé aparece abaixo do feed, 4 colunas (empilha no mobile),
  links certos, dark-aware.

- [ ] **Step 5: Commit** — `feat(design-v2): rodape do app (multi-coluna)`

---

## Self-Review

- Cobertura da spec: header animado+drawer (T1) ✓; sidebar seções/ativo/
  colapsável/selos (T2) ✓; rodapé multi-coluna (T3) ✓; helper puro testado (T2) ✓.
- Sem placeholders: helper com código+testes completos; componentes com contrato
  detalhado (sem unit-test de componente — gate = tsc/lint + app).
- Consistência: `AppHeader`/`AppFooter` montados pelo `AppShell`; `mobileNav={left}`;
  ícones novos (`IconMenu`, `IconMail`) antes de usar.
