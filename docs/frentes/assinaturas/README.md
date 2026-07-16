# Frente 2 — Assinaturas (passes Regular/Advanced) + e-mails de ciclo

**Status:** ✅ **Concluída** — Planos 1 (entitlement/Stripe/webhook/oferta) e 2
(e-mails de ciclo + cron) entregues e revisados; **E2E Stripe modo teste validado
em produção (2026-07-13)**; migrations 0017–0019 aplicadas; cron vivo; Issue 3
(cupom↔sessão) resolvido (`5cf89e3`).

> ⚠️ **Nota de encerramento (2026-07-16):** o corpo abaixo congela o estado da
> época do código; as pendências que ele cita foram **todas resolvidas** (ver
> `docs/ESTADO-ATUAL.md`, log de 2026-07-13). Pendência viva relacionada:
> `BREVO_API_KEY` inválida no Vercel + Stripe live bloqueado (verificação de
> empresa).

## ✅ Entregue (Plano 1)

Migrations 0017/0018 (aplicadas em produção); lógica pura testada (`resolveAccess`,
`cycleKeyFor`+`canConsume`, `couponEligible`); camada `entitlement-access`; produtos
Stripe + checkout por plano (cupom R$47/30d automático + parcelas Advanced); webhook
cria entitlement; **enforcement de consumo via `ContentGate`** (mostra a mensagem
certa para `cycle-used` do Regular); `/oferta` com checkout real dos 3 planos.
Benchmark (`relatorio-comparativo-modelos`) marcado `startIncluded` (Start consome).

Revisão final ampla (opus) **confirmou os invariantes de dinheiro**: não-pagante
consome nada; Regular nunca passa de 1/mês (mesmo sob corrida).

## ⏳ Pendências / gates

- **E2E ao vivo (modo teste Stripe):** comprar Regular/Advanced (cartão 4242) →
  webhook cria entitlement → consumo (Advanced ilimitado; Regular 1/mês + tranca no
  2º) → cupom no upgrade. Precisa do **Stripe CLI** (`stripe listen --forward-to
  localhost:3000/api/webhooks/stripe`).
- **Gate de GO-LIVE (Issue 3):** o cupom confia no e-mail do cliente (sem auth) —
  amarrar à sessão autenticada antes de ligar o Stripe live. Limitado a R$47.
- **Minors rastreados** (ver ledger `.superpowers/sdd/progress.md`): APIs de mutação
  não-gated (XP), `plan_waitlist` órfão, gaps de teste de borda, "em breve" UX.

**Por que agora:** a fundação de identidade (Frente 1, login) está viva e o
Brevo entrega — as duas dependências que destravam assinatura e e-mails de ciclo.

## Modelo canônico (travado no brainstorm)

Passes **não recorrentes** (preserva "sem mensalidade"), em escada:
- **Start** R$47 único (já ativo) — ebook + diagnóstico + roadmap + benchmark +
  certificado; plataforma **só visualização**; gamificação da trilha do ebook;
  **cupom R$47 (30 dias)** para upgrade.
- **Regular** R$97, passe 12 meses — tudo do Start + **1 conteúdo/mês** (acumula).
- **Advanced** R$497 (ou 12x R$47), passe 12 meses — **tudo liberado** + feed +
  gamificação plena.

## Os 4 blocos aprovados (ver `spec.md`)

1. **Entitlement** — tabela `entitlements` + `resolveAccess()` + webhook trata 3 produtos.
2. **Consumo & enforcement** — `content_unlocks` + `canConsume()` + a tranca
   (`ContentGate`, da Frente 1) passa a checar entitlement real.
3. **Stripe** (modo teste) — produtos Regular/Advanced + parcelado 12x + cupom automático.
4. **E-mails de ciclo/CRM** — confirmação, "novo ciclo" (Regular), "novos conteúdos"
   (Advanced), expiração; via Vercel Cron; dedup em `sent_emails`.

## Fases

1. Núcleo de receita (Blocos 1–3 + `/oferta`) — testável em modo teste do Stripe.
2. Camada de e-mails/CRM (Bloco 4) — cron valida em deploy.

## Decisões a confirmar na revisão

- Feed = Advanced? · ciclo = aniversário da compra? · janela de expiração = 7 dias?

## Plano 2 — ✅ código completo e revisado

`sent_emails` + `computeDueEmails` (puro, TDD, **level-triggered** pós-review) +
4 funções de e-mail + cron diário (Vercel Cron, guard de `CRON_SECRET` unset) +
confirmação de compra no webhook + endpoint `/api/admin/notify-new-content`
(Advanced). `tsc` 0 / **145 testes**. Revisão final (opus) confirmou dedup/auth/
recipiente corretos; 1 Important corrigido (novo_ciclo edge→level-triggered).

## ⏳ Pendências / coordenação de deploy

- **Migration `0019_sent_emails`:** rodada no SQL Editor, mas a **confirmação
  visual falhou (glitch do browser)** — reconfirmar (é idempotente, `create table
  if not exists`).
- **Validação de runtime dos e-mails:** o **cron só dispara em deploy** (Vercel).
  Configurar `CRON_SECRET` nas env da Vercel; o cron chega em `/api/cron/emails-diarios`.
  Localmente dá pra chamar a rota à mão com o header.
- **E2E ao vivo do Plano 1 (Stripe modo teste):** ainda pendente — precisa do Stripe
  CLI encaminhando o webhook.
- **Gate de go-live:** amarrar o cupom à sessão (Issue 3 do Plano 1).
- **Minors rastreados** (ledger): notify sem idempotência, cron fetch-all sem
  paginação, compare não timing-safe, copy "1 dia".

## ➡️ Próximo passo

Fechar as validações de runtime (0019 confirmado + deploy p/ cron + E2E Stripe),
depois seguir para a **Frente 3 (Feed)** — que já pode chamar o entitlement
(`resolveAccess`/`ContentGate`) construído aqui.
