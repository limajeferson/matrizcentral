# Frente 1 — Login real (fundação de identidade)

**Status:** ✅ **Concluída** — implementada (11 tasks + hardening), revisada, na
master (`tsc` 0 / 118 testes), migrations 0015/0016 **aplicadas em produção**, e
**validada ao vivo** no navegador (no-account, envio, verify→`/conta`, painel,
uso único, logout, proteção de rota — tudo passou). Spec e plano:
[`spec.md`](spec.md) · [`plano.md`](plano.md).

> ✅ **Deliverability do Brevo — RESOLVIDO (2026-07-13):** o remetente
> `contato@matrizcentral.com.br` não estava validado no Brevo (o envio dava
> `error: sender not valid`). Corrigido autenticando o **domínio** no Brevo
> (DKIM/brevo-code/DMARC no registro.br). Teste de envio agora `delivered`. O
> magic link do login passa a chegar de verdade. Sem mudança de código.

## ✅ O que foi entregue

- Migrations `0015` (tabelas `magic_links`, `sessions`) e `0016` (backfill de
  e-mail) — **ainda não aplicadas no remoto**.
- Lógica pura testada: `auth-tokens.ts` (segredo/hash/expiração), `safe-redirect.ts`
  (anti open-redirect).
- Camada de dados `auth-session.ts`: emissão/verificação de magic link (uso único
  atômico, 15 min), sessão (cookie `mc_session` httpOnly, 30 dias, revogável), o
  porteiro `getSessionUser()`.
- Rotas: `POST /api/auth/request-link`, `GET /entrar/verificar` (callback + cookie),
  `POST /api/auth/logout`. Telas `/entrar` e `/conta`. Botão Entrar/Minha conta no
  header. Componente `ContentGate` (tranca, ainda não plugado).
- Fix de consistência de e-mail no write path (webhook) + resend.

## ⏳ Pendências antes de fechar

1. **Aplicar migrations no Supabase remoto:** `npx supabase db push` (aplica
   0011+0015+0016) — precisa da auth local do Supabase CLI.
2. **E2E ao vivo:** pedir link em `/entrar` com e-mail real → clicar no e-mail
   (Brevo) → cair logado em `/conta` → "ir para meu painel" → logout. Reusar link
   (uso único) e e-mail inexistente (aviso + Adquirir).
3. **Decisão pendente (#7):** a landing `/` virou dinâmica (SSR por request) porque
   o `SessionNav` lê cookies. Manter assim, ou mover a pílula de sessão pra
   client-side e preservar a landing estática?
4. **Minors rastreados (não bloqueiam):** rate-limit check-then-act; 2 testes de
   borda (`isExpired`, throttle). Ver ledger `.superpowers/sdd/progress.md`.
5. **Deep-return do `next`** do ContentGate: deferido para a frente de deploy do
   gate (ver "Fora de escopo" no spec).

**Por que primeiro:** é pré-requisito de tudo que gera receita e comunidade —
assinaturas, feed, fórum, perfil e CRM precisam saber "quem é esse usuário" ao
longo do tempo. Hoje o acesso é só por token temporário, sem identidade
persistente.

## ✅ Decisões já travadas (não reabrir sem motivo)

- **Conviver, não substituir.** O token continua dando acesso imediato
  pós-compra (atrito zero no R$47, bom para conversão por impulso). O **login
  real é adicionado** e passa a ser exigido para assinatura, feed, fórum e
  perfil. O token vira o "boas-vindas"; o login vira a "sua conta".
- **Método de login: magic link** (Supabase Auth, passwordless), usando o
  **e-mail que já existe** na tabela `users` (gravado no webhook da compra). Sem
  senha para gerenciar, custo zero (Supabase Auth free tier).
- **NFT descartado** como mecanismo de acesso: NFT comum é transferível por
  design (o oposto do objetivo), quebra o custo-zero (gas + carteira) e adiciona
  atrito cripto ao público. O login já entrega o "amarrado à identidade, difícil
  de transferir" que o usuário queria.

## ✅ Perguntas em aberto — RESOLVIDAS no brainstorm (ver [`spec.md`](spec.md))

1. **O que o login protege:** alcança **tudo** — o aluno logado volta ao painel
   de hoje (via `/conta`, que resolve o token nos bastidores) e às áreas novas. O
   token **coexiste para sempre** como atalho pós-compra.
2. **Migração da identidade:** trivial — a identidade fica **só na `users`** já
   existente, achada por e-mail. **Sem `auth.users` para reconciliar.**
3. **Modelo de sessão:** cookie próprio assinado (`mc_session`, `httpOnly`),
   resolvido server-side pelo porteiro `getSessionUser()` — mesmo padrão do token.
   Sem middleware; server actions + route handler no callback.
4. **UX de entrada:** botão "Entrar"/"Minha conta" no header, rota `/entrar`
   (e-mail → magic link), `/entrar/verificar` (callback), `/conta` (lar do aluno).
5. **RLS e segurança:** **decidido reabrir a decisão "Supabase Auth"** → magic
   link **próprio** (zero deps, `crypto` nativo). Seguimos com `service_role` +
   gating no código (sem `auth.uid()`). Segurança coberta pelo checklist do spec
   (hash, uso único, timing-safe, cookie protegido, sessão revogável).

## Restrições que já valem

- **Custo zero:** Supabase Auth é gratuito no tier atual. Nada de dependência
  paga nova.
- **Não quebrar o fluxo atual** (compra → token → dashboard → gamificação →
  certificado), que já funciona e foi endurecido no hardening.

## ➡️ Próximo passo

Brainstorm ✅ e spec ✅ ([`spec.md`](spec.md), aprovado pelo usuário). Agora rodar
**`superpowers:writing-plans`** para o plano de implementação a partir do spec, e
depois **`superpowers:subagent-driven-development`** para executar com revisão a
cada task. Ao concluir cada bloco, atualizar
[`docs/ESTADO-ATUAL.md`](../../ESTADO-ATUAL.md) e este README.

## Prompt de retomada (colar numa sessão nova)

```
Continue de onde paramos. Leia docs/ESTADO-ATUAL.md e
docs/frentes/login-real/README.md. Vamos iniciar a Frente 1 (Login real):
as decisões estão travadas (conviver token + magic link do Supabase Auth,
sem NFT); falta resolver as perguntas em aberto do README. Use
superpowers:brainstorming para fechar o design, depois writing-plans, depois
subagent-driven-development. Tenho autonomia autorizada — foque na entrega
objetiva.
```
