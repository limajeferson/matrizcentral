# Frente 1 — Login real (fundação de identidade)

**Status:** 🔄 Próxima (engatilhada — decisões travadas, aguardando brainstorm numa sessão dedicada)

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

## ❓ Perguntas em aberto (resolver no brainstorm)

1. **O que exatamente o login "protege"** (gating): só as áreas novas (assinatura,
   feed, fórum, perfil), ou também o dashboard atual? O token some com o tempo ou
   coexiste para sempre?
2. **Migração da identidade:** quando um comprador-por-token faz login pela
   primeira vez com o mesmo e-mail, como ligamos a conta ao histórico dele
   (compras, XP, certificado) sem duplicar `users`?
3. **Modelo de sessão:** cookie de sessão do Supabase Auth (SSR) — como conviver
   com as rotas atuais que resolvem tudo por `token`? Middleware? Server actions?
4. **UX de entrada:** onde vive a tela de login? Header? Uma rota `/entrar`? O
   dashboard por token ganha um "criar minha conta para voltar depois"?
5. **RLS e segurança:** hoje o acesso é server-side com `service_role` (ignora
   RLS). Com identidade real, vale introduzir policies por `auth.uid()` para as
   áreas novas? (o backlog da auditoria — forja de XP, revogação em reembolso —
   se resolve melhor com identidade real).

## Restrições que já valem

- **Custo zero:** Supabase Auth é gratuito no tier atual. Nada de dependência
  paga nova.
- **Não quebrar o fluxo atual** (compra → token → dashboard → gamificação →
  certificado), que já funciona e foi endurecido no hardening.

## ➡️ Próximo passo

Rodar **`superpowers:brainstorming`** a partir deste README (responder às
perguntas em aberto, uma de cada vez), depois **`superpowers:writing-plans`**
para o plano de implementação, e **`superpowers:subagent-driven-development`**
para executar com revisão a cada task. Ao concluir, atualizar
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
