# Redesign do Feed (baseline) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Frentes rodam em **worktrees** paralelas por onda. Steps usam checkbox (`- [ ]`).

**Goal:** Entregar o baseline do redesign do feed — casa logada em grid de 3 colunas (estrutura do template, marca da Matriz), tema dark padrão com menu de usuário, card de perfil minimizado, e emojis de UI/e-mail trocados por ícones SVG.

**Architecture:** Um `ThemeProvider` caseiro no root layout aplica `.dark` (padrão) via script anti-flash; as superfícies de marketing (`.mcv2`) e `/oferta` (`.lp-guide`) são insuladas por escopo e não reagem aos tokens, então o efeito do dark fica na área logada (que usa tokens semânticos). O feed vira um shell de 3 colunas com dados reais (content-hub, fórum, comunidade, perfil/XP). Ícones SVG inline (zero-dep) substituem emojis.

**Tech Stack:** Next.js 14 App Router (server + client components), Tailwind + tokens shadcn já em `globals.css`, TypeScript, Vitest (node-env).

## Global Constraints

- **Custo zero:** nenhuma dependência npm nova. `ThemeProvider` e ícones são caseiros (React + inline SVG). Proibido `next-themes`, libs de ícone.
- **Marca:** acento **violeta `#7c5cff`** (nunca o rosa `#f3427f` do template); tipografia atual (Geist). Estrutura/estilo do template, cores da Matriz.
- **Tema dark padrão, só na área logada.** Não estilizar `/oferta`, dashboard-token, landing — ficam para backlog.
- **Emojis:** remover/substituir em **UI e e-mails** (`src/**` de interface + `src/lib/email.ts`). **Não** tocar fixtures de teste (`*.test.ts`).
- **Comunicação e copy em pt-BR.**
- **Gate:** `npx tsc --noEmit` exit 0 + `npm run test` verde + `npx next lint` **sem erros** (o build do Vercel roda ESLint — `no-unused-vars` quebra deploy). UI verificada rodando o app (`npm run dev -- -p 3000`); componentes não têm unit-test (vitest node-env).
- **CSS por escopo:** o shell logado usa tokens semânticos (`bg-background`/`bg-card`/`text-foreground`/`border-border`) + Tailwind; não vazar para `.mcv2`/`.lp-guide`.
- **Acessibilidade:** ícone que substitui texto/emoji recebe `aria-label` (ou `aria-hidden` quando decorativo ao lado de texto).
- **Branch:** `master`. Commitar só arquivos da task; nunca `CLAUDE.local-draft.md`, `SETUP.md`, `claude-chat.md`.

## File Structure

- `src/components/ui/icons/` — **criar.** Ícones SVG inline (um arquivo `index.tsx` exportando componentes nomeados). Frente D.
- `src/lib/content-icons.ts` — **criar.** Mapa `ContentType → nome do ícone` (puro, testável). Frente D.
- `src/lib/content-icons.test.ts` — **criar.** Teste do mapa. Frente D.
- `src/components/theme/ThemeProvider.tsx` — **criar.** Contexto + toggle + persistência. Frente A.
- `src/components/theme/theme-script.ts` — **criar.** String do script anti-flash. Frente A.
- `src/components/app/UserMenu.tsx` — **criar.** Avatar + dropdown (nível/XP, tema, conta, sair). Frente A.
- `src/app/layout.tsx` — **modificar.** Injetar script anti-flash + `ThemeProvider`. Frente A.
- `src/components/app/AppShell.tsx` — **criar.** Top bar + grid 3-col (client-agnóstico; recebe as colunas como props/children). Frente B.
- `src/components/app/feed/*` — **criar.** `TopBar.tsx`, `LeftSidebar.tsx`, `CenterColumn.tsx`, `RightSidebar.tsx`. Frente B.
- `src/app/feed/page.tsx` — **modificar.** Montar o shell com dados reais. Frente B.
- `src/components/app/ProfileCard.tsx` — **criar.** Card de perfil flutuante minimizado (client). Frente C.
- `src/lib/feed.ts`, `src/data/badges.ts`, `src/components/auth/ContentGate.tsx`, `src/app/dashboard/**`, `src/components/content/CompleteContentButton.tsx`, `src/lib/email.ts` — **modificar** (varredura de emojis). Frente D.
- `docs/frentes/feed-redesign/icon-map.md` — **criar.** Tabela emoji→ícone. Frente D.

---

## Onda 1 (paralela, worktrees): Frente D e Frente A

### Frente D — Ícones SVG + varredura de emojis

