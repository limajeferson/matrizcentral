# Trilha C (Dark-aware) — Plano de Implementação

> REQUIRED SUB-SKILL: superpowers:subagent-driven-development.
> Spec: [`spec-C-dark-aware.md`](spec-C-dark-aware.md). **Um commit por item.**

**Goal:** Tornar a área logada dark-aware (tokens semânticos) e o blog force-light,
eliminando o texto dark-on-dark.

**Architecture:** Blog → wrapper `.force-light` (re-declara os tokens claros).
Logado → substituir classes claras fixas por tokens (`bg-card`, `text-foreground`,
`text-muted-foreground`, `border-border`, `bg-muted`). Começar pelas 3 alavancas
de maior cascata (glass-card, dashboard/layout, Markdown).

**Tech Stack:** Next.js App Router, Tailwind (`darkMode: class`), tokens em `globals.css`.

## Global Constraints (verbatim)
- Custo zero, sem dep npm. Manter layout (só cor/token). Violeta segue acento.
  Gate: `tsc` 0 + `npm run test` + `next lint`. **Verificação visual ao vivo é o
  gate real** (dark E claro). pt-BR. Não tocar `(marketing)` (imune) nem a área
  `app/` nova (já dark-aware).

**Mapa de troca (aplicar em todo Bucket B):** `text-zinc-900`→`text-foreground`;
`text-zinc-700/600/500/400`→`text-muted-foreground`; `bg-white`+cards→`bg-card`
(+`text-card-foreground` se precisar); `border-zinc-200`→`border-border`;
`bg-zinc-50/100`→`bg-muted`; `bg-violet-50`→`bg-violet-500/10`.

---

### Task C1 — Blog force-light
**Files:** Modify `src/app/globals.css`; Create `src/app/blog/layout.tsx`.
- [ ] Adicionar em `globals.css` (fora do `.dark`): uma classe `.force-light`
  que re-declara os custom properties com os valores de `:root` (claros) +
  `color-scheme: light;`. (Copiar os valores do bloco `:root` existente.)
- [ ] Criar `blog/layout.tsx`: `export default function BlogLayout({children})
  { return <div className="force-light min-h-screen bg-background text-foreground">{children}</div>; }`.
- [ ] Gate + **verificar ao vivo** `/blog` e `/blog/[slug]` no tema dark → devem
  renderizar claros e legíveis. Commit `fix(dark): blog force-light (legivel sob dark default)`.

### Task C2 — As 3 alavancas de cascata
**Files:** Modify `src/components/ui/glass-card.tsx`, `src/app/dashboard/layout.tsx`,
`src/components/ui/Markdown.tsx`.
- [ ] `glass-card.tsx`: `border-white/40 bg-white/70` → `border-border bg-card/70`.
- [ ] `dashboard/layout.tsx`: `border-zinc-200 bg-white/70` → `border-border
  bg-card/70`; `text-zinc-400` → `text-muted-foreground`.
- [ ] `Markdown.tsx`: h1/h2/h3/h4 `text-zinc-900`→`text-foreground`; p/li
  `text-zinc-700`→`text-muted-foreground` (ou `text-foreground/90`); tabela
  `border`/header já usam token da Frente 4 — conferir. LER o arquivo, preservar layout.
- [ ] Gate + verificar dashboard (cards de vidro) e um relatório (Markdown) no dark.
  Commit `fix(dark): glass-card + dashboard shell + Markdown theme-aware (cascata)`.

### Task C3 — Páginas do dashboard
**Files:** Modify `src/app/dashboard/[token]/page.tsx`, `conteudo/page.tsx`,
`conteudo/[id]/page.tsx`, `ranking/page.tsx`, `certificado/page.tsx`.
- [ ] Aplicar o mapa de troca em cada arquivo (LER cada um; trocar só as classes
  claras fixas listadas no map da spec). Cuidar de `bg-violet-50 border-violet-300`
  (conteudo/page) → tint dark-safe (`bg-violet-500/10 border-violet-500/40`).
- [ ] Gate + verificar as 5 telas no dark. Commit `fix(dark): paginas do dashboard theme-aware`.

### Task C4 — Fórum + suporte + certificado + quiz
**Files:** Modify `src/app/forum/page.tsx`, `forum/[id]/page.tsx`, `suporte/page.tsx`,
`certificado/[code]/page.tsx`, `quiz/[token]/page.tsx`.
- [ ] Mapa de troca em cada. **Coordenar o fórum com a Trilha D** (D reescreve a
  apresentação; C deixa a base theme-aware — evitar retrabalho: se D vier logo
  depois, C pode fazer só o mínimo no fórum e D já nasce com tokens). LER cada arquivo.
- [ ] Gate + verificar. Commit `fix(dark): forum/suporte/certificado/quiz theme-aware`.

### Task C5 — Widgets de gamificação + forms
**Files:** Modify `src/components/dashboard/{RoadmapCard,BadgeShelf,ChallengeWidget,
LeaderboardOptIn,JornadaToc}.tsx`, `src/components/content/{PesquisaForm,PesquisaResults}.tsx`,
`src/components/support/ContatoForm.tsx`, `src/components/forum/NovoTopicoForm.tsx`,
`src/components/quiz/QuizTriagem.tsx`.
- [ ] Mapa de troca em cada (LER; preservar layout). `DiagnosticoInline.tsx` já tem
  `dark:` — opcional limpar pra token (baixa prioridade; pode ficar).
- [ ] Gate + verificar os widgets no dashboard. Commit `fix(dark): widgets de gamificacao e forms theme-aware`.

## Self-Review
- Cobertura: Bucket A (blog) = C1; alavancas = C2; dashboard = C3; forum/etc = C4;
  widgets = C5. Marketing intocado (imune). Área `app/` nova intocada (já ok).
- Consistência: mesmo mapa de troca em todos; `glass-card`/`Markdown` corrigidos
  uma vez cascateiam. Verificação visual (dark+claro) é obrigatória por task.
