# Trilha G (Tech-debt / limpeza) — Plano de Implementação

> REQUIRED SUB-SKILL: superpowers:subagent-driven-development.
> Spec: [`spec-G-techdebt.md`](spec-G-techdebt.md). **Um commit por item.** Depende
> da Trilha B (dedup de XP). Última antes da auditoria.

**Goal:** Fechar a dívida técnica e o SP2 (dupla-contagem de XP de triagem).

## Global Constraints
- Custo zero, pt-BR. Gate: `tsc` 0 + `test` + `lint`. **G1 e G3 exigem
  verificação ao vivo** (jornada compra→auto-login→diagnóstico→roadmap). Sem
  migration nova.

---

### Task G1 — SP2: aposentar a triagem por token (CUIDADOSO)
**Files:** Modify `src/app/api/quiz/route.ts`, `src/app/dashboard/[token]/page.tsx`;
delete/retire `src/app/quiz/[token]/page.tsx` (e `QuizTriagem` se órfão).
- [ ] **Antes de remover:** mapear todos os leitores de `tokens.triaged`/`profile_id`
  (`dashboard/[token]/page.tsx:31,46`) e definir o read alternativo pela
  sessão/usuário (`users.profile_id`/`diagnosed_at`, que `/api/diagnostico` grava).
- [ ] Remover o branch `quizType === "triagem"` de `quiz/route.ts:37-84` (mantém só
  `validacao`). Aposentar a UI (`quiz/[token]/page.tsx`) e o link "Diagnóstico
  Inicial" (`dashboard/[token]/page.tsx:35`). Repontar o gate do roadmap p/ o perfil
  da sessão.
- [ ] **Verificar ao vivo:** comprador → auto-login → diagnóstico inline no /feed →
  roadmap aparece; **XP de triagem só uma vez**. Ninguém fica sem roadmap.
- [ ] Gate + Commit `refactor(sp2): aposenta triagem por token (fim da dupla-contagem de XP)`.

### Task G2 — Podar código morto
**Files:** Modify `src/lib/access.ts` (remove `resolveQuizUrlBySessionId`); delete
`src/app/api/access-status/route.ts`.
- [ ] Confirmar zero callers (grep `access-status`, `resolveQuizUrlBySessionId`),
  remover a função e a rota. Manter `resendAccessByEmail`/`resolveUserBySessionId`.
- [ ] Gate + Commit `chore: remove codigo morto (access-status, resolveQuizUrlBySessionId)`.

### Task G3 — Auto-login: mint-then-consume
**Files:** Modify `src/app/api/checkout-login/route.ts`, `src/lib/access.ts`.
- [ ] Separar `resolveUserBySessionId` em "resolver" (sem consumir) e mover a
  inserção em `checkout_logins` (o consume) pro route handler **após** `createSession`
  ter sucesso. Preservar uso-único (replay → tratar como sucesso do login corrente).
- [ ] **Verificar ao vivo:** compra → sucesso → auto-login; simular falha não perde
  o login em retry. Gate + Commit `fix(auth): auto-login mint-then-consume (nao perde login em falha)`.

### Task G4 — `resolveTokenRow()` DRY
**Files:** Create `src/lib/tokens-data.ts` + test; Modify os 13 sites + `entitlement-access.ts`.
- [ ] `tokens-data.ts`: `resolveTokenRow(token)` → `{ row, status: "ok" |
  "not_found" | "expired" }` (seleciona `*`; centraliza a checagem `isTokenExpired`).
  Teste com mock (padrão `access.test.ts`).
- [ ] Migrar os 13 sites (rotas: challenges/claim, roadmap/complete, download,
  content/complete, pesquisa/responder, leaderboard/opt-in, quiz; páginas:
  quiz/[token], dashboard/[token]/{page,ranking,conteudo,conteudo/[id],certificado})
  p/ usar o helper, unificando a mensagem. Rotear `entitlement-access.resolveUserIdByToken`
  pelo helper (fecha o trap de expiry faltante).
- [ ] ⚠️ **14º site, deliberadamente FORA da migração:**
  `src/app/api/webhooks/stripe/route.ts` também usa `isTokenExpired`, mas ali o
  token é **escrito** (revogação em reembolso, Trilha B), não usado como
  credencial de acesso. **Não migrar** — o helper retorna `"expired"` como recusa,
  e o webhook precisa justamente mexer em tokens expirados. Confirmado 2026-07-20.
- [ ] Gate + Commit `refactor(dry): resolveTokenRow compartilhado (13 sites + fecha expiry latente)`.

### Task G5 — Cursor de paginação com tiebreak
**Files:** Modify `src/lib/feed-posts.ts`, `src/app/api/feed/page/route.ts`,
`src/components/app/feed/FeedTimeline.tsx` (se o formato do cursor mudar) + teste.
- [ ] `listPosts`: cursor composto `(created_at, id)` — `.order created_at desc` +
  `.order id desc`; filtro `created_at < c OR (created_at = c AND id < i)` via
  `.or(...)`; `before` passa `created_at|id`. Ajustar o consumidor.
- [ ] Teste da ordenação/merge com timestamps iguais. Gate + Commit `fix(feed): cursor composto (created_at,id) evita pular/duplicar posts`.

