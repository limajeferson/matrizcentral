# Spec — Redesign do Feed (Community Feed) — Baseline / Stage 1

> Frente de redesign visual a partir do design do usuário no Claude Design
> (projeto `696b28ff-ed02-48a1-bd99-195128d94851`, arquivo `Community Feed.dc.html`).
> Método: `superpowers:brainstorming` → este spec → `writing-plans` →
> `subagent-driven-development` (frentes paralelas via worktrees).

## Contexto e estratégia

O usuário criou um design no Claude Design cuja base é um **template genérico
de rede social** (dating/comunidade: busca por cidade, "matches", posts) com
acento **rosa `#f3427f`** e fonte **Nunito**. O reaproveitável é a **linguagem
visual** (grid de 3 colunas, cards arredondados, rail horizontal, card
flutuante de perfil, top bar), **não** o conteúdo nem as cores.

**Estado atual do código:**
- `/feed`: página simples de 2 seções (comunidade gated + cards de conteúdo),
  cores Tailwind hardcoded (zinc/violeta), sem grid 3-col, sem card de perfil.
- `globals.css`: **já tem** o sistema de tokens shadcn `:root` (claro) e `.dark`
  (escuro), com **primary = violeta** (a marca). **Mas não está ligado** —
  `<html>` não tem `.dark`, não há provider nem toggle.
- `SessionNav`: só um link "Minha conta"/"Entrar" — **não existe menu de usuário**.
- Fonte: Geist. **96 emojis em 39 arquivos** (badges, dashboard, feed, gate,
  e-mails, fixtures de teste).

**Estratégia em etapas (decisão do usuário):** subir primeiro a **versão
genérica-mas-com-a-marca-da-Matriz como baseline** (aceitável e com rollback).
Depois, aplicar cada item do **backlog do usuário separadamente**, um a um, para
avaliar cada mudança isoladamente e poder voltar ao baseline se destoar. **Este
spec cobre só o baseline (Stage 1).**

## Decisões-âncora (travadas no brainstorm)

1. **Estrutura do template + marca da Matriz.** Adota o layout/estilo, mantém
   **violeta `#7c5cff`** e a tipografia atual; cada seção mapeia para entidades
   reais (conteúdo, comunidade, perfil/nível, fórum).
2. **Tema dark como padrão, só na área logada** (feed, conta, fórum, suporte +
   header). Landing de marketing (`.mcv2`) e `/oferta` seguem como estão.
3. **Remoção de emojis em UI + e-mails** → ícones SVG. Fixtures de teste ficam
   intocadas.
4. **Baseline primeiro; backlog depois**, incremental, com rollback ao baseline.

## As 4 frentes (baseline)

### Frente A — Tema (dark padrão + menu de usuário)
- **ThemeProvider caseiro** (zero-dep): contexto React + script inline no
  `layout.tsx` que aplica `.dark` no `<html>` **antes da pintura** (anti-flash),
  lendo `localStorage` (`mc-theme`, default `"dark"`).
- **`UserMenu`** (client): avatar (inicial do e-mail) → dropdown com **nível/XP**
  (`getLevelProgress` do `total_xp`), **toggle de tema** (claro/escuro),
  **"Minha conta"** (`/conta`), **"Sair"** (`POST /api/auth/logout`). Substitui o
  link simples do `SessionNav` para o usuário logado.
- **Interface para B:** A entrega o `UserMenu` como componente; B o monta na top
  bar. A entrega o `ThemeProvider`; a área logada é envolvida por ele.

### Frente B — Feed redesign (grid 3-col mapeado)
- **Shell logado**: top bar + grid de 3 colunas responsivo (colapsa no mobile),
  usando **tokens semânticos** (`bg-card`/`text-foreground`/etc.) para ser
  theme-aware, com o **acento violeta** no lugar do rosa do template.
- Componentes: `TopBar` (monta o `UserMenu` da Frente A), `LeftSidebar`,
  `CenterColumn`, `RightSidebar`. Dados reais (ver mapa abaixo).
- Mantém a **estrutura visual do template** (cards arredondados, rail, sombras
  suaves) — é o "modelo genérico aceitável".

### Frente C — Card de perfil flutuante minimizado
- O template tem um card grande (400px, canto inferior direito). **Minimizado**:
  **pill compacto** (avatar + nome + nível) fixo no canto, que **expande** ao
  clicar para o card completo (plano/entitlement, progresso de XP, atalho para
  `/conta`). Dispensável. Montado no shell logado.
