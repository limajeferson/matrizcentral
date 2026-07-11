# 📍 ESTADO ATUAL — Matriz Central

> **Este é o pino "você está aqui".** Se o usuário disser **"continue de onde
> paramos"** (ou der `/clear` e voltar), **leia este arquivo primeiro** — ele
> diz exatamente onde o projeto está, o que acabou de ser feito e qual é a
> próxima ação. Atualize-o ao fim de cada bloco de trabalho.
>
> Ordem de leitura ao retomar: **este arquivo → `CLAUDE.md` → o `README.md` da
> frente ativa → o código fonte-de-verdade.**

_Última atualização: 2026-07-11_

---

## 🎯 Objetivo geral

Auditar e completar a plataforma Matriz Central **por frentes, receita primeiro**
— deixando cada botão, jornada e interface funcional e segura, e construindo o
que ainda não existe (login, assinaturas, comunidade, CRM, marketing).

Pedido original completo do usuário: [`prompt-pedido.md`](../prompt-pedido.md).

## 🧭 Onde paramos AGORA

- **Concluído nesta rodada:** auditoria completa (5 frentes) + **hardening dos 4
  críticos** (certificado forjável, cliente paga-e-não-recebe, certificado
  inalcançável, promessa da oferta desalinhada). Tudo verificado (`tsc` 0, 106
  testes, navegador) e **na master** (commit `0aee161`).
- **➡️ PRÓXIMA AÇÃO:** iniciar a **Frente 1 — Login real** (a fundação que
  destrava assinaturas, feed, fórum e CRM). Está **engatilhada** em
  [`docs/frentes/login-real/README.md`](frentes/login-real/README.md) — decisões
  já travadas + perguntas em aberto. Rode `superpowers:brainstorming` a partir
  desse README, depois `superpowers:writing-plans`, depois
  `superpowers:subagent-driven-development` para executar.

## 🌿 Estado do git

- **Branch ativa:** `master`, **sincronizada com `origin/master`** (push feito
  nesta rodada, até o commit `16b7195`). O outro computador recebe tudo com
  `git pull origin master`.
- **Inclui:** grant service_role, hardening dos 4 críticos, infra (gitignore +
  supabase CLI) e este sistema de continuidade.
- **Não versionado (local, de propósito):** `.env.local` (segredos),
  `SETUP.md`, `claude-chat.md`, `CLAUDE.local-draft.md`.

## 🗂️ Frentes (o mapa mestre)

Ordem escolhida pelo usuário: **receita primeiro**.

| # | Frente | Status | README |
|---|--------|--------|--------|
| 0 | Auditoria + Hardening dos 4 críticos | ✅ concluída | [hardening-criticos](frentes/hardening-criticos/README.md) |
| 1 | **Login real** (fundação de identidade) | 🔄 **próxima** (engatilhada) | [login-real](frentes/login-real/README.md) |
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

- **2026-07-11 (Opus):** setup do 2º computador (git/node/supabase CLI, `.env.local`
  via CLI + Chrome), teste de compra ponta-a-ponta, fix do webhook (`www` +
  grant service_role). Auditoria completa (5 subagentes) + hardening dos 4
  críticos (verificado, na master). Montado este sistema de continuidade.
  Frente 1 (Login) engatilhada. **Próximo:** brainstorm do Login.
