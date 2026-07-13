# Assinaturas (passes Regular/Advanced) + e-mails de ciclo — Design

## Contexto

Hoje o comércio é **um produto único**: R$47 pagamento único (Stripe Checkout
`mode: "payment"`, `product_id: "ebook_llm_local"`) → webhook cria
`users`+`purchases`+`tokens` e envia o e-mail de acesso. A `/oferta` mostra três
cards — **Start** (R$47, ativo) e **Regular/Advanced** (em "lista de espera",
gravando em `plan_waitlist`). O `ContentGate` (a "tranca" de preview) foi
construído na Frente 1 mas **ainda não está plugado** em entitlement nenhum.

Esta frente transforma Regular/Advanced em **compra real** e liga o consumo de
conteúdo a um **entitlement por usuário**, além de montar os **e-mails de
ciclo/CRM**.

### Fontes divergentes reconciliadas (fonte de verdade)

O modelo de planos havia **derivado** em vários docs antigos
(`copywriter-brief.md` dizia "R$97/mês recorrente"; `VERSAO-COMPLETA.md` falava
"Community+Mentorias R$97/mês"; `plan_waitlist` usa `mensal_97`/`anual_497`).
Estes estão **superados**. A fonte de verdade é este spec, consolidado a partir
da `/oferta` atual + `prompt-pedido.md` + confirmações do usuário no brainstorm.
Ao implementar, alinhar/anotar os docs antigos (não propagar as versões velhas).

## Modelo canônico (travado no brainstorm)

**Passes com prazo — NÃO recorrente** (preserva o discurso "sem mensalidade"; o
que expira é o acesso, não uma cobrança automática). Ofertas em **escada** (cada
tier inclui os de baixo):

| Oferta | Preço | Cobrança | Destrava |
|---|---|---|---|
| **Start** | R$47 | única (✅ já ativa) | ebook + triagem/diagnóstico + roadmap + relatório de benchmark + esteira do certificado. Plataforma **só VISUALIZAÇÃO** (vê tudo, não consome: sem play/download/abrir artigos/relatórios/apresentações, sem ler feed). Gamificação pontua **só a trilha do ebook**. + **1 cupom de R$47** (válido **30 dias**) para migrar. |
| **Regular** | R$97 | única — **passe 12 meses** | tudo do Start + consumir **1 conteúdo por mês** (escolhe entre todos). Desbloqueios **acumulam** (o que abriu fica pelos 12 meses). E-mail "novo ciclo" quando o slot mensal reabre. |
| **Advanced** | R$497 à vista *ou* 12x R$47 | única — **passe 12 meses** | tudo do Start + **consumo ilimitado** de toda a plataforma + **feed** + gamificação plena. E-mail "novos conteúdos". |

- **Expiração:** passe vale 12 meses; ao expirar, o acesso **volta para `view`**.
  Renovar = nova compra (não cobra sozinho).
- **Stripe live está bloqueado** (verificação da empresa) → tudo construído e
  testado em **modo teste**; go-live quando a verificação sair.

## Decisão técnica

### 1. Entitlement (quem-pode-consumir-o-quê)

**Migration `0017_entitlements.sql`** (aditiva):

```sql
create table if not exists entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  plan text not null check (plan in ('regular','advanced')),
  starts_at timestamptz not null default now(),
  expires_at timestamptz not null,               -- starts_at + 12 meses
  stripe_payment_id text unique,                 -- idempotência
  created_at timestamptz not null default now()
);
create index if not exists entitlements_user_id_idx on entitlements(user_id);
alter table entitlements enable row level security;  -- default-deny (padrão 0001)
```

**Lógica pura `src/lib/entitlements.ts`** (testável, node-env Vitest):
- `type AccessLevel = "view" | "regular" | "advanced"`.
- `resolveAccess(entitlements: EntitlementRow[], now?: Date): AccessLevel` — dentre
  os não-expirados (`expires_at > now`), devolve o mais alto (`advanced` > `regular`),
  ou `view` se nenhum. Testes: só expirados→view; regular vigente→regular; advanced
  vigente vence regular; nada→view; borda de expiração.

