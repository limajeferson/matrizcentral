# Spec — Casa Unificada: rota pós-compra, diagnóstico por sessão e onboarding

> Frente resultante do brainstorm de 2026-07-13 (retomada do E2E de Stripe, que
> revelou o loop pós-compra). Método: `superpowers:brainstorming` → este spec →
> `writing-plans` por sub-projeto → `subagent-driven-development`.

## Contexto e problema

Ao validar o E2E de compra (Advanced, modo teste), o comprador foi jogado num
**loop**: comprou → página de sucesso → "Começar meu diagnóstico" →
`/dashboard/[token]` que pedia "complete o diagnóstico" → voltava ao quiz →
refazia. Três causas, uma de bug e duas de arquitetura:

1. **Bug (ao vivo):** `POST /api/quiz` (triagem) **não checa o erro** do
   `tokens.update({ profile_id, triaged })` e retorna **200 mesmo em falha**. O
   token fica `triaged=false`/`profile_id=null`, o cliente navega pro dashboard,
   que rejeita → loop silencioso. Confirmado em produção: `/quiz/ZWNT2H852C`
   renderiza o quiz de novo e `/dashboard/ZWNT2H852C` mostra "Complete primeiro".
2. **Dois mundos paralelos:** o mundo **ebook** (token: quiz → perfil →
   `/dashboard/[token]` → roadmap + download + validação → certificado, com
   XP/níveis/badges/ranking) e o mundo **plataforma** (sessão: login → `/conta`
   → `/feed` → entitlements → consumo). O checkout joga **todo mundo no
   mundo-ebook**, inclusive quem compra um passe — destino errado.
3. **Descasamento perfis × conteúdo:** o diagnóstico classifica em **8 perfis
   diversos**, mas **100% do `CONTENT_HUB` é sobre "IA local"**. Os perfis
   existem; o conteúdo para servi-los, não. (Ex.: as 7 respostas do teste caem
   em `profissional_produtividade` com clareza, mas o acervo aponta pra setup
   técnico de modelos.)

O E2E de **receita passou** (webhook `checkout.session.completed` → 200 →
`user`+`purchase`+`token`+`entitlement` criados). O que quebra é a **experiência
pós-compra**, não o dinheiro. (Pendência lateral não coberta aqui:
`BREVO_API_KEY` inválido no Vercel — 401 — trava os e-mails; ver ESTADO-ATUAL.)

## Decisões-âncora (travadas no brainstorm)

1. **Plataforma é a casa.** Todo usuário logado tem **uma casa: `/feed`**. O
   ebook vira **um item** dentro dela. O diagnóstico passa a **personalizar o
   feed** (não só o roadmap do ebook). O `/dashboard/[token]` é **aposentado**;
   suas peças migram.
2. **Primeiro momento feed-first.** Ao logar, cai direto no `/feed` (nunca beco
   sem saída). Um bloco de boas-vindas **incentiva** o diagnóstico — que
   enriquece, não bloqueia. Diagnóstico e gamificação passam a ser **por
   sessão/usuário**, não por token.
3. **Personalização leve.** Os perfis ajustam **tom, ordem e ponto de partida**
   do mesmo acervo. Conteúdo novo é melhoria incremental, não pré-requisito.
4. **Gamificação sobe pra conta.** XP/níveis/badges/desafios/ranking/certificado
   passam a ser da conta logada, visíveis na casa. O roadmap do ebook vira a
   **página de detalhe do item ebook**.

## Arquitetura-alvo

Casa única `/feed` para todo usuário logado. Login por magic link (frente
`login-real`, já construída) → `/feed` personalizado pelo perfil (se
diagnosticado). `/conta` mostra conta, entitlement e gamificação. Diagnóstico e
perfil vivem em `users` (sessão), não em `tokens`. Pós-compra → magic link →
`/feed`. `/dashboard/[token]` deixa de receber tráfego novo (SP1) e é aposentado
quando a gamificação migra (SP2).

## Rota por tipo de usuário