**Interfaces produzidas (consumidas por A/B/C):**
- `src/components/ui/icons/index.tsx` exporta componentes React: `IconSearch`, `IconBell`, `IconChat`, `IconFeed`, `IconContent`, `IconForum`, `IconAccount`, `IconSupport`, `IconReport`, `IconPodcast`, `IconVideo`, `IconSurvey`, `IconBadge`, `IconArrow`, `IconCheck`, `IconSun`, `IconMoon`, `IconChevron`, `IconClose`. Assinatura: `(props: { size?: number; className?: string; title?: string }) => JSX.Element` — SVG `viewBox="0 0 24 24"`, `stroke="currentColor"`, `fill="none"`, `aria-hidden` quando sem `title`.
- `src/lib/content-icons.ts` exporta `contentIconName(type: ContentType): "report"|"podcast"|"video"|"survey"` e `CONTENT_ICON: Record<ContentType, ComponentType<{size?:number;className?:string}>>`.

- [ ] **D-Task 1: Conjunto de ícones SVG**
  - Criar `src/components/ui/icons/index.tsx` com os componentes acima. Cada um: função que retorna um `<svg viewBox="0 0 24 24" width={size??20} height={size??20} fill="none" stroke="currentColor" strokeWidth={1.7} className={className} aria-hidden={title?undefined:true} role={title?"img":undefined}>{title && <title>{title}</title>}...paths...</svg>`. Usar paths simples (referência: os SVGs no design — busca=lupa, sino, chat=balão). `currentColor` permite herdar a cor do tema.
  - Gate: `npx tsc --noEmit` exit 0; `npx next lint` sem erros.
  - Commit: `feat(icons): conjunto de icones SVG inline (zero-dep)`.

- [ ] **D-Task 2: Mapa `ContentType → ícone` (puro, testado)**
  - Criar `src/lib/content-icons.ts`:
    ```ts
    import type { ContentType } from "@/data/content-hub";
    import { IconReport, IconPodcast, IconVideo, IconSurvey } from "@/components/ui/icons";
    import type { ComponentType } from "react";
    export function contentIconName(type: ContentType): "report" | "podcast" | "video" | "survey" {
      return { relatorio: "report", podcast: "podcast", video: "video", pesquisa: "survey" }[type];
    }
    export const CONTENT_ICON: Record<ContentType, ComponentType<{ size?: number; className?: string }>> = {
      relatorio: IconReport, podcast: IconPodcast, video: IconVideo, pesquisa: IconSurvey,
    };
    ```
  - Criar `src/lib/content-icons.test.ts` testando `contentIconName` para os 4 tipos.
  - Gate: `npm run test -- src/lib/content-icons.test.ts` verde; tsc.
  - Commit: `feat(icons): mapa ContentType->icone`.

- [ ] **D-Task 3: Varredura de emojis na UI**
  - Substituir emojis por ícones/texto nos arquivos de UI. Mudanças concretas:
    - `src/lib/feed.ts`: **remover** o campo `emoji` de `FeedCard` e o mapa `EMOJI`. Consumidores passam a usar `CONTENT_ICON[type]`. (Ajustar `feed.test.ts` se referencia `emoji` — **sem** alterar fixtures que não sejam sobre isso.)
    - `src/data/badges.ts`: trocar o campo `icon` (emoji) por um id de ícone string (`"compass"|"report"|"headphones"|"star"|"flag"|"check"|"flame"`) e adicionar ao conjunto de ícones os que faltarem (badge icons). Atualizar quem renderiza badges (`BadgeShelf`) para usar o componente de ícone.
    - `src/components/auth/ContentGate.tsx`, `src/components/content/CompleteContentButton.tsx`, `src/app/dashboard/**`: remover emojis de labels/botões (ex.: "📥 Baixar" → ícone `IconArrow`/texto; "🚀 Explorar" → texto). Preferir texto limpo + ícone quando fizer sentido.
  - Gate: `npx tsc --noEmit` + `npx next lint` sem erros + `npm run test` verde.
  - Commit: `refactor(ui): remove emojis, usa icones SVG`.

- [ ] **D-Task 4: Varredura de emojis nos e-mails + `icon-map.md`**
  - `src/lib/email.ts`: remover emojis dos `subject`/`htmlContent` (ex.: "Seu token chegou! 🚀" → "Seu token chegou! Descubra seu perfil"). Manter o texto claro.
  - Criar `docs/frentes/feed-redesign/icon-map.md`: tabela `| emoji | onde estava | vira |` cobrindo todos os emojis removidos (UI + e-mail), listando o componente de ícone SVG que substitui cada um (ou "removido, só texto").
  - Gate: `npx tsc --noEmit` + `npm run test` verde (checar testes de `email`/`webhook` que assertem strings de assunto — atualizar expectativas se necessário, sem afrouxar).
  - Commit: `refactor(email): remove emojis; doc icon-map`.