**Webhook (`api/webhooks/stripe/route.ts`) passa a tratar 3 produtos** via
`metadata.product_id` (`ebook_llm_local` | `regular_pass` | `advanced_pass`):
- Para **todos**: mantém a criação idempotente de `users`+`purchases`+`tokens`
  (Regular/Advanced **incluem o Start**, então quem compra direto também ganha
  ebook/triagem/roadmap/certificado — o fluxo atual roda igual).
- Para **regular/advanced**: adicionalmente cria a linha em `entitlements`
  (`plan` conforme o produto, `expires_at = now + 12 meses`), idempotente por
  `stripe_payment_id` (releitura antes de desistir, mesmo padrão do `purchases`).
- XP de "compra" (100) segue só na criação.

### 2. Consumo & enforcement (a tranca fica inteligente)

**Migration `0018_content_unlocks.sql`**:

```sql
create table if not exists content_unlocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  content_id text not null,
  cycle_key text not null,                       -- ex.: "2026-07" (aniversário mensal)
  unlocked_at timestamptz not null default now(),
  unique (user_id, content_id)
);
create index if not exists content_unlocks_user_idx on content_unlocks(user_id);
alter table content_unlocks enable row level security;
```

**Lógica pura `src/lib/consumption.ts`**:
- `cycleKeyFor(startsAt: Date, now: Date): string` — ciclo mensal por **aniversário
  da compra** (comprou dia 5 → vira dia 5). Retorna chave estável (ex.: número de
  meses desde `startsAt`, ou `YYYY-MM` ancorado no dia da compra). Testes: mesmo
  ciclo antes do aniversário; novo ciclo ao cruzar o dia.
- `canConsume(access, unlocks, contentId, startsAt, now): { allowed: boolean; reason: "advanced"|"already-unlocked"|"cycle-slot"|"cycle-used"|"gated"; willUnlock: boolean }`:
  - `advanced` (vigente) → `allowed`, reason `advanced`.
  - `regular` (vigente): se `contentId ∈ unlocks` → `allowed` (`already-unlocked`);
    senão, se **nenhum unlock no `cycleKeyFor` atual** → `allowed` + `willUnlock:true`
    (`cycle-slot`); senão → **não** (`cycle-used`).
  - `view` → não (`gated`).
  - Testes cobrindo cada ramo + a borda "já desbloqueado num ciclo anterior conta".

**Camada de dados `src/lib/entitlement-access.ts`** (I/O, server-side):
- `resolveUserIdFromContext({ token?, session? })` — o consumo pode ser alcançado
  por **token** (rotas `/dashboard/[token]/...`, token→purchase→user_id) **ou** por
  **sessão** (login, `getSessionUser`). Devolve o `user_id`.
- `getAccessFor(userId)` — busca `entitlements` do user → `resolveAccess`.
- `tryConsume(userId, contentId, startsAt)` — chama `canConsume`; se `willUnlock`,
  grava a linha em `content_unlocks` (com `cycleKeyFor`) de forma atômica
  (insert com `on conflict (user_id, content_id) do nothing` + recontagem do ciclo
  para evitar corrida de duplo-clique furar a cota); retorna a decisão final.

**Pontos de enforcement (onde a tranca entra):** as páginas/handlers que hoje
**entregam o conteúdo** passam a checar antes de renderizar o conteúdo real:
- `src/app/dashboard/[token]/conteudo/[id]/page.tsx` (artigo/relatório/vídeo/podcast):
  resolve user pelo token → `getAccessFor` → `tryConsume`; se não pode, renderiza
  **`<ContentGate>`** com a mensagem certa (`gated`→Adquirir/Entrar; `cycle-used`→
  "seu conteúdo do mês já foi usado, volta dia X ou vire Advanced"); se pode, entrega.
- **Feed** (rede social de IA — quando existir a página): leitura exige **Advanced**
  (decisão a confirmar, ver "Decisões a confirmar"). Start/Regular veem preview,
  consumo/leitura do feed → `ContentGate`.
- O **preview visual** (cards, thumbnails, descrição do `CONTENT_HUB`) segue aberto
  a todos — só o **consumo** é travado. É o que liga o `ContentGate` da Frente 1 a
  um entitlement real (a peça que faltava).