| Tipo | Acesso | Vê na casa (`/feed`) | Ação principal |
|---|---|---|---|
| **Visitante** (não logado) | `view` | Prévias (capa/manchete); comunidade bloqueada | Landing → `/oferta` |
| **Start** (grátis, cupom 30d) | `view` | Feed com prévias; só `startIncluded` consumível | Diagnóstico + upgrade |
| **Ebook** (item, R$47) | `view`\* | Feed + **item ebook com detalhe** (roadmap do perfil + download + validação→certificado) | Consumir ebook, ganhar XP |
| **Regular** (R$97/12m) | `regular` | Feed navegável; **1 conteúdo/mês** (quota) | Escolher o conteúdo do mês |
| **Advanced** (R$497) | `advanced` | Feed completo + **strip de comunidade** + (futuro) criar conteúdo | Consumir tudo, participar |

\*O ebook é um item; acesso de **consumo** de plataforma vem dos passes, não do ebook.

## Mapa da oferta

Ancorado no modelo já construído (`resolveAccess` → view/regular/advanced,
`canConsume` por quota mensal, `ContentGate`) e no acervo real (`CONTENT_HUB`).

| Tier | Consome | Comunidade | Gamificação |
|---|---|---|---|
| **view** (Visitante/Start) | Só `startIncluded` (hoje: 1 relatório benchmark) + votar em pesquisas | — | XP por amostra/validação |
| **Regular** | 1 conteúdo/mês à escolha + tudo do view | Lê | XP/níveis/badges/ranking |
| **Advanced** | Tudo, ilimitado | Lê + (futuro) cria | Tudo + certificado |
| **Ebook** (item) | O ebook + roadmap de perfil + validação→certificado | — | XP do roadmap/validação |

## Primeiro momento (onboarding, feed-first)

1. Login (magic link) → **`/feed`**.
2. **Bloco de boas-vindas** no topo (dispensável): convida ao diagnóstico de
   ~1 min para personalizar. Se o usuário já tem perfil, o bloco não aparece.
3. Diagnóstico **inline, por sessão** → grava perfil na conta.
4. Feed **reordena**: o "comece por aqui" do perfil no topo + copy ajustada ao
   perfil + card "sua trilha começa aqui". (Personalização leve — SP3.)
5. **CTA por tier:** Start → upgrade; Regular → "escolha seu conteúdo do mês";
   Advanced → "explore tudo + comunidade".
6. Se possui **ebook** → card do item em destaque: "continue seu roadmap".

## Backlog de conteúdo (o mapa de produção)

| Prioridade | Item | O que falta |
|---|---|---|
| **P0 — maior buraco** | **6 de 9 itens estão "em breve"** (4 podcasts + 2 vídeos) | URL de embed (Spotify/YouTube). Sem isso o feed parece vazio |
| **P1** | Ponto de partida por perfil (8 perfis) | Copy de "comece por aqui" — **reusa `week_1`** de `profiles.study_roadmap` |
| **P2** | Amostra grátis (ativação do Start) | Hoje só 1 item `startIncluded`; considerar ampliar pra 2-3 |
| **Já pronto** | 2 relatórios, 1 pesquisa, validação→certificado | Funcionando |

## Decomposição em sub-projetos

| # | Sub-projeto | Entrega | Depende de |
|---|---|---|---|
| **SP1** | Casa unificada + diagnóstico por sessão | Pós-compra → `/feed`; diagnóstico por sessão grava perfil na conta; corrige o loop. Fundação. | — |
| **SP2** | Gamificação por sessão + ebook vira item | XP/níveis/badges/ranking/certificado migram token→conta; roadmap → detalhe do item ebook; aposenta `/dashboard/[token]`. | SP1 |
| **SP3** | Personalização leve do feed | Feed reordena por perfil + polish de oferta/gating por tier. | SP1 |
| **SP4** | Backlog de conteúdo | Publicar os 6 "em breve", ampliar amostra grátis, copy de partida por perfil. Sobretudo produção. | paralelo |
| **SP5** | Feed UGC | Usuários criam conteúdo (submissão, moderação, exibição). Subsistema novo. | SP1–SP3 |

**Ordem:** SP1 → SP2 → SP3, com SP4 em paralelo (produção) e SP5 por último.

---

## SP1 em detalhe (primeiro a implementar)

