# Frente 1 — Login real (fundação de identidade)

**Status:** 🔄 Em andamento — **brainstorm concluído, spec aprovado** ([`spec.md`](spec.md)). Próximo: escrever o plano de implementação (`writing-plans`).

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
