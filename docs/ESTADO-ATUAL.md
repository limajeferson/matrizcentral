# 📍 ESTADO ATUAL — Matriz Central

> **Este é o pino "você está aqui".** Se o usuário disser **"continue de onde
> paramos"** (ou der `/clear` e voltar), **leia este arquivo primeiro** — ele
> diz exatamente onde o projeto está, o que acabou de ser feito e qual é a
> próxima ação. Atualize-o ao fim de cada bloco de trabalho.
>
> Ordem de leitura ao retomar: **este arquivo → `CLAUDE.md` → o `README.md` da
> frente ativa → o código fonte-de-verdade.**

_Última atualização: 2026-07-20 (**Programa de Lançamento Final**: 7 trilhas
planejadas inteiras; **Trilha A** fechada do lado do Claude e **Trilha B
(segurança do dinheiro) COMPLETA e no ar** — 268 testes, migrations 0025/0026
aplicadas. Design v2 Frentes 1–4 no ar; a Frente 5 virou a Trilha D. **Próxima:
Trilha C (dark-aware)**.)_

---

## ⏭️ PRÓXIMA AÇÃO (leia isto primeiro ao retomar)

**Estado agora:** site **no ar** em `www.matrizcentral.com.br` (Vercel, auto-deploy
na `master`). Design v2 Frentes **1–4 no ar**; banco **em dia até a `0026`**
(0024 feed_posts, 0025 xp dedup, 0026 waitlist unique — todas aplicadas pelo
Claude via SQL Editor). `npx tsc --noEmit` 0 · `npm run test` **268 testes**
verdes · `next lint` sem erros. HEAD `b47f57c`, sincronizado com `origin/master`.

---

## 🚨 PARE — ESTADO NÃO-SINCRONIZADO (2026-07-20)

**Há ~22 commits LOCAIS, não pushados. NÃO DÊ `git push` antes de ler isto.**

A frente **[leitor-protegido](frentes/leitor-protegido/README.md)** foi construída
inteira (6 tasks, revisadas, 322 testes) mas **não está no ar de propósito**. A
`master` tem auto-deploy: pushar antes de aplicar a migration **`0028`** coloca no
ar um leitor que *parece* funcionar enquanto o livro-razão fica **vazio** — falha
silenciosa, e é justamente o sinal de que a política de garantia depende.

**Antes de qualquer push, nesta ordem:**
1. **Aplicar `supabase/migrations/0028_reading_progress.sql`** no remoto e verificar.
2. **`select status, product_id, count(*) from purchases group by 1,2;`** — se
   houver compra fora de `paid` + {`ebook_llm_local`,`regular_pass`,`advanced_pass`},
   esse cliente **pagou e fica sem acesso a nada** (o download já foi aposentado).
   Corrigir os dados antes.
3. **Verificação visual** — nunca executada; roteiros em `.superpowers/sdd/task-*-report.md`.

⚠️ O **MCP do Supabase não tem permissão** nesta conta (testado em 2026-07-20, não
é suposição). O caminho é o **navegador** → SQL Editor (método no `CLAUDE.md`).
Na sessão de 2026-07-20 o MCP do navegador estava **desconectado** — por isso os
3 bloqueadores ficaram abertos. **Se o navegador estiver disponível agora, resolvê-los
é a primeira tarefa.**

Detalhes completos: [`frentes/leitor-protegido/README.md`](frentes/leitor-protegido/README.md).

---

**Frente ativa: PROGRAMA DE LANÇAMENTO FINAL** (`docs/frentes/lancamento-final/`)
— 7 trilhas planejadas inteiras (specs+planos B–G). Trilha A (Brevo ✅; Stripe com
o usuário) e **Trilha B (segurança do dinheiro) COMPLETAS e no ar**. Este programa
**absorve** a Frente 5 do design-v2 (vira Trilha D) e os backlogs herdados de
a11y/tech-debt (Trilhas F e G) — não há fila concorrente.

**Inserida fora da fila (2026-07-20):** a frente **leitor-protegido**, nascida de
um brainstorm sobre reembolso de má-fé. Ela **precede** a retomada das trilhas
porque já está construída e só falta destravar.

**Faça, nesta ordem (retomar aqui):**
0. **DESTRAVAR A FRENTE LEITOR-PROTEGIDO** (ver o bloco 🚨 acima): aplicar `0028`
   → conferir `purchases` legadas → verificação visual → **então** `git push`.
   Precisa do navegador. Enquanto não destravar, **não pushar**.
1. **Trilha C — Dark-aware**: `plano-C-dark-aware.md`. Blog force-light
   (Bucket A) + área logada→tokens semânticos (Bucket B). Começar por `glass-card`
   (cascateia 6 telas) + `dashboard/layout` + `Markdown`. Verificação visual é o gate.
   ℹ️ **Parcialmente adiantada:** `Markdown.tsx` já virou dark-aware (com prop
   `surface` para superfícies claras fixas). O resto do plano-C segue válido.
2. Depois: **D (Fórum, `parent_reply_id`, migration 0027) → E (conteúdo, paralelo)
   → F (polish + herdados, inclui F6 garantia 7 dias) → G (tech-debt/SP2) →
   auditoria final.**
3. **Aguardando o usuário:** anotações de design da **`RightSidebar`** (entram na
   Trilha F); Stripe live (verificação de empresa); subir a mídia que o Claude
   gerar no NotebookLM (Trilha E).
4. **Follow-up não-bloqueante:** E2E ao vivo do refund (Stripe modo teste) —
   simular `charge.refunded` e confirmar token/entitlement expirados. As migrations
   do programa: 0025/0026 aplicadas ✅; **0027 (fórum) a aplicar na Trilha D**.

**Como trabalhar aqui (harness):** commit por item, gate `tsc` 0 + `npm run test` +
`next lint` sem erros antes de cada commit; custo zero (sem dep npm nova); área
logada é dark-aware/violeta; nunca commitar `CLAUDE.local-draft.md`/`SETUP.md`/
`claude-chat.md`. Ao fim de cada bloco, **atualize este arquivo** (topo + log) e commite.

---

## 🎯 Objetivo geral

Auditar e completar a plataforma Matriz Central **por frentes, receita primeiro**
— deixando cada botão, jornada e interface funcional e segura, e construindo o
que ainda não existe (login, assinaturas, comunidade, CRM, marketing).