**Objetivo:** todo usuário logado tem uma casa única (`/feed`); o diagnóstico
roda por sessão e grava o perfil na conta; o pós-compra leva ao `/feed`; o loop
é eliminado.

### Mudanças de dados

- **Migration** (próximo número livre): adicionar `profile_id text` e
  `diagnosed_at timestamptz` na tabela **`users`**. `profile_id` referencia
  `profiles(id)` (mesma FK que hoje existe em `tokens`) — **mas** o endpoint
  passa a **checar o erro** e nunca "finge sucesso".
- **Backfill** (idempotente): para usuários que já têm um token triado, copiar
  `tokens.profile_id` → `users.profile_id` (poucos registros de teste).

### Endpoints / lógica

- **Novo** `POST /api/diagnostico` (session-based): exige sessão
  (`getSessionUser`); recebe `answers`; calcula `scoreTriagem(QUIZ_TRIAGEM,
  answers)` (lógica pura já testada, reusada); grava `profile_id`+`diagnosed_at`
  em `users` **checando o erro** (retorna 500 em falha → cliente mostra retry
  real, sem loop); concede XP de diagnóstico na conta (idempotente por usuário).
- `POST /api/quiz` (legado, token) permanece só enquanto SP2 não aposenta o
  dashboard-token; **corrigir o bug** aqui também (checar o erro do update e
  retornar 500 em falha), para não deixar o loop vivo na transição.

### UI

- **`/feed`**: bloco de boas-vindas no topo quando `user && !user.profile_id` →
  abre o diagnóstico inline (reusa `QuizTriagem`, apontando para
  `/api/diagnostico`). Após concluir, recarrega o feed. Sem perfil, o feed
  funciona normalmente (diagnóstico não bloqueia).
- **Página de sucesso do checkout** (`/checkout/sucesso` + `AccessReveal`):
  troca "Começar meu diagnóstico" (link token→quiz) por **"Entrar para acessar"**
  (dispara magic link para o e-mail da compra via fluxo `login-real`) → destino
  `/feed`. Mantém o reenvio por e-mail como rede de segurança.
- Nenhum fluxo **novo** aponta para `/dashboard/[token]` (a aposentadoria
  completa é SP2).

### Arquivos relevantes (existentes)

- `src/lib/quiz-scoring.ts` (`scoreTriagem`, puro, testado) — reusar.
- `src/components/quiz/QuizTriagem.tsx` — generalizar o endpoint alvo
  (`/api/quiz` → parametrizável ou novo componente que POSTa em `/api/diagnostico`).
- `src/app/api/quiz/route.ts` — corrigir checagem de erro do update.
- `src/app/feed/page.tsx` — bloco de boas-vindas + diagnóstico inline.
- `src/app/checkout/sucesso/AccessReveal.tsx` — trocar revelação de token por
  magic link → `/feed`.
- `src/lib/auth-session.ts` (`getSessionUser`) — gating de sessão.

### Critério de aceite (SP1)

- Comprador novo, após pagar, recebe magic link, loga e cai no **`/feed`**.
- Sem perfil → vê bloco de boas-vindas; faz o diagnóstico inline; perfil grava
  em `users`; feed continua utilizável antes e depois.
- **Nenhum fluxo novo** joga o usuário em `/dashboard/[token]`.
- Se o gravar-perfil falhar, o cliente vê **erro real e pode retentar** — sem
  loop silencioso (o 200-em-falha é eliminado).
- `npx tsc --noEmit` exit 0; testes de lógica pura verdes (`scoreTriagem`).

## Não-objetivos / diferido

- **SP5 (Feed UGC)** — usuários criarem conteúdo: subsistema novo, fora deste
  ciclo; só registrado na decomposição.
- **Produção de conteúdo (SP4)** — gravar/publicar os 6 "em breve" é trabalho
  editorial (lado do usuário); o spec mapeia, não produz.
- **Correção do `BREVO_API_KEY` no Vercel** — hand-off de ambiente (chave
  válida), rastreado no ESTADO-ATUAL; não bloqueia SP1 (o feed não depende de
  e-mail).
- Redesenho dos 8 perfis / repricing — fora de escopo (decisão 3 mantém os
  perfis como personalização leve).
