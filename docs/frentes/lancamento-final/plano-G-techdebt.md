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

## Self-Review
- Cobertura: SP2 (G1), dead code (G2), auto-login (G3), DRY (G4), cursor (G5),
  erro.png (G6). G1/G3 com verificação ao vivo. Puros/integração testados:
  `resolveTokenRow`, cursor. Depende da dedup de XP (Trilha B) já estar aplicada.
