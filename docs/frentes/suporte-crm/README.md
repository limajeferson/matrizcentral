# Frente 6 — Suporte/autoatendimento + CRM/pós-venda

**Status:** ✅ **concluída** — spec + plano ([`spec.md`](spec.md) ·
[`plano.md`](plano.md)) executados via `subagent-driven-development` (5 tasks).

Entregue: **`/suporte`** (FAQ reusando `FAQ_ITEMS` + formulário de contato →
grava em `support_messages` + notifica o time por e-mail Brevo, migration
`0021`), link no header/footer, e o **doc de CRM/pós-venda**
([`crm.md`](crm.md) — onboarding, retenção, reativação, suporte, métricas
por etapa do funil). Decisões com autonomia, documentadas no spec.

## Status
`tsc` 0 / testes verdes (inclui `suporte`). Migration `0021` pendente de
aplicar no Supabase remoto (SQL Editor — hand-off de ambiente, mesma
pendência das migrations anteriores).

Esta é a **última frente** do roadmap — com ela, as 6 frentes do
[`ROADMAP-EXECUCAO.md`](../../ROADMAP-EXECUCAO.md) estão entregues
(código + revisão). Ver [`ESTADO-ATUAL.md`](../../ESTADO-ATUAL.md) para o
estado consolidado e pendências de ambiente.
