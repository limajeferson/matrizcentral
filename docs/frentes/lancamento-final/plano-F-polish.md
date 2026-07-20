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
**Files:** Create `src/lib/use-focus-trap.ts`; Modify
`src/components/app/feed/ExpandableContentCard.tsx`,
`src/components/app/stories/StoryViewer.tsx`.
> Caminhos conferidos em 2026-07-20. O Escape **já existe** nos dois
> (`ExpandableContentCard.tsx:31`, `StoryViewer.tsx:95`) — só falta o trap.
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
**Files:** Modify `src/components/app/stories/StoryViewer.tsx`,
`src/components/app/feed/RankingList.tsx`,
`src/components/app/feed/FeedTimeline.tsx`,
`src/components/app/feed/ExpandableContentCard.tsx`.
> Caminhos conferidos em 2026-07-20. Nenhum usa `useReducedMotion` hoje.
- [ ] Em cada, `const reduce = useReducedMotion()` (framer-motion) e curto-circuitar
  as transições p/ instantâneo quando `reduce` (StoryViewer: desligar/alongar o
  auto-avanço).
- [ ] Gate + verificar com reduced-motion emulado (DevTools). Commit `fix(a11y): respeita prefers-reduced-motion na area logada`.

### Task F4 — ContentGate → tokens
**Files:** Modify `src/components/auth/ContentGate.tsx`.
- [ ] `border-white/10`→`border-border` (:18); `bg-black/40`→`bg-card/60` (:18);
  `text-white/70`→`text-muted-foreground` (:19, :25, :36, :43);
  `text-white`→`text-foreground` **só na :22**.
- [ ] ⚠️ **NÃO trocar** o `text-white` das linhas **29 e 40** — são o texto do
  botão sobre `bg-violet-600`; viram ilegíveis no tema claro se virarem token.
- [ ] Gate + verificar (dark/claro). Commit `fix(dark): ContentGate usa tokens semanticos`.

### Task F5 — Links mortos
**Files:** Modify/delete `src/components/marketing/Header.tsx`, `Footer.tsx`;
Modify `src/components/marketing/v2/LandingHeader.tsx`.
- [ ] ⚠️ **Conferido em 2026-07-20: `Header.tsx` e `Footer.tsx` AINDA SÃO
  IMPORTADOS** por `src/app/(marketing)/oferta/page.tsx:1-2`. **Não remover** —
  só repontar as âncoras mortas: `/#features` em `Header.tsx:22,45` e
  `Footer.tsx:9` → `/#sistema`. (`/#preco` em Header:25,48 e Footer:10 é válido.)
- [ ] `LandingHeader.tsx`: qualificar as âncoras relativas → `#sistema` (:8),
  `#processo` (:9), `#preco` (:10) e `#faq` (:15) viram `/#sistema`, `/#processo`,
  `/#preco`, `/#faq`.
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
- [ ] **Termos:** `legal/termos/page.tsx:38-51`. ⚠️ **Conferido em 2026-07-20: os
  termos publicados hoje prometem 7 dias INCONDICIONAIS** — _"O produto de entrada
  (R$47) inclui garantia de 7 dias. Se, dentro desse prazo, você concluir que o
  conteúdo não atende às suas expectativas, devolvemos o valor pago."_ — sem
  nenhuma menção aos smart gates. **Isto é uma divergência de consumidor, não só
  de copy:** o código nega reembolso a quem fez triagem/baixou, mas os termos não
  avisam. **CONFIRMAR COM O USUÁRIO ANTES DE APERTAR** (ver "Decisão pendente"
  no fim desta task); a alternativa segura é afrouxar o código, não os termos.
