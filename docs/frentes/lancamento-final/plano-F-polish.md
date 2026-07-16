# Trilha F (UX/a11y/CX polish) — Plano de Implementação

> REQUIRED SUB-SKILL: superpowers:subagent-driven-development.
> Spec: [`spec-F-polish.md`](spec-F-polish.md). **Um commit por item.** Depois da C.

**Goal:** Fechar a11y do backlog + os herdados nunca fechados.

## Global Constraints
- Custo zero, dark-aware (tokens), pt-BR. Gate: `tsc` 0 + `test` + `lint` +
  verificação de teclado ao vivo. Sem migration (exceto se mudar
  `refundWindowExpiry`, que é código puro + teste).

---

### Task F1 — Focus-trap nos modais
**Files:** Create `src/lib/use-focus-trap.ts`; Modify `ExpandableContentCard.tsx`,
`StoryViewer.tsx`.
- [ ] `use-focus-trap.ts`: hook `useFocusTrap(ref, active)` que, quando `active`,
  intercepta `Tab`/`Shift+Tab` ciclando entre os focáveis de `ref` (querySelector
  de `button, a[href], input, [tabindex]:not([tabindex="-1"])`).
- [ ] Aplicar nos dois modais (junto do Escape já existente).
- [ ] Gate + **verificar teclado** (Tab não escapa do modal). Commit `fix(a11y): focus-trap em ExpandableContentCard e StoryViewer`.

### Task F2 — Teclado no UserMenu e ProfileCard
**Files:** Modify `src/components/app/UserMenu.tsx`, `src/components/app/ProfileCard.tsx`.
- [ ] `UserMenu`: Escape fecha; ArrowUp/Down navegam os `role="menuitem"`; foco
  volta ao gatilho ao fechar.
- [ ] `ProfileCard`: trocar `role="dialog"` por disclosure (`aria-expanded` no
  gatilho, sem role modal); Escape recolhe; foco no painel ao abrir e de volta ao
  pill ao fechar.
- [ ] Gate + verificar teclado. Commit `fix(a11y): teclado no UserMenu (menu) e ProfileCard (disclosure)`.

### Task F3 — prefers-reduced-motion
**Files:** Modify `StoryViewer.tsx`, `RankingList.tsx`, `FeedTimeline.tsx`,
`ExpandableContentCard.tsx`.
- [ ] Em cada, `const reduce = useReducedMotion()` (framer-motion) e curto-circuitar
  as transições p/ instantâneo quando `reduce` (StoryViewer: desligar/alongar o
  auto-avanço).
- [ ] Gate + verificar com reduced-motion emulado (DevTools). Commit `fix(a11y): respeita prefers-reduced-motion na area logada`.

### Task F4 — ContentGate → tokens
**Files:** Modify `src/components/auth/ContentGate.tsx`.
- [ ] `border-white/10`→`border-border`; `bg-black/40`→`bg-card/60`;
  `text-white/70`→`text-muted-foreground`; `text-white`→`text-foreground`.
- [ ] Gate + verificar (dark/claro). Commit `fix(dark): ContentGate usa tokens semanticos`.

### Task F5 — Links mortos
**Files:** Modify/delete `src/components/marketing/Header.tsx`, `Footer.tsx`;
Modify `src/components/marketing/v2/LandingHeader.tsx`.
- [ ] Conferir se `Header.tsx`/`Footer.tsx` antigos ainda são importados por alguma
  rota; se não, **remover**; se sim, repontar `/#features`→`/#sistema` (ou seção
  válida).
- [ ] `LandingHeader.tsx:8,10`: âncoras `#sistema`/`#preco` → `/#sistema`/`/#preco`
  (qualificar).
- [ ] Gate + conferir nav. Commit `fix(links): remove/corrige ancoras mortas (marketing)`.

### Task F6 — Garantia consistente (7 dias) em TUDO + e-mail
**Decisão do usuário (travada):** o padrão é **garantia condicional de 7 dias**
(smart gates: dentro da janela **E** não fez triagem **E** não baixou). A copy
(`/oferta`) e os termos **já dizem 7 dias**; o **código e o doc da política dizem
30** → alinhar tudo a **7 dias** e garantir que está explicado na aquisição.