- Consome tema (A) e ícones (D).

### Frente D — Emojis → ícones SVG (+ lista de mapeamento)
- **Conjunto de ícones SVG inline** (zero-dep) em `src/components/ui/icons/`,
  no estilo do design (stroke, viewBox 24). Cobre: busca, sino, chat, nav
  (feed/conteúdos/fórum/conta/suporte), categorias de conteúdo
  (relatório/podcast/vídeo/pesquisa), badges, seta, check.
- **Varredura**: substitui emojis de **UI** (labels de `badges.ts`, dashboard,
  `ContentGate`, cards, botões, categorias) e remove emojis de **e-mails**
  (`email.ts`, assuntos/corpos). **Não** toca fixtures de teste.
- **Entregável**: `docs/frentes/feed-redesign/icon-map.md` — tabela
  emoji → ícone/arquivo, por local.

## Mapa das seções do feed (Frente B)

| Região do template | Vira na Matriz | Fonte de dados |
|---|---|---|
| Top bar (busca + ícones + avatar) | Logo + busca de conteúdo + sino + **avatar → `UserMenu`** | sessão, content-hub |
| Nav lateral esquerda | Feed · Conteúdos · Fórum · Conta · Suporte (ícones SVG) | rotas existentes |
| "Popular cities" | **Explorar por formato** (relatório/podcast/vídeo/pesquisa) | `CONTENT_HUB` types |
| "Online in your neighbourhood" (rail) | Rail **"Comece por aqui / Continue"** | perfil (`profile_id`) + `CONTENT_HUB` |
| "Recent posts" | Mix de **conteúdo do hub** (selo NOVO/em breve, gated) + **threads do fórum** | `buildContentFeed`, `forum` |
| Right sidebar ("Recently joined") | **Comunidade**: atividade recente (gated a Advanced) + **ranking** | `getCommunityActivity`, leaderboard |
| Floating profile card | **Seu perfil** minimizado (Frente C) | sessão, XP, entitlement |

## Decomposição e paralelização (para o SDD)

Frentes divididas para rodarem em **worktrees isoladas** (o usuário pediu
paralelismo por subagentes). Dependências ditam duas ondas:

- **Onda 1 (paralela): A + D.** Fundações independentes — A mexe em
  `layout.tsx`/tema/`UserMenu`; D cria os ícones e varre `badges`/dashboard/
  `ContentGate`/`email.ts` (não toca o novo feed). Sem sobreposição de arquivos.
- **Onda 2: B, depois C.** B constrói o shell do feed (consome o `UserMenu` de A
  e os ícones de D); C monta o card de perfil no shell. B e C tocam a mesma área
  (shell logado) → **sequenciais** (B → C) para evitar conflito, ou C montado via
  layout logado.

Cada onda: implementer + revisão dupla por task; revisão ampla final ao juntar.

## Não-objetivos / diferido (backlog — Stage 2+)

- **Itens do backlog de design do usuário** — aplicados depois do baseline, um a
  um, cada um como mudança incremental com rollback ao baseline.
- **Dark no site inteiro** (`/oferta`, dashboard, checkout) — migrar cores
  hardcoded dessas páginas para tokens fica para o backlog (risco de regressão).
- **Adotar rosa/Nunito** — descartado (mantém a marca violeta/Geist).
- Busca de conteúdo funcional, notificações reais — o baseline pode entregar a
  casca visual; a lógica fica para o backlog se não for trivial.

## Restrições / ambiente

- **Custo zero:** sem dependências npm novas — ThemeProvider e ícones são
  caseiros (Canvas/CSS/inline SVG). Nada de `next-themes`/bibliotecas de ícone.
- **Comunicação e copy em pt-BR.**
- **Gate:** `npx tsc --noEmit` exit 0 + `npm run test` verdes. Componentes/UI
  verificados rodando o app (`npm run dev -- -p 3000`) — não há unit-test de
  componente (vitest node-env). `npm run build` roda ESLint (não deixar
  `no-unused-vars`/lint quebrar o deploy — ver hand-off do SP1).
- **CSS por escopo:** o novo shell logado usa tokens semânticos + Tailwind; não
  vazar estilo para `.mcv2` (landing) nem `.lp-guide` (`/oferta`).
- **Acessibilidade:** ícones SVG com `aria-label`/`title` onde substituem texto.