Pedido original completo do usuário: [`prompt-pedido.md`](../prompt-pedido.md).

## 🧭 Onde paramos AGORA

- **Concluído antes:** auditoria completa (5 frentes) + hardening dos 4 críticos
  (verificado, na master, commit `0aee161`).
- **Concluído nesta rodada:** **Frente 1 (Login real) implementada ponta a ponta**
  via subagent-driven-development — 11 tasks + fix de normalização + hardening
  pós-revisão-final, **tudo na master**, `tsc` 0 / **118 testes**. Spec + plano em
  [`docs/frentes/login-real/`](frentes/login-real/). Entregue: migrations
  0015/0016, `auth-tokens`/`safe-redirect` (puros, testados), `auth-session`
  (magic link uso-único + sessão revogável + porteiro), rotas
  `/api/auth/*` + `/entrar/verificar`, telas `/entrar` e `/conta`, botão no
  header, `ContentGate`. Revisão final ampla (opus) passou com fixes aplicados.
- **ACEITAÇÃO AO VIVO CONCLUÍDA (2026-07-12):** migrations 0015/0016 aplicadas no
  Supabase de produção (via SQL Editor — `db push` travou por histórico de
  migrations divergente, ver pendência). Login testado ponta a ponta no navegador
  com conta real: no-account, envio, verify→`/conta` logado, "ir para meu painel"
  →`/dashboard/{token}`, uso único (`?erro=link`), logout, header reativo,
  proteção de `/conta`. **Tudo passou.** Decisão #7: landing fica dinâmica.
- **⚠️ ACHADO (não-bloqueante, fora do login):** o Brevo **aceita** o envio
  (API 2xx) mas o e-mail **não chegou** no inbox em 4 min — provável domínio
  remetente não verificado (SPF/DKIM) ou spam. **Afeta também o e-mail de token
  da compra** (mesmo `email.ts`). Investigar config do Brevo separadamente.
- **Frente 2 (Assinaturas) — Plano 1 código completo e revisado** (na master,
  `tsc` 0 / 136 testes): entitlement + consumo/`ContentGate` + Stripe (modo teste,
  cupom/parcelas) + webhook + `/oferta` real. Revisão final (opus) confirmou os
  invariantes de dinheiro; 2 Important corrigidos; migrations 0017/0018 aplicadas.
  Spec/plano em [`docs/frentes/assinaturas/`](frentes/assinaturas/).
- **Frente 2 — Plano 2 (e-mails de ciclo) TAMBÉM código completo e revisado**
  (na master, `tsc` 0 / **145 testes**): `sent_emails`, `computeDueEmails`
  (level-triggered pós-review), 4 e-mails Brevo, cron diário (Vercel Cron),
  confirmação no webhook, endpoint de novos conteúdos. Revisão final (opus) OK.
- **Issue 3 (go-live) RESOLVIDO:** cupom amarrado à sessão autenticada (commit
  `5cf89e3`, revisado). Roadmap das próximas frentes em
  [`docs/ROADMAP-EXECUCAO.md`](ROADMAP-EXECUCAO.md).
- **Frente 3 (Feed) — CÓDIGO COMPLETO E REVISADO** (na master, `tsc` 0 / 149
  testes): `/feed` (cards de conteúdo prévia p/ todos + strip de comunidade
  badges gated a Advanced), `feed.ts` puro, `feed-data.ts`, link no header e
  `/conta`. Revisão final OK + 2 fixes. Spec/plano/ledger em
  [`docs/frentes/feed/`](frentes/feed/). Pendente: verificação visual dos 3
  estados (coordenação runtime).
- **Frente 4 (Fórum) — CÓDIGO COMPLETO E REVISADO** (na master, `tsc` 0 / 158
  testes): tabelas 0020, `/forum` + `/forum/[id]`, escrita gated (sessão+passe),
  sem XP. Revisão final **Ready to merge**. Docs em
  [`docs/frentes/forum/`](frentes/forum/). Pendente: aplicar 0020 + visual.
- **Frente 5 (Blog + Marketing) — CONCLUÍDA:** `/blog` + `/blog/[slug]`
  (SEO via `generateMetadata` + CTA para `/oferta`, posts em markdown +
  manifesto `src/data/blog.ts`, `src/lib/blog.ts` puro testado), link no
  header e footer, + doc de estratégia
  [`docs/frentes/blog-marketing/marketing.md`](frentes/blog-marketing/marketing.md)
  (funil topo/meio/fundo/upsell, calendário editorial, sazonalidade, SEO/e-mail
  Brevo/prova social). Sem login/entitlement, sem migration. Docs em
  [`docs/frentes/blog-marketing/`](frentes/blog-marketing/).
- **Frente 6 (Suporte/CRM) — CONCLUÍDA:** via `subagent-driven-development` (5
  tasks) — `support_messages` (migration `0021`), `validateContactInput` puro
  testado, `sendSupportNotification` (Brevo) + `createSupportMessage`, rota
  `POST /api/suporte`, página `/suporte` (FAQ + `ContatoForm`), link no header
  e footer, e o doc de estratégia
  [`docs/frentes/suporte-crm/crm.md`](frentes/suporte-crm/crm.md) (onboarding
  compra→token→triagem→primeiro valor, retenção via ciclo de e-mails +
  feed/fórum, reativação/win-back de passe expirado, suporte com SLA simples,
  métricas por etapa do funil pós-venda). `tsc` 0. Docs em
  [`docs/frentes/suporte-crm/`](frentes/suporte-crm/).
- **🏁 TODAS AS 6 FRENTES DO ROADMAP ESTÃO ENTREGUES (código + revisão).** Não
  há próxima frente planejada — o que resta é **coordenação de ambiente**
  (abaixo) e o que o usuário priorizar em seguida (não há "próxima ação"
  automática; alinhar com o usuário ao retomar).
- ✅ **Migrations `0019`/`0020`/`0021` APLICADAS no Supabase de produção**
  (2026-07-13, via SQL Editor pelo navegador). Verificado: `/forum` 200 (0020),
  `POST /api/suporte` → `{ok:true}` (0021), 0019 no mesmo paste. **Fluxo de
  suporte validado E2E** (validação + gravação + e-mail entregue ao time).