**Files:** Modify `src/lib/tokens.ts`, `src/lib/tokens.test.ts`,
`arquitetura-1/parte5-politica-de-reembolso-smart-gates.md`,
`src/app/(marketing)/legal/termos/page.tsx` (verificar/reforçar),
`src/components/marketing/OfferPricing.tsx` (verificar), `src/lib/email.ts`.
- [ ] **Código:** `tokens.ts:16-18` `refundWindowExpiry` `30 * DAY_MS` → `7 * DAY_MS`.
  `tokens.test.ts:30-33` "30 dias no futuro" → **7 dias** (assert e descrição).
  (O webhook `route.ts` já usa `refundWindowExpiry` → pega os 7 automaticamente.)
- [ ] **Doc da política:** `arquitetura-1/parte5-…smart-gates.md` — trocar toda
  menção "janela de 30 dias"/"Dentro de 30 dias" por **7 dias** (Gate 1 e a lista
  de condições), pra o doc-fonte da garantia bater com o resto.
- [ ] **Termos:** `legal/termos/page.tsx` (`#garantia`/`#reembolso`, linhas ~38-48)
  — confirmar que diz **7 dias** e que descreve as **condições** (smart gates:
  triagem/download) claramente. Ajustar o texto se estiver incompleto.
- [ ] **Aquisição (/oferta):** `OfferPricing.tsx:53` já diz "Garantia condicional
  de 7 dias (ver termos)" — manter; garantir que o link "ver termos" leva ao
  `#garantia`. (NÃO tocar o "Cupom … válido 30 dias" da linha 52 — é validade do
  cupom, não a garantia.)
- [ ] **Varredura final:** grep `30 dias`/`garantia` nos arquivos user-facing e
  docs de produto (`descricao/*`, `contextocentral.md`, `copywriter-brief.md`,
  `crm.md`) — corrigir qualquer menção residual à garantia de 30 dias (ignorar
  cupom, ciclos e outros "30 dias" não relacionados).
- [ ] **E-mail:** `email.ts:18` "Seu ebook está confirmado." → "Seu acesso à
  Matriz Central está confirmado."
- [ ] Gate + verificar `/oferta` e `/legal/termos` (7 dias + condições). Commit
  `fix(garantia): padroniza garantia condicional de 7 dias (codigo+doc+termos+copy) + e-mail 'acesso'`.

### Task F7 — Descoberta do certificado
**Files:** Modify `src/components/quiz/QuizValidacao.tsx`, `src/app/dashboard/[token]/page.tsx`.
- [ ] `QuizValidacao.tsx:192`: navegar p/ `/dashboard/${token}/certificado` (a copy
  do botão já diz "Ver Meu Certificado").
- [ ] `dashboard/[token]/page.tsx`: adicionar card/link pro certificado (ao lado do
  Ranking, ~224-236), visível quando conquistado.
- [ ] Gate + verificar. Commit `fix(cx): certificado descobrivel (card no dashboard + botao do quiz)`.

### Task F8 — Forms da /oferta
**Files:** Modify `src/components/marketing/OfferPricing.tsx`.
- [ ] `handleCheckout`: `try/catch/finally` (reseta `loading`, mostra erro em falha
  de rede).
- [ ] Markup: envolver input+botão num `<form onSubmit={(e)=>{e.preventDefault();
  handleCheckout();}}>` (Enter envia); botão `type="submit"`; `<label htmlFor>`
  oculto (ou `aria-label`) no input.
- [ ] Gate + verificar (Enter envia; falha de rede não trava). Commit `fix(cx): form da /oferta (Enter, try/catch, label)`.

## RightSidebar (usuário) — quando as anotações chegarem
- Cada ajuste vira um item próprio nesta trilha. Não bloqueia F1–F8.

## Self-Review
- Cobertura: F1 trap ✓; F2 teclado ✓; F3 reduced-motion ✓; F4 ContentGate ✓;
  F5 links ✓; F6 copy ✓; F7 certificado ✓; F8 forms ✓. Verificação de teclado é
  gate real nas de a11y.
