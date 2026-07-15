# Frente — Casa Unificada (SP1)

**Status:** ✅ concluída, revisada (opus) e deployada.

Plataforma-é-a-casa: o `/feed` é o destino pós-compra; **diagnóstico por sessão**
(bloco de boas-vindas incentivado, grava `profile_id` na conta), **auto-login
pós-compra** por `session_id` (janela de 30min + uso único via `checkout_logins`),
e correção do bug de loop pós-compra (`/api/quiz` que dava 200 em falha).

- **Migrations:** `0022_user_profile` (users.profile_id/diagnosed_at),
  `0023_checkout_logins` — aplicadas no remoto via SQL Editor.
- **Detalhe:** [`spec.md`](spec.md) · [`plano.md`](plano.md).
- **Próximo passo:** nenhum (frente fechada). Evolução do feed segue no programa
  [`design-v2`](../design-v2/README.md).