### Frente A — Tema dark padrão + menu de usuário

**Interfaces produzidas (consumidas por B/C):**
- `src/components/theme/ThemeProvider.tsx` exporta `ThemeProvider` (client, envolve children) e `useTheme(): { theme: "dark"|"light"; toggle: () => void }`.
- `src/components/app/UserMenu.tsx` exporta `UserMenu` (client) — recebe `{ email: string; level: number; levelName: string }` e renderiza avatar + dropdown.

- [ ] **A-Task 1: ThemeProvider + script anti-flash + root layout**
  - Criar `src/components/theme/theme-script.ts` exportando `THEME_INIT_SCRIPT` (string): lê `localStorage.getItem("mc-theme")`; se ausente, usa `"dark"`; aplica `document.documentElement.classList.toggle("dark", theme==="dark")`. Roda antes da pintura.
  - Criar `src/components/theme/ThemeProvider.tsx` (client): estado `theme` inicial lido de `localStorage` (fallback `"dark"`), efeito que aplica a classe e persiste; `toggle()` alterna; expõe via contexto + `useTheme`.
  - Modificar `src/app/layout.tsx`: no `<head>` (ou topo do `<body>`), injetar `<script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />`; envolver `{children}` com `<ThemeProvider>`. **Não** setar `className="dark"` estático no `<html>` (o script cuida, evitando mismatch de hidratação).
  - Gate: `npx tsc --noEmit` + `npx next lint` sem erros; verificar no app que a página logada nasce escura e que marketing/`/oferta` continuam iguais.
  - Commit: `feat(theme): ThemeProvider dark-padrao + script anti-flash`.

- [ ] **A-Task 2: UserMenu (avatar + dropdown com toggle de tema)**
  - Criar `src/components/app/UserMenu.tsx` (client): avatar circular com a inicial do e-mail; ao clicar, abre dropdown com: linha "Nível {level} — {levelName}", botão **Tema: claro/escuro** (usa `useTheme().toggle`, ícone `IconSun`/`IconMoon`), link "Minha conta" (`/conta`), botão "Sair" (`fetch("/api/auth/logout", { method: "POST" })` então `window.location.href = "/"`). Fecha ao clicar fora (listener em `document`). Estilo com tokens (`bg-popover`/`text-popover-foreground`/`border-border`).
  - Gate: tsc + next lint sem erros; verificar no app (abre/fecha, toggle troca o tema e persiste no reload, sair funciona).
  - Commit: `feat(app): UserMenu com toggle de tema, nivel e sair`.

---

## Onda 2 (após Onda 1): Frente B, depois Frente C

### Frente B — Feed em grid de 3 colunas (shell + dados reais)

**Consome:** `UserMenu` (A), ícones e `CONTENT_ICON` (D), tokens de tema.
**Dados existentes:** `getSessionUser()`; `getAccessContext(userId).access` (`view|regular|advanced`); `buildContentFeed(CONTENT_HUB, token?)`; `getCommunityActivity(20)`+`formatActivity`; perfil do usuário (`users.profile_id`, `total_xp`); fórum (`listThreads` de `@/lib/forum-data` — conferir assinatura no arquivo); `getLevelProgress(total_xp)`.

- [ ] **B-Task 1: AppShell (top bar + grid 3-col responsivo)**
  - Criar `src/components/app/AppShell.tsx`: layout com top bar (logo Matriz + campo de busca **visual** + `IconBell` + slot para `UserMenu`) e um grid `grid-template-columns: 260px 1fr 320px` (colapsa para 1 coluna < 1024px via classes Tailwind `lg:grid-cols-[...]`). Recebe `left`, `center`, `right`, `userMenu` como props (ReactNode). Tokens semânticos; cards com `rounded-2xl`, sombra suave; acento violeta.
  - Gate: tsc + next lint; verificar layout no app (desktop e mobile).
  - Commit: `feat(feed): AppShell 3-col + top bar`.

