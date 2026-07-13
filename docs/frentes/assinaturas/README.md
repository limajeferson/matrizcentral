# Frente 2 — Assinaturas (passes Regular/Advanced) + e-mails de ciclo

**Status:** 🔄 **Plano 1 — código completo e revisado** (11 tasks + 2 fixes da
revisão final, na master, `tsc` 0 / **136 testes**). Falta só o **E2E ao vivo em
modo teste do Stripe** (precisa do Stripe CLI encaminhando o webhook). Plano 2
(e-mails/CRM) a escrever depois.

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

## ➡️ Próximo passo

Executar [`plano-1.md`](plano-1.md) com `superpowers:subagent-driven-development`
(12 tasks; Stripe em modo teste). Depois escrever/executar o Plano 2 (e-mails de
ciclo). Fontes antigas divergentes (`copywriter-brief`, `VERSAO-COMPLETA`,
`plan_waitlist`) estão **superadas** pelo spec — alinhar/anotar ao implementar.
