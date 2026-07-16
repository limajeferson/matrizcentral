# Spec — Trilha C: Dark-aware (área logada + blog)

> Programa: [`README.md`](README.md). Corrige o maior risco visual: ~27 arquivos
> usam cor clara fixa (`text-zinc-900`, `bg-white`, `border-zinc-200`, …) rodando
> sob `<html class="dark">` por padrão → texto quase invisível (dark-on-dark).
> Vem **antes da D (Fórum)** pra a nova UI nascer certa. Custo zero, pt-BR.

## Estado atual (mapeado 2026-07-16)

- Tema **dark por padrão site-wide** (theme-script no layout raiz; `darkMode:
  class`). `globals.css` tem `:root` (claro) e `.dark` (escuro) + `body { @apply
  bg-background text-foreground }`.
- **125 hits reais / 27 arquivos** com classes claras fixas. A área **`app/`
  nova** (feed, conta, checkout, entrar) **já é dark-aware** (usa
  `bg-background`/`text-foreground`) — não mexer.
- **Marketing `(marketing)` já é imune:** usa CSS escopado próprio
  (`.mcv2`/`.lp-guide` com cores literais), não toca os tokens dark. **Sem ação**
  (só verificar).
- **Tokens semânticos disponíveis:** `bg-background`/`text-foreground`,
  `bg-card`/`text-card-foreground`, `text-muted-foreground`, `border-border`,
  `bg-muted`, `bg-accent`, `bg-destructive` (todos definidos em `:root` E `.dark`).

## Estratégia por bucket

### Bucket A — Blog: "force light" (o blog é intencionalmente claro)
- Só `src/app/blog/page.tsx` e `src/app/blog/[slug]/page.tsx` (não têm layout, não
  usam `dark:`, herdam o body dark → título `text-zinc-900` some).
- **Fix:** criar `src/app/blog/layout.tsx` que envolve os filhos num container
  **force-light**. Recomendado: adicionar em `globals.css` uma classe
  `.force-light` que **re-declara os valores `:root` (claros)** dos custom
  properties + `color-scheme: light`, e o layout do blog aplica `className=
  "force-light"` num wrapper. Assim tanto as classes fixas quanto qualquer
  `bg-card`/`text-foreground` futuro resolvem claro, independente do `.dark` no
  `<html>`. (Alternativa mais simples: wrapper `bg-white text-zinc-900` — mas a
  classe é mais à prova de futuro.)
- **Marketing:** só conferir que `/oferta`, `/sobre`, `/legal/*` seguem legíveis
  (devem estar — CSS escopado). Sem mudança de código.

### Bucket B — Área logada: tokens semânticos
Trocar as classes fixas por tokens (o tema passa a ser respeitado). Mapa de troca:
`text-zinc-900`→`text-foreground`; `text-zinc-700/600/500/400`→
`text-muted-foreground`; `bg-white`/cards→`bg-card` (+`text-card-foreground`);
`border-zinc-200`→`border-border`; `bg-zinc-50/100`→`bg-muted`;
`bg-violet-50`→`bg-accent`/tint violeta dark-safe (`bg-violet-500/10`).

**Ordem (por alavancagem):**
1. **`src/components/ui/glass-card.tsx`** (PRIMEIRO — cascateia p/ 6 telas):
   `border-white/40 bg-white/70` → `border-border bg-card/70`.
2. **`src/app/dashboard/layout.tsx`** (shell — afeta toda rota do dashboard).
3. **`src/components/ui/Markdown.tsx`** (h1/h2/h3/h4/p/li/tabela → tokens;
   corrige a legibilidade dos relatórios/blog no dark — casa com a Frente 4).
4. Páginas dashboard: `page.tsx`, `conteudo/page.tsx`, `conteudo/[id]/page.tsx`,
   `ranking/page.tsx`, `certificado/page.tsx`.
5. Fórum: `forum/page.tsx`, `forum/[id]/page.tsx` (a Trilha D reescreve parte —
   coordenar; C deixa a base theme-aware).
6. Suporte/certificado público/quiz: `suporte/page.tsx`, `certificado/[code]/
   page.tsx`, `quiz/[token]/page.tsx`.
7. Widgets: `RoadmapCard`, `BadgeShelf`, `ChallengeWidget`, `LeaderboardOptIn`,
   `JornadaToc`, `PesquisaForm`, `PesquisaResults`, `ContatoForm`,
   `NovoTopicoForm`, `QuizTriagem`, (`DiagnosticoInline` — já tem `dark:`, baixa
   prioridade, só limpeza p/ token).

## Item C — decomposição em tasks (ver plano-C)

- **C1:** `.force-light` no `globals.css` + `blog/layout.tsx` (Bucket A) —
  verificação visual do blog no dark.
- **C2:** `glass-card.tsx` + `dashboard/layout.tsx` + `Markdown.tsx` (as 3
  alavancas de maior cascata).
- **C3:** páginas dashboard (5 arquivos).
- **C4:** fórum + suporte + certificado + quiz (coordenar fórum com Trilha D).
- **C5:** widgets de gamificação + forms (o resto).

## Não-objetivos
- Redesign (só troca de cor/token, mantendo layout). Migrar o marketing p/ tokens
  (é imune; fora de escopo). Toggle de tema novo (já existe).

## Verificação
- Gate por item: `tsc` 0 + `npm run test` + `next lint`. **Verificação visual ao
  vivo é o gate real** (é mudança de cor): rodar o app e conferir cada tela no
  tema **dark E claro** — nada de texto sumido; contraste ok; o blog claro e
  legível. Sem migration. Sem dependência nova.
