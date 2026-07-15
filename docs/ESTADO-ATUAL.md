# 📍 ESTADO ATUAL — Matriz Central

> **Este é o pino "você está aqui".** Se o usuário disser **"continue de onde
> paramos"** (ou der `/clear` e voltar), **leia este arquivo primeiro** — ele
> diz exatamente onde o projeto está, o que acabou de ser feito e qual é a
> próxima ação. Atualize-o ao fim de cada bloco de trabalho.
>
> Ordem de leitura ao retomar: **este arquivo → `CLAUDE.md` → o `README.md` da
> frente ativa → o código fonte-de-verdade.**

_Última atualização: 2026-07-15 (Design v2 — programa de 5 frentes: **Frentes 1
(Moldura) e 2 (Feed) concluídas/revisadas/deployadas**; Frente 3 desenhada;
migration `0024` pendente)_

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
- **Pendências de ambiente (hand-off):** aplicar migrations **0022** e **0023**
  no Supabase remoto (SQL Editor); repor `BREVO_API_KEY` válido no Vercel;
  verificação visual gated (`/feed` strip Advanced, `/forum` como assinante).
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
    3 minors corrigidos (commit `7bc003c`). **⚠️ HAND-OFF: migration
    `0024_feed_posts` PENDENTE no remoto** (MCP sem permissão; SPA Supabase não
    renderiza em aba bg). Aplicar via SQL Editor — SQL em `plano-2-feed.md`/spec.
    Até aplicar, o feed funciona; só *publicar post* falha.
  - **Frente 3 (Comunidade) — DESENHADA (spec+plano), a construir:** atividades
    swipeable-list + ranking mensal animated-list (backend leve de agregação de XP
    por mês; sem migration nova).
  - **Frentes 4 (conteúdo/mídia: players+artigo+jornada+share) e 5 (fórum:
    pergunta+respostas aninhadas) — a desenhar/construir.**
  - **Próxima ação:** aplicar migration `0024`; construir Frente 3 (Task 1:
    `leaderboard.ts`); seguir 4 e 5.

## 🌿 Estado do git

- **Branch ativa:** `master`, **sincronizada com `origin/master`** (push feito,
  HEAD `fa48af5`, deploy Vercel READY). O outro computador recebe tudo com
  `git pull origin master`.
- **Inclui (nesta rodada):** design v2 Frentes 1 (moldura: `AppHeader`/`AppFooter`
  + `LeftSidebar` client + `format-availability`) e 2 (feed: `feed_posts`/
  `feed-posts` + `feed-timeline` + `FeedTimeline`/`PostCard`/`VideoThumb`/
  `RailGallery`/`ExpandableContentCard` + `relative-time` + rotas `/api/feed/*` +
  migration `0024` a aplicar), docs `docs/frentes/design-v2/`. Antes: barra de
  histórias, feed-redesign baseline, SP1.
- **Não versionado (local, de propósito):** `.env.local` (segredos),
  `SETUP.md`, `claude-chat.md`, `CLAUDE.local-draft.md`.

## 🗂️ Frentes (o mapa mestre)

Ordem escolhida pelo usuário: **receita primeiro**.

| # | Frente | Status | README |
|---|--------|--------|--------|
| 0 | Auditoria + Hardening dos 4 críticos | ✅ concluída | [hardening-criticos](frentes/hardening-criticos/README.md) |
| 1 | **Login real** (fundação de identidade) | ✅ **concluída** (implementada, revisada, migrations aplicadas, E2E validado ao vivo) | [login-real](frentes/login-real/README.md) |
| 2 | Assinaturas (Regular/Advanced) + e-mails de ciclo/CRM | 🔄 código completo+revisado (Planos 1 e 2; falta E2E Stripe/deploy) | [assinaturas](frentes/assinaturas/README.md) |
| 3 | Feed central (rede social de IA) | 🔄 código completo+revisado (falta visual) | [feed](frentes/feed/README.md) |
| 4 | Fórum (portal de tópicos) | 🔄 código completo+revisado (falta 0020+visual) | [forum](frentes/forum/README.md) |
| 5 | Blog + Marketing (calendário/sazonalidade/funil) | ✅ **concluída** (blog público + doc de estratégia) | [blog-marketing](frentes/blog-marketing/README.md) |
| 6 | Suporte/autoatendimento + CRM/pós-venda | ✅ **concluída** (código+revisão; `/suporte` + doc `crm.md`) | [suporte-crm](frentes/suporte-crm/README.md) |

> As tasks do painel do Claude Code **não sobrevivem ao `/clear`** — esta tabela
> é a fonte de verdade das frentes. Ao retomar, recrie as tasks a partir daqui
> se quiser o acompanhamento visual.

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
