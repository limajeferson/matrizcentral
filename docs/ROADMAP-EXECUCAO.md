# 🗺️ Roadmap de execução — pendências + próximas frentes

> Organização das pendências da Frente 2 e das próximas frentes, em escopos
> separados, para execução **sequencial** via `brainstorming → writing-plans →
> subagent-driven-development`. Marca o que é **autônomo** (eu executo) vs
> **bloqueado por ambiente** (precisa do Stripe CLI / deploy Vercel / DNS —
> eu preparo e faço o hand-off).
>
> Fonte de verdade do andamento: [`ESTADO-ATUAL.md`](ESTADO-ATUAL.md).

## Ordem de execução

### 🔒 Bloco A — Fechamento da Frente 2 (Assinaturas)

| # | Item | Tipo | Ação |
|---|---|---|---|
| A1 | ✅ Issue 3 — cupom amarrado à sessão (commit 5cf89e3) | 🟢 feito | concluído |
| A2 | Reconfirmar migration `0019_sent_emails` no Supabase | 🟡 ambiente (browser) | reexecutar/confirmar |
| A3 | **E2E Stripe (modo teste)**: compra → webhook → entitlement → tranca | 🔴 bloqueado (Stripe CLI) | preparar guia + hand-off |
| A4 | Deploy + `CRON_SECRET` na Vercel → cron de e-mails disparando | 🔴 bloqueado (deploy) | preparar guia + hand-off |

### ✅ Frente 3 — Feed (rede social de aprendizado de IA) — CÓDIGO COMPLETO
Depende de: login (✅) + entitlement (✅, leitura = Advanced; prévia p/ todos).
Escopo: página de feed com posts (manchete + capa + "ler mais"), enforcement
via `ContentGate` (regra "prévia sempre, consumo travado"), fonte de conteúdo,
gamificação de leitura. **Autônomo** (design + código). brainstorm→spec→plano→SDD.

### ✅ Frente 4 — Fórum (portal de tópicos) — CÓDIGO COMPLETO
Depende de: login (✅). Escopo: tópicos, respostas, moderação básica, XP por
participação. **Autônomo**. brainstorm→spec→plano→SDD.

### 🟢 Frente 5 — Blog + Marketing (calendário/sazonalidade/funil)
Escopo: blog (SEO/conteúdo), captura de funil, calendário de marketing.
**Autônomo**. brainstorm→spec→plano→SDD.

### 🟢 Frente 6 — Suporte/autoatendimento + CRM/pós-venda
Depende de: login (✅) + assinaturas (✅). Escopo: canal de autoatendimento,
jornada de CRM, pós-venda. **Autônomo**. brainstorm→spec→plano→SDD.

## Método por frente (travado no projeto)
`superpowers:brainstorming` (com autonomia — decisões recomendadas documentadas
no spec, sem pausar para aprovação, conforme autorizado) → `superpowers:writing-plans`
→ `superpowers:subagent-driven-development` (implementador + revisor por task +
revisão final ampla). Gate: `tsc` 0 + testes + (quando aplicável) navegador.

## Hand-off dos itens bloqueados por ambiente
- **A3 (Stripe CLI):** `stripe login` → `stripe listen --forward-to
  localhost:3000/api/webhooks/stripe` → comprar Regular/Advanced com cartão de
  teste `4242 4242 4242 4242`. Guia detalhado será entregue ao chegar em A3.
- **A4 (Vercel):** setar `CRON_SECRET` nas env vars da Vercel; o cron
  (`vercel.json`) chama `/api/cron/emails-diarios` diariamente. Deploy dispara.

---

_Atualizar este arquivo e o `ESTADO-ATUAL.md` ao concluir cada bloco/frente._