- [ ] **Aquisição (/oferta):** `OfferPricing.tsx:53` diz "Garantia condicional de
  7 dias (ver termos)", mas ⚠️ **"ver termos" é texto puro — o link NÃO EXISTE**.
  **Criar** o `<a href="/legal/termos#garantia">`. (NÃO tocar o "Cupom … válido
  30 dias" da linha 52 — é validade do cupom, não a garantia.)
- [ ] **Varredura final (alvos já mapeados em 2026-07-20):**
  - `descricao/VERSAO-COMPLETA.md:123` ("Dentro de 30 dias DA COMPRA"), `:130`
  - `docs/copywriter-brief.md:112` ("Garantia do ebook avulso: **30 dias**"),
    `:116`, `:210`
  - `docs/frentes/fase-1-mvp/plano.md:15,547` — **doc histórico, NÃO alterar**
    (registro do que foi feito à época).
  - **NÃO tocar** (são "30 dias" sem relação com garantia): `OfferPricing.tsx:52`
    (cupom), `auth-session.ts:14`, `auth-tokens.ts:4`+test (TTL de sessão),
    `coupon.ts:4`, `arquitetura-1/parte2:58`, `docs/frentes/assinaturas/*`,
    `blog-marketing/marketing.md`.
- [ ] **E-mail:** `email.ts:18` "Seu ebook está confirmado." → "Seu acesso à
  Matriz Central está confirmado."
- [ ] Gate + verificar `/oferta` e `/legal/termos` (7 dias + condições). Commit
  `fix(garantia): padroniza garantia condicional de 7 dias (codigo+doc+termos+copy) + e-mail 'acesso'`.

#### ⚠️ Decisão pendente do usuário (levantada em 2026-07-20)
A varredura revelou que **o código é mais restritivo que os termos publicados**:

| Onde | O que diz hoje |
|---|---|
| Termos (`/legal/termos`) | 7 dias **incondicionais** — "se você concluir que não atende, devolvemos" |
| Código (`refundWindowExpiry`) | janela de **30 dias** |
| Política (`arquitetura-1/parte5`) | 30 dias **com smart gates** (nega se fez triagem ou baixou) |

Alinhar tudo em "7 dias condicionais" **encurta a janela** (30→7) **e adiciona
condições** que o cliente não viu ao comprar. Para quem já comprou, isso é
retroativo e frágil juridicamente (CDC). **Duas saídas — o usuário escolhe:**

- **(a) Termos mandam** (mais seguro): 7 dias **incondicionais** para o produto de
  entrada; código vira `7 * DAY_MS` e os smart gates saem do caminho do R$47
  (ficam só como sinal antifraude, sem negar reembolso). Zero divergência,
  zero risco retroativo.
- **(b) Condicional de verdade:** manter os smart gates e **reescrever os termos**
  para descrevê-los explicitamente + explicar na `/oferta` antes do pagamento.
  Aplicar **só a compras novas** (a partir da data de publicação dos termos).

Sem essa decisão, **não executar** os sub-itens de termos/copy desta task — os
demais (código, doc da política, e-mail, varredura de docs internos) podem seguir.

### Task F7 — Descoberta do certificado
**Files:** Modify `src/components/quiz/QuizValidacao.tsx`, `src/app/dashboard/[token]/page.tsx`.
- [ ] `QuizValidacao.tsx:192`: navegar p/ `/dashboard/${token}/certificado` (a copy
  do botão já diz "Ver Meu Certificado").
- [ ] `dashboard/[token]/page.tsx`: adicionar card/link pro certificado (ao lado do
  Ranking, ~224-236), visível quando conquistado.
- [ ] Gate + verificar. Commit `fix(cx): certificado descobrivel (card no dashboard + botao do quiz)`.

### Task F8 — Forms da /oferta
**Files:** Modify `src/components/marketing/OfferPricing.tsx`.
> ⚠️ **Parcialmente feito pelo commit `94384d7` (Trilha B).** Já existem
> `isValidEmail`, o estado `error` e a exibição de erro quando `!res.ok`.
> **Resta** o que está abaixo.
- [ ] `handleCheckout`: `try/catch/finally`. **Bug real ainda aberto:** uma
  exceção de rede no `fetch` (não um `!res.ok`) deixa `loading` travado em `true`
  para sempre — o `finally` é o conserto.
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
