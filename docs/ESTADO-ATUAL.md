# 📍 ESTADO ATUAL — Matriz Central

> **Este é o pino "você está aqui".** Se o usuário disser **"continue de onde
> paramos"** (ou der `/clear` e voltar), **leia este arquivo primeiro** — ele
> diz exatamente onde o projeto está, o que acabou de ser feito e qual é a
> próxima ação. Atualize-o ao fim de cada bloco de trabalho.
>
> Ordem de leitura ao retomar: **este arquivo → `CLAUDE.md` → o `README.md` da
> frente ativa → o código fonte-de-verdade.**

_Última atualização: 2026-07-13 (Frente 5 — Blog + Marketing concluída)_

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
- **➡️ PRÓXIMA AÇÃO:** **Frente 6 — Suporte/CRM** (brainstorm→spec→plano→SDD,
  autonomia). Roadmap em [`docs/ROADMAP-EXECUCAO.md`](ROADMAP-EXECUCAO.md).
- **Coordenação de runtime acumulada (hand-off):** aplicar migrations
  `0019`/`0020` no remoto; deploy + `CRON_SECRET` (cron); E2E Stripe (CLI);
  verificação visual de `/feed` e `/forum`.
- **Pendências de ambiente (hand-off):** reconfirmar migration `0019`; deploy +
  `CRON_SECRET` na Vercel (cron de e-mails); E2E Stripe modo teste (Stripe CLI).

## 🌿 Estado do git

- **Branch ativa:** `master`, **sincronizada com `origin/master`** (push feito,
  até `59e7ea8`). O outro computador recebe tudo com `git pull origin master`.
- **Inclui (nesta rodada):** spec+plano do login, migrations 0015/0016, toda a
  implementação do login (auth-tokens, safe-redirect, auth-session, rotas, telas,
  header, ContentGate), fix de normalização de e-mail e hardening pós-review.
- **Não versionado (local, de propósito):** `.env.local` (segredos),
  `SETUP.md`, `claude-chat.md`, `CLAUDE.local-draft.md`.

## 🗂️ Frentes (o mapa mestre)

Ordem escolhida pelo usuário: **receita primeiro**.

| # | Frente | Status | README |
|---|--------|--------|--------|
| 0 | Auditoria + Hardening dos 4 críticos | ✅ concluída | [hardening-criticos](frentes/hardening-criticos/README.md) |
| 1 | **Login real** (fundação de identidade) | ✅ **concluída** (implementada, revisada, migrations aplicadas, E2E validado ao vivo) | [login-real](frentes/login-real/README.md) |
| 2 | Assinaturas (Regular/Advanced) + e-mails de ciclo/CRM | 🔄 código completo+revisado (Planos 1 e 2; falta E2E Stripe/deploy) | [assinaturas](frentes/assinaturas/README.md) |
| 3 | Feed central (rede social de IA) | 🔜 planejada (depende de #1) | criar ao iniciar |
| 4 | Fórum (portal de tópicos) | 🔜 planejada (depende de #1) | criar ao iniciar |
| 5 | Blog + Marketing (calendário/sazonalidade/funil) | ✅ **concluída** (blog público + doc de estratégia) | [blog-marketing](frentes/blog-marketing/README.md) |
| 6 | Suporte/autoatendimento + CRM/pós-venda | 🔜 planejada | criar ao iniciar |

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
