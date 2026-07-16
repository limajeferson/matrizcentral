# Spec — Trilha G: Tech-debt / limpeza

> Programa: [`README.md`](README.md). Última trilha antes da auditoria. Fecha a
> dívida técnica que a auditoria de arquitetura e o SP2 apontaram. Custo zero,
> pt-BR, commit por item. Depende da **Trilha B** (a dedup de XP é pré-requisito
> do SP2).

## G1 — SP2: aposentar a triagem por token (dupla-contagem de XP)

**Problema confirmado:** `/api/quiz` triagem usa `reference_id = token`;
`/api/diagnostico` usa `reference_id = user.id`. A constraint
`unique(user_id, action_type, reference_id)` da Trilha B **não** deduplica entre
os dois → um comprador pode ganhar **+50 XP de triagem duas vezes** (quiz do
token E diagnóstico da sessão).

**Decisão de escopo (cuidado — há dependência):** o `dashboard/[token]/page.tsx`
lê `tokens.triaged`/`profile_id` (linhas 31,46) pra gatear/renderizar o roadmap.
Simplesmente remover a escrita de triagem quebraria esse gate. Então:
- **Aposentar a rota de XP de triagem do token:** remover o branch
  `quizType === "triagem"` de `src/app/api/quiz/route.ts:37-84` (mantém só
  `validacao`). A triagem/XP passa a ser **só** pela sessão (`/api/diagnostico`).
- **Aposentar a UI antiga:** a página `src/app/quiz/[token]/page.tsx` (QuizTriagem)
  e o link "Diagnóstico Inicial" em `dashboard/[token]/page.tsx:35`.
- **Substituir o gate do roadmap:** o dashboard passa a ler o perfil da
  **sessão/usuário** (`users.profile_id`/`diagnosed_at`, que o `/api/diagnostico`
  já grava) em vez de `tokens.triaged`. Se um comprador só-token (sem sessão)
  precisar do roadmap, o caminho é logar (auto-login pós-compra já existe) e fazer
  o diagnóstico inline no `/feed`. **Verificar** que nenhum comprador fica sem
  roadmap por essa troca (mapear os leitores de `tokens.triaged`/`profile_id` e
  repontar). Este é o item mais delicado — fazer com revisão cuidadosa.

## G2 — Podar código morto

- `src/lib/access.ts:15-47` `resolveQuizUrlBySessionId` — **zero callers vivos**
  (só a rota abaixo). Remover a função.
- `src/app/api/access-status/route.ts` — rota inteira **sem callers** (nada faz
  `fetch("/api/access-status")`). Remover o arquivo.
- Manter `resendAccessByEmail` e `resolveUserBySessionId` (vivos) no `access.ts`.

## G3 — Auto-login: mint-then-consume (hoje é consume-then-mint)

- `src/app/api/checkout-login/route.ts:12-27` chama `resolveUserBySessionId`
  (que **consome** o `session_id` inserindo em `checkout_logins`, `access.ts:132-139`)
  **antes** de `createSession`. Se `createSession` falhar (ele dá `throw`,
  `auth-session.ts:93-103`), o `session_id` já foi consumido → retry sempre
  `ready:false` → **login perdido**.
- **Fix:** reordenar para **createSession primeiro, consumir depois** (só marcar o
  `checkout_logins` como usado após a sessão existir). Preservar o uso-único
  (idempotência): se a sessão já foi mintada e o consume falha por replay, tratar
  como sucesso do login corrente, não erro. Ajustar `resolveUserBySessionId` p/
  separar "resolver o user" de "consumir" (duas etapas), ou mover a inserção em
  `checkout_logins` pro route handler após o `createSession`.

## G4 — `resolveTokenRow()` DRY (13 cópias)

- 13 sites duplicam `from("tokens").select(...).eq("token", token).maybeSingle()`
  + `isTokenExpired(valid_until)`, com **colunas e mensagens divergentes** (4×
  `select("*")`, 6× `purchase_id,valid_until`, 1× ordem trocada, 2× só
  `valid_until`; mensagens "token não encontrado" vs "token inválido ou expirado").
- Criar `src/lib/tokens-data.ts`:
  ```ts
  export type TokenRow = { token: string; purchase_id: string; valid_until: string; /* +campos que * traz */ };
  export async function resolveTokenRow(token: string):
    Promise<{ row: TokenRow | null; status: "ok" | "not_found" | "expired" }>;
  ```
  (seleciona um superset — `*` domina metade dos sites — e centraliza a mensagem.)
- Migrar os **13 sites**: rotas `challenges/claim`, `roadmap/complete`, `download`,
  `content/complete`, `pesquisa/responder`, `leaderboard/opt-in`, `quiz`; páginas
  `quiz/[token]`, `dashboard/[token]/{page,ranking,conteudo,conteudo/[id],certificado}`.
  Preservar a UX de mensagem dupla do site #1 (`quiz/[token]`) se desejado, ou
  unificar (decisão: **unificar** numa mensagem só é aceitável). 
- **Fechar o trap latente:** `entitlement-access.ts:7` `resolveUserIdByToken` não
  checa expiry (hoje protegido só pela ordem de chamada). Rotear pelo
  `resolveTokenRow` (ou checar expiry ali) pra fechar por construção.

## G5 — Cursor de paginação com tiebreak

- `src/lib/feed-posts.ts:40-46` `listPosts` ordena/pagina só por `created_at`
  (`.order desc` + `.lt("created_at", before)`), sem desempate → posts com
  timestamp idêntico podem pular/duplicar entre páginas.
- **Fix:** cursor composto `(created_at, id)` — `.order("created_at", desc)` +
  `.order("id", desc)`, e o cursor passa `before` como `created_at|id`; o filtro
  vira `created_at < c OR (created_at = c AND id < i)` (via `.or(...)`). Atualizar
  o consumidor da paginação (`/api/feed/page` + `FeedTimeline`) se o formato do
  cursor mudar. Testar `mergeFeedPage`/ordenação com timestamps iguais.

## G6 — Remover `erro.png`

- `erro.png` na raiz (81KB, untracked, não-gitignored) — screenshot de debug.
  Deletar do working tree (nunca foi commitado; sem operação git).

## Não-objetivos / diferido
- Rate limit distribuído (Trilha B decidiu em-memória). Reescrever gamificação.
- Migrar `ContentGate` p/ tokens (é da Trilha F, não daqui).

## Verificação
- Gate por item: `tsc` 0 + `npm run test` + `next lint`. **SP2 (G1) e auto-login
  (G3) exigem verificação ao vivo** (jornada de compra→auto-login→diagnóstico→
  roadmap; garantir que ninguém perde o roadmap nem dupla-conta XP). `resolveTokenRow`
  e cursor composto ganham testes puros/de integração. Sem migration nova.