### Task G6 — Remover `erro.png`
**Files:** delete `erro.png` (working tree).
- [ ] `rm erro.png` (nunca foi commitado). Commit vazio de doc não necessário;
  registrar no ESTADO. (Sem commit de código; é limpeza do working tree.)

### Task G7 — Teste da elegibilidade do cupom em `/api/checkout`
**Files:** Create `src/app/api/checkout/route.test.ts`. Segue a convenção de
`src/app/api/content/complete/route.test.ts` (mock de `getSupabaseServerClient`
via `vi.mock("@/lib/supabase/server")`, montado por teste com `NextRequest`).
> Achado sem cobertura: o fix `f8561f0` (compra do Start reembolsada não dá
> mais direito ao cupom de upgrade) mudou a query de `purchases` (`+.eq("status",
> "paid")`), mas não existe teste da rota — só o `couponEligible` puro é testado.
- [ ] Mock de `getSessionUser` (`@/lib/auth-session`) e do client Supabase
  (`purchases`, `entitlements`, `stripe.checkout.sessions.create`). Cobrir:
  (1) sem sessão autenticada → `unitAmount` cheio, sem desconto; (2) sessão com
  Start pago há < 30 dias e sem entitlement → desconto de `UPGRADE_COUPON_CENTS`
  aplicado; (3) sessão com Start **reembolsado** (`status != "paid"`) → sem
  desconto (é o caso que `f8561f0` corrigiu); (4) sessão que já tem
  `entitlements` → sem desconto mesmo com Start pago recente.
- [ ] Gate + Commit `test(cupom): cobre elegibilidade do cupom em /api/checkout (reembolso, entitlement, sem sessao)`.

### Task G8 — `plan_waitlist` órfão: investigar e decidir
**Files:** Investigar `src/app/api/waitlist/route.ts` (escreve em `plan_waitlist`)
e todo o repo por leitores da tabela; Modify o que a decisão exigir (rota,
página admin, ou doc registrando a decisão de manter só-escrita).
- [ ] Confirmar por grep que **nada lê** `plan_waitlist` hoje (rota só grava via
  `upsert`). Decidir: (a) expor num lugar (ex.: consulta simples/admin) para o
  dado virar útil, ou (b) remover a escrita se não há plano de uso. **Não
  presumir a saída** — registrar a decisão e a razão no commit/doc.
- [ ] Aplicar a decisão (código mínimo) ou, se for adiar, registrar como
  pendência explícita rastreada (não deixar órfã de novo).
- [ ] Gate + Commit `chore(waitlist): decide destino do plan_waitlist (expõe leitura ou remove escrita orfa)`.

### Task G9 — `StoryViewer`: `visibilitychange` no timer do rAF
**Files:** Modify `src/components/app/stories/StoryViewer.tsx`.
> Achado: o timer por slide (`useEffect` do `tick`, linhas ~64-88) acumula
> `elapsed` a partir de `ts - last` em cada frame do `requestAnimationFrame`; se
> a aba fica em segundo plano, o navegador congela o rAF e, ao voltar, o próximo
> `ts` salta um intervalo grande — o slide avança/pula direto. Nenhum arquivo em
> `src/` usa `visibilitychange` hoje (confirmado por grep).
- [ ] Adicionar listener de `document.visibilitychange`: ao ficar oculta,
  pausar o acúmulo (ex.: marcar `last = null` ou equivalente ao retomar) para
  não contar o tempo em segundo plano como progresso do slide.
- [ ] Gate + verificar manualmente (trocar de aba durante uma história e
  voltar; o slide não deve pular). Commit `fix(stories): visibilitychange evita pulo de slide ao voltar de aba em 2o plano`.

### Task G10 — Focus-trap do drawer mobile do `AppHeader`
**Files:** Modify `src/components/app/AppHeader.tsx`. Reusa
`src/lib/use-focus-trap.ts` criado na **Task F1** da Trilha F — **depende da F1
já ter sido executada** (se G rodar antes de F, criar o hook aqui e a F1 apenas
reusa).
> A Task F1 cobre o focus-trap de `ExpandableContentCard` e `StoryViewer`; o
> drawer mobile do `AppHeader` (`role="dialog"`, aberto por `open`/`setOpen`,
> linhas ~118-144) ficou de fora — hoje só tem foco inicial + Escape, sem
> ciclar `Tab`/`Shift+Tab` dentro do painel.
- [ ] Aplicar `useFocusTrap(panelRef, open)` no `<motion.aside>` do drawer,
  junto do Escape/overflow já existentes.
- [ ] Gate + verificar teclado (Tab não escapa do drawer para o conteúdo atrás
  do overlay). Commit `fix(a11y): focus-trap no drawer mobile do AppHeader`.

## Self-Review
- Cobertura: SP2 (G1), dead code (G2), auto-login (G3), DRY (G4), cursor (G5),
  erro.png (G6), teste do cupom no checkout (G7), destino do `plan_waitlist`
  (G8), `visibilitychange` no StoryViewer (G9), focus-trap do drawer do
  AppHeader (G10). G1/G3 com verificação ao vivo. Puros/integração testados:
  `resolveTokenRow`, cursor, elegibilidade do cupom. Depende da dedup de XP
  (Trilha B) já estar aplicada; G10 depende do hook `use-focus-trap.ts` da
  Task F1 (Trilha F).
