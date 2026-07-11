# 📍 ESTADO ATUAL — Matriz Central

> **Este é o pino "você está aqui".** Se o usuário disser **"continue de onde
> paramos"** (ou der `/clear` e voltar), **leia este arquivo primeiro** — ele
> diz exatamente onde o projeto está, o que acabou de ser feito e qual é a
> próxima ação. Atualize-o ao fim de cada bloco de trabalho.
>
> Ordem de leitura ao retomar: **este arquivo → `CLAUDE.md` → o `README.md` da
> frente ativa → o código fonte-de-verdade.**

_Última atualização: 2026-07-11 (Frente 1 — código completo e revisado, pendente aceitação ao vivo)_

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
- **➡️ PRÓXIMA AÇÃO — ACEITAÇÃO AO VIVO (precisa do usuário):**
  1. Aplicar migrations no Supabase remoto: `npx supabase db push` (0011+0015+0016).
  2. E2E do magic link com e-mail real (Brevo): `/entrar` → link → `/conta` → logout.
  3. Decidir **#7** (landing virou dinâmica por causa do `SessionNav`; manter ou
     pílula client-side).
  Detalhes e checklist em [`docs/frentes/login-real/README.md`](frentes/login-real/README.md).
  Depois disso: marcar Frente 1 ✅ e iniciar a **Frente 2 (Assinaturas)**.

## 🌿 Estado do git

- **Branch ativa:** `master`. **Commits da Frente 1 estão locais, ainda NÃO
  enviados** (`git push origin master` pendente — o outro computador só recebe
  depois do push). Último commit: `aa65e63`.
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
| 1 | **Login real** (fundação de identidade) | 🔄 **código completo+revisado** (pendente aceitação ao vivo: migrations + E2E) | [login-real](frentes/login-real/README.md) |
| 2 | Assinaturas (Regular/Advanced) + e-mails de ciclo/CRM | 🔜 planejada (depende de #1) | criar ao iniciar |
| 3 | Feed central (rede social de IA) | 🔜 planejada (depende de #1) | criar ao iniciar |
| 4 | Fórum (portal de tópicos) | 🔜 planejada (depende de #1) | criar ao iniciar |
| 5 | Blog + Marketing (calendário/sazonalidade/funil) | 🔜 planejada | criar ao iniciar |
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

- **Crítico #4 (copy):** o alinhamento da `/oferta` é de posicionamento/marca —
  o usuário deve revisar o texto do card Start/Advanced e ajustar as palavras.
- **Backlog da auditoria (altos/médios):** revogação de acesso em reembolso,
  forja de XP, rate limiting, links mortos etc. — mapeados em
  [hardening-criticos](frentes/hardening-criticos/README.md), a serem resolvidos
  dentro das frentes seguintes.

## 📓 Log de sessões (append-only, mais recente no topo)

- **2026-07-11 (Opus) — Frente 1 implementada:** executada via
  `subagent-driven-development` — 11 tasks (migration+tipos, auth-tokens,
  safe-redirect, e-mail, auth-session, rotas request-link/verificar/logout,
  telas /entrar e /conta, header, ContentGate), cada uma com implementer +
  reviewer subagente. Fix de normalização de e-mail (webhook/resend) e revisão
  final ampla (opus) com hardening (backfill 0016, try/catch nas rotas, flags de
  cookie). `tsc` 0, 118 testes. Ledger em `.superpowers/sdd/progress.md`.
  **Pendente:** aplicar migrations no remoto + E2E ao vivo do magic link +
  decisão da landing dinâmica. **Não commitado/pushado ainda? Commitado sim;
  push pendente.**
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