- ✅ **DEPLOY + CRON DE E-MAILS RESOLVIDOS (2026-07-13, via Vercel CLI):** o
  projeto **já estava no ar** em `www.matrizcentral.com.br` (Git conectado,
  auto-deploy no push; team `promobest`, projeto `matrizcentral`,
  `prj_uyy6wQMfAn91yR8OYXyFStsHIT9Z`). As **7 env vars já estavam configuradas**
  (Production+Preview). Faltava só o **`CRON_SECRET`** — criado via
  `vercel env add` (valor aleatório de 64 chars, encriptado, Prod+Preview),
  seguido de `vercel redeploy` da produção. Cron testado ponta a ponta com
  `vercel crons run /api/cron/emails-diarios` → runtime log **`GET
  /api/cron/emails-diarios 200`** (autenticação Bearer passou). **Cron de
  e-mails de ciclo está vivo** (agenda `0 12 * * *`). Login local do CLI feito
  (`vercel login`, usuário `limajeferson`); `.vercel/` linkado.
- **Coordenação de runtime restante (hand-off de ambiente):** E2E do Stripe modo
  teste — agora dá pra apontar o webhook da Stripe pro endpoint **publicado**
  (`https://www.matrizcentral.com.br/api/webhooks/stripe`) e colar o
  `STRIPE_WEBHOOK_SECRET` via `vercel env add`, sem precisar do Stripe CLI local;
  verificação visual dos estados gated de `/feed` e `/forum` (precisa de sessão
  logada com passe).
- ✅ **E2E STRIPE VALIDADO (2026-07-13):** produção está em **modo teste**
  (`cs_test_`); compra Advanced real → webhook `checkout.session.completed`
  **200** → `user`+`purchase`+`token`+`entitlement` criados (provado por log +
  estrutura da rota). **Caminho de receita OK.** Achado lateral: `BREVO_API_KEY`
  no Vercel está **inválido (401 "Key not found")** → e-mails pós-compra não
  saem (recuperável via página de sucesso/resend; hand-off: repor a chave).
- ✅ **FRENTE CASA-UNIFICADA — SP1 IMPLEMENTADO E REVISADO (2026-07-13):** o
  pós-compra entrava num **loop** (comprador caía no `/dashboard/[token]` do
  ebook, e `/api/quiz` retornava 200 mesmo com o `tokens.update` falhando).
  Brainstorm travou 4 âncoras (plataforma é a casa; feed-first; personalização
  leve; gamificação por sessão) → spec + plano em
  **`docs/frentes/casa-unificada/`** (rota por tipo de usuário, mapa da oferta,
  primeiro momento, backlog de conteúdo, decomposição SP1–SP5). **SP1 executado
  via subagent-driven-development (6 tasks, `tsc` 0 / 183 testes), revisão ampla
  final (opus) = Ready to merge, sem Critical/Important.** Entregue: migration
  0022 (`users.profile_id`/`diagnosed_at`+backfill) e 0023 (`checkout_logins`);
  `POST /api/diagnostico` por sessão (checa erro; XP atômico via claim em
  `diagnosed_at`); fix do bug 200-em-falha no `/api/quiz`; bloco de boas-vindas +
  `DiagnosticoInline` no `/feed`; **auto-login pós-compra** por `session_id`
  (paid + janela 30min + uso único) → `/feed`. Commits `7527cca`..`325007d`.
  **Próxima ação:** aplicar migrations 0022/0023 no remoto → E2E (compra teste →
  auto-login → `/feed` → diagnóstico grava perfil). Depois: **SP2** (gamificação
  por sessão + aposentar `/dashboard/[token]`).
- **Pendências de ambiente:** ✅ migrations **0022/0023 aplicadas**; banco em dia
  até a **0026**. ✅ **`BREVO_API_KEY` reposta e verificada ao vivo** (2026-07-16:
  magic link em produção → evento `delivered` no Brevo). Ainda aberta: verificação
  visual gated (`/feed` strip Advanced, `/forum` como assinante).
- **Follow-ups SP2 (do review final):** aposentar o fluxo token (`/api/quiz`
  triagem + `/dashboard/[token]`) — hoje um comprador que force a URL antiga
  poderia ganhar XP de triagem em dois lugares (sem dedup entre token e sessão);
  podar `resolveQuizUrlBySessionId`/`/api/access-status` (mortos); mint-then-
  consume no auto-login (hoje consume antes de `createSession`).