### 3. Stripe (Regular, Advanced, parcelado, cupom) — modo teste

- **`src/lib/stripe.ts`:** adicionar `PRODUTO_REGULAR` (`regular_pass`, 9700) e
  `PRODUTO_ADVANCED` (`advanced_pass`, 49700).
- **`src/app/api/checkout/route.ts`** passa a aceitar `plan: "ebook"|"regular"|"advanced"`
  (default `ebook`, compatível com o form atual) e montar a sessão com o
  `line_item` e o `metadata.product_id` corretos, `mode: "payment"`.
- **Parcelado 12x (Advanced):** `payment_method_options.card.installments.enabled: true`
  na sessão do Advanced. O "12x R$47" exato depende do emissor/config da conta real
  → **finalizar no go-live** (não bloqueia o build; em teste, validar que a opção
  aparece).
- **Cupom R$47 / 30 dias (Start→upgrade), automático:** um `coupon` fixo no Stripe
  (`amount_off: 4700`, `currency: brl`, `duration: once`) criado uma vez (id em env
  ou constante). No checkout de regular/advanced, `couponEligible(...)` (lógica pura,
  ver abaixo) decide se aplica via `discounts: [{ coupon }]`.
- **Lógica pura `couponEligible(ebookPurchaseCreatedAt: Date | null, hasEntitlement: boolean, now: Date): boolean`**
  → `true` se existe compra Start há **< 30 dias** e o usuário **ainda não tem
  entitlement**. Testes: sem compra→false; compra 29d→true; 31d→false; já tem
  entitlement→false. (Prevenção de reuso: ter entitlement já invalida.)

### 4. E-mails de ciclo / CRM

**Migration `0019_sent_emails.sql`** (dedup, para nunca repetir):

```sql
create table if not exists sent_emails (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  email_type text not null,          -- 'compra' | 'novo_ciclo' | 'novos_conteudos' | 'expiracao'
  reference text not null,           -- cycle_key, ou 'expiry-7d', etc.
  sent_at timestamptz not null default now(),
  unique (user_id, email_type, reference)
);
alter table sent_emails enable row level security;
```

**E-mails (em `src/lib/email.ts`, padrão Brevo já usado — agora entrega, domínio
autenticado):**
1. **Confirmação de compra** (Regular/Advanced) — imediato no webhook.
2. **Regular "novo ciclo"** — no aniversário mensal (slot reabre). *(cron)*
3. **Advanced "novos conteúdos"** — ao publicar conteúdo novo: endpoint/script
   disparável que avisa Advanced ativos. *(evento manual, não tempo)*
4. **Expiração próxima** — N dias antes de `expires_at`, com nudge de renovação. *(cron)*
5. *(opcional)* **Win-back** pós-expiração. *(cron; deixar como opcional)*

**Agendamento — Vercel Cron (zero dep):**
- `vercel.json` com cron diário → rota protegida **`src/app/api/cron/emails-diarios/route.ts`**,
  guardada por `CRON_SECRET` (header `Authorization: Bearer`), só o Vercel chama.
- **Lógica pura `src/lib/email-cycle.ts`:** dado o conjunto de `entitlements` +
  `sent_emails` + `now`, retorna a lista de e-mails a enviar hoje:
  - `dueNewCycle(entitlement, now, sent)` — Regular cujo aniversário mensal caiu hoje
    e ainda não recebeu o `novo_ciclo` deste `cycle_key`.
  - `dueExpiry(entitlement, now, sent, daysBefore)` — expira em `daysBefore` e não
    recebeu `expiracao` desta referência.
  - Testes cobrindo: dispara no dia certo; não redispara (dedup); ignora expirados.
- A rota chama a lógica pura, envia via `email.ts`, grava `sent_emails`.

> **Dependências (agora honestas):** o **Brevo entrega** (resolvido — domínio
> autenticado 2026-07-13). O **cron só roda em deploy** (Vercel Cron não dispara no
> `npm run dev`); a lógica é testada por unidade + batendo na rota à mão localmente,
> o disparo automático valida no ambiente publicado.