- [ ] **B-Task 2: Colunas (Left/Center/Right)**
  - `LeftSidebar.tsx`: nav com ícones SVG (Feed/Conteúdos/Fórum/Conta/Suporte, `href` reais) + bloco "Explorar por formato" (4 formatos com `CONTENT_ICON`).
  - `CenterColumn.tsx`: rail horizontal "Comece por aqui" (cards de conteúdo a partir de `buildContentFeed`, com selo NOVO/em breve e ícone do tipo) + lista "Do hub e da comunidade" (cards de conteúdo gated pelo `access` + as threads recentes do fórum). Reusar a lógica de gating existente (`ContentGate`/`access`).
  - `RightSidebar.tsx`: "Comunidade" — `formatActivity(getCommunityActivity(20))` (gated a `advanced`, senão `ContentGate`), abaixo um resumo de ranking se trivial (senão, deixar só atividade).
  - Gate: tsc + next lint; verificar no app com a conta de teste (perfil `devops_infra`).
  - Commit: `feat(feed): colunas left/center/right com dados reais`.

- [ ] **B-Task 3: Montar `/feed` no shell**
  - Modificar `src/app/feed/page.tsx`: server component que resolve sessão, `access`, perfil/XP, conteúdo, atividade e fórum, monta `<AppShell userMenu={<UserMenu .../>} left={...} center={...} right={...} />`. Preservar o comportamento do bloco de boas-vindas/diagnóstico do SP1 (mostrar quando `user && !profileId`), agora dentro do shell.
  - Gate: tsc + next lint + `npm run test` verde; verificar `/feed` no app (logado, dark, 3 colunas, diagnóstico ainda funciona).
  - Commit: `feat(feed): /feed no novo shell de 3 colunas`.

### Frente C — Card de perfil flutuante minimizado

**Consome:** tema (A), ícones (D); dados de perfil (nível/XP, plano/entitlement).

- [ ] **C-Task 1: ProfileCard (pill que expande)**
  - Criar `src/components/app/ProfileCard.tsx` (client): estado `expanded` (default `false`). **Minimizado**: pill fixo `position:fixed; right:24px; bottom:24px` com avatar + nome + "Nível {level}". **Expandido** (ao clicar): card maior com progresso de XP (`progressPercent`), plano (Start/Regular/Advanced a partir do `access`), atalho "Ir para minha conta" (`/conta`) e botão fechar (`IconClose`) que volta ao pill. Tokens de tema; acento violeta. Recebe `{ email, level, levelName, progressPercent, plan }` por props.
  - Montar no `/feed` (server passa os dados; o componente é client). Não bloquear o feed.
  - Gate: tsc + next lint; verificar no app (pill aparece, expande/recolhe, dados corretos).
  - Commit: `feat(feed): card de perfil flutuante minimizado`.

---

## Execução (paralelização)

- **Onda 1:** dispatch **Frente D** e **Frente A** em **worktrees separadas, em paralelo** (arquivos disjuntos — D em `icons`/`badges`/`email`/dashboard; A em `theme`/`layout`/`UserMenu`). Revisar cada frente (diff completo da frente) antes de integrar à master.
- **Barreira:** integrar A e D à master antes da Onda 2 (B e C consomem ambas).
- **Onda 2:** **Frente B** (3 tasks) e depois **Frente C** — sequenciais entre si (mesma área: `/feed`/shell). Podem ser 1 worktree.
- **Revisão final ampla** (opus) sobre o conjunto integrado antes de finalizar.

## Self-Review (writing-plans)

- **Cobertura do spec:** Frente A (tema+menu) → A-Task 1/2 ✓; Frente B (feed 3-col mapeado) → B-Task 1/2/3 ✓ (mapa das seções refletido nas colunas); Frente C (perfil minimizado) → C-Task 1 ✓; Frente D (emojis→SVG + icon-map) → D-Task 1/2/3/4 ✓. Dark só na área logada (root layout + insulamento de escopo) ✓. Emojis UI+e-mail, fixtures intactas ✓. Paralelização em ondas ✓.
- **Placeholders:** nenhum; onde o código exato depende de assinatura existente (ex.: `listThreads` do fórum, render de badges), a task manda **conferir a assinatura no arquivo** — instrução concreta, não TBD.
- **Consistência de nomes:** `ThemeProvider`/`useTheme`, `UserMenu`, `AppShell`, `CONTENT_ICON`/`contentIconName`, ícones `Icon*` — usados de forma consistente entre frentes; interfaces "Produz/Consome" declaradas por frente.
- **Nota de risco:** Frente D remove `FeedCard.emoji` — um contrato consumido pelo `/feed` atual. Como B reescreve o `/feed`, a ordem (D e A na Onda 1; B na Onda 2) garante que B já consome `CONTENT_ICON` em vez de `emoji`. Se o `/feed` atual quebrar entre D e B, é aceitável na master? **Não** — D-Task 3 deve manter o `/feed` atual compilando (ajustar o `feed/page.tsx` atual para usar `CONTENT_ICON` no lugar de `card.emoji`), para a master nunca ficar quebrada entre ondas.