- ✅ **FRENTE FEED-REDESIGN (baseline) — CONCLUÍDA E REVISADA (2026-07-14):**
  a partir do design do usuário no Claude Design (template genérico "Community
  Feed"), adotada a **estrutura** com a **marca da Matriz** (violeta, não rosa).
  4 frentes via subagent-driven-development (`tsc` 0 / **187 testes** / next
  lint sem erros; revisão ampla opus = **Ready to merge**): **A** tema **dark
  padrão** (só área logada, `ThemeProvider` caseiro anti-flash) + **UserMenu**
  (avatar → nível/XP · toggle tema · conta · sair); **B** `/feed` vira **shell
  de 3 colunas** theme-aware com dados reais (content-hub, fórum, comunidade
  gated a Advanced, perfil/XP), preservando o diagnóstico do SP1; **C** card de
  perfil flutuante **minimizado** (pill que expande); **D** **emojis→ícones SVG**
  em todo o site + e-mails (fixtures intactas), `icon-map.md`. Commits
  `3f89f23`..`dd463e5`. Docs em `docs/frentes/feed-redesign/{spec,plano,icon-map}.md`.
  **Estratégia (decisão do usuário):** este é o **baseline genérico-mas-branded**
  aceitável; os **itens do backlog de design** do usuário entram **depois**, um a
  um, incrementais, com rollback ao baseline.
- **Hand-offs / verificação do feed-redesign:** (1) **visual LOGADO** do `/feed`
  (3 colunas em dark, toggle p/ claro, pill do perfil, bloco de diagnóstico) —
  precisa de sessão logada; (2) conferir páginas claras `/sobre` e `/legal/*`
  (faixa dark do body corrigida com `min-height`). **Backlog rastreado:** a11y de
  teclado (Escape/setas) no `UserMenu`/`ProfileCard`; migrar `ContentGate` p/
  tokens; reavaliar `role="dialog"` do `ProfileCard`; dark no site inteiro.
- ✅ **BACKLOG DE DESIGN — ITEM 1: BARRA DE HISTÓRIAS (STORIES) — CONCLUÍDA,
  REVISADA E VERIFICADA AO VIVO (2026-07-14):** primeira frente do backlog
  incremental, modelo `21st.dev/story-viewer`. **Derivada do conteúdo** (custo
  zero, sem tabela nova): círculo por categoria, slides = itens do `CONTENT_HUB`
  com `publishedAt` nos últimos **7 dias**; viewer fullscreen com barrinhas,
  **auto-avanço de 15s** (rAF pausável), setas/Escape, CTA que respeita o gating.
  Novo campo `publishedAt` + seed (2 relatórios + 1 pesquisa) → a barra nasce com
  **Relatórios** e **Pesquisas**; podcasts/vídeos entram ao publicar. Arquivos:
  `src/lib/stories.ts`(+test), `src/components/app/stories/{StoryBar,StoryViewer}.tsx`,
  `contentHref` extraído em `feed.ts` (DRY), montada em `feed/page.tsx`. `tsc` 0 /
  **193 testes** / lint limpo; revisão final (opus) = Ready to merge, 2 Important
  corrigidos (efeito colateral no updater `setPos`; anel `fuchsia`→violeta).
  Commits `7cabbed`/`87239ca`/`80ddd08`. Docs em `docs/frentes/feed-stories/`.
  **Verificado ao vivo na produção** (logado): barra renderiza os 2 círculos
  corretos; viewer abre com conteúdo/CTA-href certos (gating respeitado),
  scroll-lock + Escape OK. (O progresso de 15s só não animou na automação porque
  o browser congela `requestAnimationFrame` em aba de segundo plano — não é bug.)
  **Minor rastreado:** ao voltar de aba em 2º plano por muito tempo, o slide pode
  pular direto (rAF acumula o gap) — tratar com `visibilitychange` no backlog.
  **Próxima ação:** aguardar o **próximo item do backlog de design** do usuário
  (aplicar isolado, com rollback ao baseline), OU checar visualmente o toggle de
  tema/pill quando conveniente.
- 🔄 **DESIGN v2 (17 modelos 21st.dev) — PROGRAMA EM EXECUÇÃO (2026-07-15):**
  backlog grande do usuário, decidido no brainstorm: **visual + backend juntos**,
  **5 frentes por área, commit por item**. Docs em `docs/frentes/design-v2/`
  (README com as 5 frentes + modelo de dados; spec/plano por frente).
  - **Frente 1 (Moldura) — CONCLUÍDA, revisada, deployada e verificada ao vivo:**
    `AppHeader` (esconde ao rolar + drawer mobile), `LeftSidebar` em seções
    (ativo/colapsável/selos + `formatAvailability` puro), `AppFooter` multi-coluna.
    Revisão opus: 3 Important corrigidos (commit `194c6b7`).
  - **Frente 2 (Feed) — CONCLUÍDA, revisada (Ready to merge) e deployada:** posts
    de usuário (`feed_posts` + `parseNewPost` + rotas), timeline infinita
    (`buildFeedTimeline` + IntersectionObserver + composer), rail galeria
    (`RailGallery` wheel→horizontal), `PostCard`+`relativeTime`, `VideoThumb`
    (play inline YouTube), `ExpandableContentCard` (transição feed→conteúdo).
    3 minors corrigidos (commit `7bc003c`). ✅ Migration `0024_feed_posts`
    **APLICADA no remoto (2026-07-16, pelo Claude via navegador/SQL Editor** —
    injeção Monaco, método documentado no `CLAUDE.md`; verificada:
    `feed_posts` existe com RLS ativo). Publicar post funciona.
  - **Frente 3 (Comunidade) — CONCLUÍDA e revisada (Ready to merge), na master,
    aguardando push (2026-07-15):** via `subagent-driven-development` (3 tasks +
    fix da revisão final, `tsc` 0 / **210 testes** / lint limpo). Entregue:
    `src/lib/leaderboard.ts` puro (`monthStartIso`/`aggregateMonthlyXp`/
    `rankLeaderboard` — testado) + `leaderboard-data.ts` (`getMonthlyLeaderboard`,
    agrega `xp_events` do mês; **só usuários opt-in** com `display_name` não-nulo);
    `RankingList` (lista animada staggered, pódio ouro/prata/bronze via
    `--mc-gold` fallback); `SwipeableActivityList` (atividades com drag-to-dismiss
    + botão "Dispensar" acessível por teclado); montagem na `RightSidebar`
    (Comunidade gated a Advanced **intacto** + novo "Ranking da temporada" só a
    logados) e `feed/page.tsx`. **Sem migration nova.** Revisão final (opus):
    1 Important corrigido (ranking escondido p/ anônimo — commit `76c15ea`);
    7 Minors deferidos (nenhum bloqueia). Commits `c27d78f`..`76c15ea`.
  - **Frente 4 (Conteúdo/mídia) — ✅ CONCLUÍDA, revisada Ready-to-merge e no ar
    (2026-07-16):** 6 tasks via subagent-driven-development —
    `media.ts` puro (parsing YouTube/Spotify incl. `shorts/`, DRY c/ `VideoThumb`),
    `markdown.ts` puro (blocos+ids; corrigiu `####`/tabelas dos relatórios),
    `VideoPlayer`+`MusicPlayerCard` sobre embed, `ArticleToc` (ilha dinâmica,
    relatórios+blog), `JornadaToc` (dashboard), `ShareLinks` (WhatsApp/X/LinkedIn/
    copiar; **invariante verificado: nunca compartilhar URL com token**). Sem
    migration; sem dep nova. Commits `bfa2b64`..`2c44b90`. **No meio, design pass
    do feed** a pedido do usuário (`25d5566`): `content-accent.ts` (identidade por
    tipo), metadados duração·XP, rail com rolagem calma, dialog scale+fade; fix de
    raiz no `tailwind.config` (`content` não incluía `./src/lib`).
  - **Frente 5 (fórum: pergunta+respostas aninhadas) — 📐 desenhada, mas
    MIGRADA para a Trilha D** do programa de lançamento final
    (`lancamento-final/spec-D-forum.md`). É lá que ela é construída.
  - **Programa design-v2: encerrado como fila própria.** O que sobrou vive nas
    trilhas do lançamento final.

## 🌿 Estado do git

- **Branch ativa:** `master`, **sincronizada com `origin/master`** (HEAD
  `b47f57c`, push feito, deploy Vercel disparado). O outro computador recebe
  tudo com `git pull origin master`.
- **Inclui (nesta rodada):** **Trilha B do lançamento final** — reembolso/disputa
  revoga acesso, XP não-duplicável (`0025`), rate limiter, validação+dedupe do
  waitlist (`0026`), testes de `entitlement-access` e `auth-session`; + os
  **6 specs e 6 planos** das trilhas B–G. Antes (já em `origin`): design v2
  Frentes 1–4 (moldura, feed com `0024`, comunidade, conteúdo/mídia + design pass),
  barra de histórias, feed-redesign baseline, SP1.
- **Não versionado (local, de propósito):** `.env.local` (segredos),
  `SETUP.md`, `claude-chat.md`, `CLAUDE.local-draft.md`.

## 🗂️ Frentes (o mapa mestre)

Ordem escolhida pelo usuário: **receita primeiro**.

| # | Frente | Status | README |
|---|--------|--------|--------|
| 0 | Auditoria + Hardening dos 4 críticos | ✅ concluída | [hardening-criticos](frentes/hardening-criticos/README.md) |
| 1 | **Login real** (fundação de identidade) | ✅ **concluída** (implementada, revisada, migrations aplicadas, E2E validado ao vivo) | [login-real](frentes/login-real/README.md) |
| 2 | Assinaturas (Regular/Advanced) + e-mails de ciclo/CRM | ✅ **concluída** (E2E Stripe validado 2026-07-13; deploy+cron vivos; Issue 3 resolvido) | [assinaturas](frentes/assinaturas/README.md) |
| 3 | Feed central (rede social de IA) | ✅ **concluída** (evoluída depois pelo feed-redesign + design v2) | [feed](frentes/feed/README.md) |
| 4 | Fórum (portal de tópicos) | ✅ **concluída** (0020 aplicada, `/forum` 200 em produção) | [forum](frentes/forum/README.md) |
| 5 | Blog + Marketing (calendário/sazonalidade/funil) | ✅ **concluída** (blog público + doc de estratégia) | [blog-marketing](frentes/blog-marketing/README.md) |
| 6 | Suporte/autoatendimento + CRM/pós-venda | ✅ **concluída** (código+revisão; `/suporte` + doc `crm.md`) | [suporte-crm](frentes/suporte-crm/README.md) |

> As tasks do painel do Claude Code **não sobrevivem ao `/clear`** — esta tabela
> é a fonte de verdade das frentes. Ao retomar, recrie as tasks a partir daqui
> se quiser o acompanhamento visual.
>
> **Evolução pós-roadmap (não está na tabela acima):** ✅ casa-unificada (SP1) ·
> ✅ feed-redesign · ✅ feed-stories · ✅ **design-v2** Frentes 1–4
> ([`frentes/design-v2/README.md`](frentes/design-v2/README.md); a Frente 5 virou
> a Trilha D) · 🔄 **lancamento-final** (**programa ativo**, 7 trilhas até a versão
> final — progresso em
> [`frentes/lancamento-final/README.md`](frentes/lancamento-final/README.md)).

### 🚀 Programa de Lançamento Final (fila ativa)

| Trilha | O quê | Status |
|---|---|---|
| A | Go-live de receita (Brevo, Stripe live) | 🔄 Brevo ✅ · **Stripe live = único bloqueio externo** |
| B | Segurança do dinheiro | ✅ **completa e no ar** (268 testes, 0025/0026 aplicadas) |
| C | Dark-aware (blog force-light + logado→tokens) | 📐 planejada — **próxima** |
| D | Fórum: respostas aninhadas (migration `0027`) | 📐 planejada |
| E | Conteúdo (texto agora; mídia via NotebookLM) | 📐 planejada (paralela) |
| F | Polish UX/a11y/CX + garantia 7 dias + herdados | 📐 planejada |
| G | Tech-debt (SP2, DRY, dead code) | 📐 planejada |
| — | 🔍 Auditoria final + dogfooding | 🔜 ao fim |

## 🔒 Decisões travadas (não reabrir sem motivo)

- **Login = conviver, não substituir:** o token continua dando acesso imediato
  pós-compra (atrito zero no R$47); o **login por magic link** (Supabase Auth,
  sem senha, usando o e-mail já cadastrado) é adicionado e passa a ser exigido
  para assinatura, feed, fórum e perfil. **NFT foi descartado** (não resolve
  transferência, quebra custo-zero, e adiciona atrito de carteira cripto).
- **Ordem das frentes:** receita primeiro (tabela acima).
- **Método por frente:** `brainstorming` → `writing-plans` →
  `subagent-driven-development` (executa com revisão a cada task).

## 🧪 Como o projeto é verificado (o "gate")

`npx tsc --noEmit` (exit 0) + `npm run test`. `npm run build` **falha** de
propósito sem `STRIPE_SECRET_KEY` (pré-existente). Para o visual, rodar
`npm run dev -- -p 3000` e conferir no navegador. Detalhe em `CLAUDE.md`.

## ⏳ Pendências / decisões em aberto

- ✅ **E-mail (Brevo) — RESOLVIDO (2026-07-13):** causa raiz era o remetente
  `contato@matrizcentral.com.br` **não validado** no Brevo (log de evento:
  "sender is not valid"). Corrigido **autenticando o domínio** `matrizcentral.com.br`
  no Brevo (DKIM b1/b2 CNAME + TXT brevo-code + DMARC, registros adicionados no
  registro.br). `authenticated: true`. Envio de teste passou de `error` →
  `delivered`. **Sem mudança de código** (o app já enviava desse endereço).
  Vale a compra funcionar depende disso, agora ok.
- **Histórico de migrations do Supabase divergente:** remoto tem versões com
  timestamp; local usa `000N_`. Por isso `supabase db push` falha. Reconciliar
  com cuidado (sem re-rodar seeds) antes de depender do CLI para novas migrations.
- **Deep-return do `next`** (ContentGate): deferido para a frente de deploy do gate.


- **Crítico #4 (copy):** o alinhamento da `/oferta` é de posicionamento/marca —
  o usuário deve revisar o texto do card Start/Advanced e ajustar as palavras.
- **Backlog da auditoria (altos/médios):** revogação de acesso em reembolso,
  forja de XP, rate limiting, links mortos etc. — mapeados em
  [hardening-criticos](frentes/hardening-criticos/README.md), a serem resolvidos
  dentro das frentes seguintes.

## 📓 Log de sessões (append-only, mais recente no topo)

- **2026-07-20 (Opus 4.8 1M) — FRENTE LEITOR PROTEGIDO construída (6 tasks) — NÃO
  PUSHADA:** brainstorm sobre reembolso de má-fé → pesquisa jurídica → decisão de
  **resolver por produto, não por cláusula**: se o conteúdo nunca sai da
  plataforma, a revogação vira real e a assimetria some. Docs em
  `docs/frentes/leitor-protegido/` (spec + `politica-reembolso.md` + plano).
  **Política travada:** dias 1–7 incondicionais (art. 49 CDC, irrenunciável;
  Hotmart/Kiwify/Eduzz todas incondicionais), dias 8–30 garantia comercial
  condicionada a consumo comprovado; antiabuso por identidade, não por cláusula.
  **6 tasks via subagent-driven-development**, cada uma com revisão + fixes:
  `reader.ts` (corte em seções) · migration `0028` + registro · `canRead`
  (acesso revogável, fail-closed) · tela do leitor · registro de leitura ·
  aposentar download + ponte de resgate. **322 testes**, `tsc` 0, lint limpo.
  **As revisões pegaram furos graves, quase todos da própria spec:** revogação
  era por usuário e não por produto; o fix disso trancou quem comprou passe;
  `/api/leitura` gravava prova de consumo sem checar acesso (forjável); auditoria
  com `on delete cascade` apagava a própria prova; e uma **regressão visual real**
  (texto quase-branco sobre `GlassCard` branco no tema padrão). Achado lateral
  do usuário verificado e corrigido: cupom de upgrade continuava valendo após
  reembolso do Start. **20 commits LOCAIS — nada no ar.**
  **Bloqueadores de deploy:** (1) aplicar `0028` no remoto; (2) conferir
  `select status, product_id from purchases` — comprador legado fora de
  `paid`/produtos conhecidos fica trancado **com o download já removido**;
  (3) verificação visual (roteiros nos `.superpowers/sdd/task-*-report.md`).
  **3 decisões abertas do usuário** (C2 completude da prova de consumo, C3
  segundo caminho de entrega dos relatórios, I4 resgate não é uso único) —
  detalhadas no ledger `.superpowers/sdd/progress.md`.

- **2026-07-20 (Opus 4.8 1M) — Follow-up: reconciliação do mapa neural +
  revalidação dos planos C–G contra o código:** sessão de manutenção, sem código
  novo. **(1) Drift dos docs corrigido:** `ESTADO-ATUAL` ainda dizia "210 testes,
  Frente 4 a construir, HEAD 1586c2e" e listava a BREVO como pendente — tudo
  reconciliado (268 testes, Frente 4 ✅, HEAD `b47f57c`, Brevo ✅). `ECOSSISTEMA`
  atualizado (migrations 0001→0026, programa de lançamento adicionado ao mapa).
  **Duas filas concorrentes eliminadas:** a Frente 5 do design-v2 foi
  explicitamente **absorvida pela Trilha D**, e o README do design-v2 virou
  histórico. Nova tabela do programa no `ESTADO-ATUAL`. **(2) Planos C–G
  revalidados** por 2 sweeps contra o código real — nenhum invalidado, mas 6
  correções aplicadas: caminhos errados em **C3** (subpáginas vivem sob
  `dashboard/[token]/`) e **F1/F3**; **F5** (`Header`/`Footer` ainda usados por
  `/oferta` → repontar, não remover); **F4** (ressalva do `text-white` em botão
  violeta); **F8** parcialmente feito na Trilha B; **G4** (webhook é 14º site,
  fora da migração de propósito). **(3) Achado que exige decisão do usuário:** a
  garantia publicada (**7 dias incondicionais** nos termos) diverge do código
  (**janela de 30 dias**) e da política (**30 dias com smart gates**) — apertar
  tudo pra "7 condicionais" é retroativo pra quem já comprou; duas saídas
  detalhadas no fim da Task F6. **F6 de termos/copy fica bloqueada até a escolha;
  o resto da F6 pode seguir.** **Próximo:** Trilha C (dark-aware).

- **2026-07-16 (Opus 4.8 1M) — Programa de LANÇAMENTO FINAL: planejado inteiro +
  Trilha B concluída:** brainstorm "listar tudo p/ o lançamento" → escopo travado
  (tudo que o Claude controla, pronto+polido; mídia via NotebookLM→hand-off) →
  **planejado tudo primeiro** (decisão do usuário): 6 specs + 6 planos das trilhas
  B–G em `docs/frentes/lancamento-final/`, fundamentados em mapas do código real.
  **Trilha A:** Brevo ✅ resolvido e verificado (delivered em prod); Stripe live
  segue com o usuário. **Trilha B (segurança do dinheiro) COMPLETA e no ar** via
  subagent-driven-development (6 tasks, revisão por task + final opus): reembolso/
  disputa revoga acesso (expira token+entitlement na fonte; 500 p/ Stripe
  reentregar), XP não-duplicável (0025 + upsert 8 sites), rate limiter
  (checkout/newsletter/waitlist), validação de e-mail + dedupe waitlist (0026),
  testes de `entitlement-access` e `auth-session` (incl. claim atômico concorrente
  anti-replay). **Migrations 0025/0026 aplicadas no remoto** (SQL Editor, dedup
  por ctid replay-safe, índices verificados) ANTES do push (senão o upsert
  quebraria). 268 testes. Commits `a25f2ac`..`332f27a`. **Garantia travada: 7 dias
  condicional** (F6 alinha código+doc+termos+copy). **Próximo:** Trilha C
  (dark-aware). Ledger em `.superpowers/sdd/progress.md`.
- **2026-07-16 (Opus 4.8 1M) — Design v2 Frente 4 (Conteúdo/mídia) concluída +
  design pass do feed:** via `subagent-driven-development` (6 tasks + revisão por
  task + revisão final opus whole-branch = **Ready to merge**, 229 testes).
  Entregue: `media.ts` (parsing YouTube/Spotify, DRY com VideoThumb, +shorts),
  `markdown.ts`+Markdown v2 (corrige `####`/tabelas dos relatórios), `VideoPlayer`+
  `MusicPlayerCard` sobre embed, `ArticleToc` (ilha dinâmica em relatórios+blog),
  `JornadaToc` (sumário da jornada no dashboard), `ShareLinks` (WhatsApp/X/
  LinkedIn/copiar; **invariante: nunca compartilhar URL com token** — verificado
  ponta a ponta). Sem migration, sem dep nova. Commits `bfa2b64`..`2c44b90`.
  **No meio, a pedido do usuário, um design pass do feed** (commit `25d5566`):
  identidade por tipo (`content-accent.ts`: cor/ícone/pôster/hover), metadados
  duração·XP, RailCard/ExpandableContentCard redesenhados, esteira com rolagem
  direta calma (60px/notch), dialog trocou morph layoutId frágil por scale+fade.
  Fix de raiz: `tailwind.config content` não incluía `./src/lib` (pôsteres saíam
  pretos). **Achado pré-existente (nova frente):** marketing/blog não é
  dark-aware (texto claro hardcoded sob dark default). Ledger em
  `.superpowers/sdd/progress.md`.
- **2026-07-16 (Fable 5) — Auditoria de fidelidade dos 17 modelos + 4 bugs
  reais corrigidos:** a partir do report do usuário (rail "Comece por aqui" não
  deslizava com shift+wheel), diagnóstico ao vivo + 2 subagentes auditando os
  10 itens construídos contra os modelos 21st.dev. **Corrigido e pushado**
  (`7ea7c55`, `05c10bd`): (1) rail: `snap-mandatory` revertia `scrollLeft +=
  deltaY` (tick < meio card) — agora desliza 1 card/gesto com `scrollBy` smooth
  + guards com tolerância; (2) **ExpandableContentCard: véu `z-[95]` ficava
  montado pra sempre** (fragment como filho do AnimatePresence) e a página
  inteira ficava morta pra cliques após abrir/fechar um card — reestruturado p/
  motion child único keyed, validado ao vivo; (3) FeedTimeline: página nova
  concatenada sem re-ordenar quebrava a recência — `mergeFeedPage()` puro +
  testes (212 total); (4) âncora `#conteudos` cortada sob o header sticky —
  `scroll-mt-24`. Plano-4 já cobre YouTube Shorts no regex (gap dormente do
  VideoThumb). **Backlog rastreado da auditoria (não bloqueia):** focus-trap
  real no ExpandableContentCard (Tab abre 2 overlays); cursor de paginação sem
  tiebreak `(created_at,id)`; erro de rede no loadMore vira "fim do feed"
  silencioso; banda 768–1023px mostra busca+hambúrguer juntos; hydration risk
  de `relativeTime(new Date())` em SSR; indicador ativo da sidebar é estático
  (trade-off documentado, layoutId colidia nos 2 mounts).
- **2026-07-16 (Opus 4.8 1M) — 0024 aplicada + Frente 4 desenhada + auditoria:**
  (1) **Migration `0024_feed_posts` APLICADA pelo Claude** via navegador
  (dashboard Supabase → SQL Editor; digitação no Monaco não foca → injeção via
  `monaco.editor.getModels().setValue()` + Run; verificada `relrowsecurity=true`).
  **Política nova (raiz):** migrations são responsabilidade do Claude, não
  hand-off do usuário (documentado no `CLAUDE.md` + memória local). (2) **Design
  v2 Frente 4 (Conteúdo/mídia) DESENHADA:** `spec-4-conteudo.md` +
  `plano-4-conteudo.md` (6 tasks: media.ts → markdown.ts → players → ArticleToc
  → JornadaToc → ShareLinks; invariante: nunca compartilhar URL tokenizada).
  (3) **Auditoria dupla** (continuidade + arquitetura, 3 subagentes): cadeia de
  retomada sólida (0 links quebrados, 210 testes conferem), mas docs congelavam
  no fechamento — curados ESTADO/ECOSSISTEMA/COMO-CONTINUAR/READMEs (0024,
  Frente 3, tabela mestre, banners de encerramento). Arquitetura: achados
  Critical = `auth-session.ts` e `entitlement-access.ts` sem teste; top recs =
  testes nesses 2 + `resolveTokenRow()` DRY + preparos p/ Frentes 4-5 (media
  union type — já incorporado no plano-4). Pendências novas registradas:
  BREVO_API_KEY inválida no Vercel; revisão RightSidebar a chegar do usuário.
- **2026-07-15 (Opus 4.8 1M) — Design v2 Frente 3 (Comunidade) implementada:**
  retomada "continue de onde paramos". Via `subagent-driven-development` (3 tasks,
  cada uma implementer sonnet + task-reviewer sonnet; revisão final whole-branch
  opus). Task 1: `leaderboard.ts` puro (TDD: `monthStartIso`/`aggregateMonthlyXp`/
  `rankLeaderboard`) + `leaderboard-data.ts` (`getMonthlyLeaderboard`, agrega
  `xp_events` do mês, **só opt-in** `display_name!=null`). Task 2: `RankingList`
  animado (staggered framer-motion; pódio `--mc-gold` com fallback fora do
  `.mcv2`). Task 3: `SwipeableActivityList` (drag-to-dismiss + botão "Dispensar"
  a11y) + montagem `RightSidebar` (gate Advanced intacto + ranking só logados) +
  `feed/page.tsx`. Revisão final: 1 Important corrigido (ranking escondido p/
  anônimo, `76c15ea`), 7 Minors deferidos. `tsc` 0 / 210 testes / lint limpo.
  Commits `c27d78f..76c15ea` (**push pendente**). Migration `0024` (Frente 2)
  segue pendência do usuário — Frente 3 não depende dela. Ledger em
  `.superpowers/sdd/progress.md`.
- **2026-07-13 (Opus) — Frente 6 (Suporte/CRM) implementada — ÚLTIMA FRENTE:**
  via `subagent-driven-development` (5 tasks) — migration `0021`
  (`support_messages`) + tipos, `suporte.ts`/`validateContactInput` puro
  testado (TDD), `sendSupportNotification` (Brevo, com escape de HTML no
  input do usuário — fix pós-review) + `createSupportMessage`, rota
  `POST /api/suporte` + página `/suporte` (FAQ + `ContatoForm`), link no
  header (`LandingHeader`) e footer (`footer-nav.ts`, coluna "Suporte"), e o
  doc de estratégia `docs/frentes/suporte-crm/crm.md` (onboarding
  compra→token→triagem→primeiro valor, retenção via ciclo de e-mails +
  feed/fórum, reativação/win-back de passe expirado com e-mails de 7d/1d,
  suporte com SLA simples e escalada ao contato humano, métricas por etapa
  do funil pós-venda). `tsc` 0. **Com esta frente, as 6 frentes do roadmap
  estão entregues (código + revisão).** Pendente: aplicar migration `0021`
  no remoto (SQL Editor).
- **2026-07-13 (Opus) — Frente 5 (Blog + Marketing) implementada:** via
  subagent-driven-development (4 tasks) — manifesto `src/data/blog.ts` + 2
  posts-semente markdown, `src/lib/blog.ts` puro testado, `/blog` +
  `/blog/[slug]` (SEO + CTA `/oferta`), link no header e footer, e o doc de
  estratégia `docs/frentes/blog-marketing/marketing.md` (funil, calendário
  editorial, sazonalidade, SEO/e-mail/prova social). Sem login/entitlement,
  sem migration. `tsc` 0. Frente 5 marcada ✅.
- **2026-07-13 (Opus) — Frente 2 Plano 2 (e-mails) implementado:** via
  subagent-driven-development — 6 tasks (sent_emails, computeDueEmails puro,
  4 e-mails Brevo, cron Vercel, confirmação no webhook, endpoint novos-conteúdos)
  + 1 fix de review (cron CRON_SECRET guard) + revisão final (opus) com fix
  Important (novo_ciclo edge→level-triggered) + M1/M4. `tsc` 0 / 145 testes.
  0019 rodada no SQL Editor (confirmação visual falhou por glitch do browser —
  reconfirmar). Pendente: deploy p/ cron + E2E Stripe. Ledger em `.superpowers/sdd/`.
- **2026-07-13 (Opus) — Frente 2 Plano 1 implementado:** executado via
  subagent-driven-development — 11 tasks (migrations 0017/0018 + entitlements,
  consumption, coupon puros; entitlement-access; Stripe produtos/checkout/cupom;
  webhook entitlement; enforcement ContentGate; /oferta real) + 2 fixes de review
  de task + revisão final (opus) com 2 fixes Important (ContentGate cycle-used;
  benchmark startIncluded). `tsc` 0 / 136 testes. Migrations aplicadas no remoto.
  Invariantes de dinheiro confirmados. **Pendente:** E2E Stripe modo teste (Stripe
  CLI) + Plano 2 (e-mails). Ledger em `.superpowers/sdd/progress.md`.
- **2026-07-13 (Opus) — Brevo resolvido + brainstorm Frente 2:** diagnosticado
  (via API do Brevo) que o remetente `contato@matrizcentral.com.br` não estava
  validado → autenticado o domínio `matrizcentral.com.br` no Brevo (DNS no
  registro.br: DKIM b1/b2, brevo-code, DMARC). Envio de teste `delivered`.
  E-mail transacional agora funciona (login/compra/ciclos). Iniciado o
  brainstorm da **Frente 2 (Assinaturas)**: modelo canônico travado — passes
  (não recorrente) Start(R$47 view-only)/Regular(R$97, 1 conteúdo/mês,
  acumula)/Advanced(R$497 ou 12x47, tudo); entitlement + ContentGate + Stripe
  (modo teste) + e-mails de ciclo (Vercel Cron). Spec a escrever.

- **2026-07-12 (Opus) — Frente 1 aceitação ao vivo:** migrations 0015/0016
  aplicadas no Supabase de produção pelo SQL Editor (o `supabase db push` falhou
  por histórico de migrations divergente — versões timestamp no remoto vs
  numeração 000N local; **pendência de reconciliação**). Login testado ponta a
  ponta no navegador com conta real (simulada via SQL): todos os caminhos
  passaram. Descoberto que o Brevo aceita o envio mas o e-mail não chega
  (deliverability — domínio/spam; afeta o e-mail de token da compra também).
  Frente 1 marcada ✅.

- **2026-07-11 (Opus) — Frente 1 implementada:** executada via
  `subagent-driven-development` — 11 tasks (migration+tipos, auth-tokens,
  safe-redirect, e-mail, auth-session, rotas request-link/verificar/logout,
  telas /entrar e /conta, header, ContentGate), cada uma com implementer +
  reviewer subagente. Fix de normalização de e-mail (webhook/resend) e revisão
  final ampla (opus) com hardening (backfill 0016, try/catch nas rotas, flags de
  cookie). `tsc` 0, 118 testes. Ledger em `.superpowers/sdd/progress.md`.
  **Na master e pushado** (`59e7ea8`). Decisão travada: landing fica dinâmica
  (sem mudança). **Pendente:** aplicar migrations no remoto + E2E ao vivo do
  magic link com e-mail real.
- **2026-07-11 (Opus) — Frente 1 brainstorm:** rodado `brainstorming` da Frente 1
  (Login real). Decisões travadas na sessão: **magic link próprio** (zero deps,
  reabrindo a decisão "Supabase Auth" após trade-off explicado ao usuário em
  linguagem simples); token+login convivem; login alcança tudo via `/conta`;
  tranca de preview com 2 caminhos; sessão revogável no banco; e-mail sem conta
  avisa + Adquirir. Spec escrito e aprovado (`spec.md`). **Próximo:** `writing-plans`.
- **2026-07-11 (Opus):** setup do 2º computador (git/node/supabase CLI, `.env.local`
  via CLI + Chrome), teste de compra ponta-a-ponta, fix do webhook (`www` +
  grant service_role). Auditoria completa (5 subagentes) + hardening dos 4
  críticos (verificado, na master). Montado este sistema de continuidade.
  Frente 1 (Login) engatilhada. **Próximo:** brainstorm do Login.