### 5. `/oferta` (superfície de compra)

`src/components/marketing/OfferPricing.tsx` deixa de ser waitlist para Regular/Advanced:
- **Regular/Advanced:** trocar `WaitlistForm` por checkout real (form de e-mail →
  `POST /api/checkout` com `plan`), tirar o selo "Em breve". Advanced mostra a opção
  12x.
- **Start:** realinhar a copy ao modelo canônico (**visualização** + trilha do ebook;
  destaque do **cupom de R$47/30 dias** para upgrade) — hoje a copy sugere consumo
  pleno, o que contradiz o entitlement.
- `plan_waitlist` e `/api/waitlist` podem permanecer (histórico) mas saem do fluxo
  ativo dos cards pagos.

## Verificação (o "gate")

- **Lógica pura** (`resolveAccess`, `cycleKeyFor`, `canConsume`, `couponEligible`,
  `email-cycle`) → **testes Vitest** (é onde mora a regra de negócio e de dinheiro).
- `npx tsc --noEmit` (0) + `npm run test` (verde).
- **Fluxo de checkout em modo teste** do Stripe (cartões de teste) no navegador:
  comprar Regular/Advanced → webhook cria entitlement → consumir conteúdo (Advanced
  ilimitado; Regular 1/mês + tranca no 2º) → cupom aplicado no upgrade.
- `npm run build` segue falhando sem `STRIPE_SECRET_KEY` (pré-existente).

## Casos de borda

- **Comprar Advanced direto (sem Start):** vira superconjunto — webhook cria
  token+entitlement; ganha ebook/triagem/roadmap + consumo pleno.
- **Regular tenta 2º conteúdo no mês:** `cycle-used` → gate "volta dia X / vire Advanced".
- **Passe expira:** `resolveAccess` → `view`; conteúdos já desbloqueados (Regular)
  **perdem consumo** (o passe acabou) — desbloqueio vale enquanto o passe vale.
- **Duplo-clique / reentrega Stripe:** entitlement idempotente por `stripe_payment_id`;
  unlock idempotente por `unique(user_id, content_id)`.
- **Upgrade Regular→Advanced:** nova compra cria 2º entitlement; `resolveAccess`
  passa a devolver `advanced` (mais alto vence). Sem downgrade automático.
- **Cupom:** só 1 vez (ter entitlement invalida elegibilidade); expira em 30 dias.

## Fora de escopo (YAGNI)

- **Cobrança recorrente** (Stripe subscriptions) — o modelo é passe, de propósito.
- **Deep-return do `next`** do ContentGate (herdado da Frente 1) — segue na frente
  de deploy do gate.
- **Reposicionamento da landing** (`PricingV2`, copy anti-mensalidade) — decisão de
  marketing; aqui só a `/oferta` (superfície de compra) muda.
- **Página de feed / fórum** em si — outras frentes; aqui só definimos a **regra de
  acesso** (o gate) que elas vão chamar.
- **Painel admin de publicação** que dispara o e-mail "novos conteúdos" — expõe-se um
  endpoint disparável; a UI de admin fica para depois.
- **Go-live do Stripe** (verificação da empresa) e o valor exato do parcelado 12x.

## Fases (a frente é grande; ordem de entrega)

1. **Núcleo de receita (shippable em modo teste):** Blocos 1–3 + `/oferta` —
   entitlement, consumo/enforcement, Stripe, cupom. Testável ponta a ponta com
   cartões de teste.
2. **Camada de e-mails/CRM:** Bloco 4 — transacionais (imediato) + cron (valida em
   deploy). Brevo já entrega.

## Decisões a confirmar na revisão do spec

- **Feed:** proposto **leitura = Advanced** (Regular é metrado a 1 conteúdo/mês; o
  feed é fluxo contínuo que não encaixa em "1/mês"). Confirmar, ou permitir feed a
  qualquer passe vigente.
- **Ciclo mensal:** proposto **aniversário da compra** (vs dia-1 do calendário).
- **Janela do "expiração próxima":** proposto **7 dias antes** (e opcionalmente 1 dia).
