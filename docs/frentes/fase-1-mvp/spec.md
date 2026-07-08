# Matriz Central — Fase 1: Bootstrap + Fluxo Core do MVP

Data: 2026-07-03
Status: Aprovado para plano de implementação

## Contexto

Matriz Central (matrizcentral.com.br) é uma plataforma brasileira de venda de
info-produtos low-ticket (R$37-97) no nicho de AI/DevTools. O modelo combina
venda de ebooks com triagem de perfil por quiz, gamificação e certificados
digitais verificáveis.

O projeto tem arquitetura extensa já elaborada em outra sessão (Claude Chat),
salva em `arquitetura-1/` (core: ebook+token+triagem+progressão, SQL real,
timeline de 28 dias) e `arquitetura-2/` (gamificação completa: XP, badges,
níveis, certificados, leaderboard, desafios, SQL com triggers, timeline de 5
semanas). Essa arquitetura é grande demais para um único ciclo spec→plano→
implementação, por isso foi decomposta em fases:

1. **Fase 1 (este documento)** — Bootstrap + fluxo core do MVP
2. Fase 2 — Gamificação completa (XP, badges, níveis, streaks, leaderboard)
3. Fase 3 — Certificados verificáveis (PDF, QR code, `/verify/[code]`)
4. Fase 4 — Canais extras + admin (Hotmart/Kwify, painel admin, desafios, refund_requests)
5. Fase 5 — Graphify (ferramenta de apoio ao desenvolvimento, opcional, paralela a qualquer fase)

**Restrição de projeto:** toda a infraestrutura deve rodar em tiers gratuitos
(Supabase free, Vercel hobby, Brevo free até 300 e-mails/dia, Stripe sem
mensalidade fixa — só taxa por transação).

## Escopo da Fase 1

Fluxo ponta a ponta para o Produto 1 ("Construa Seu Próprio ChatGPT Particular
em Poucos Minutos - LLM Local", R$47):

compra (Stripe) → e-mail com token (Brevo) → quiz de triagem → cálculo de
perfil → dashboard personalizado → quiz de validação (componente já existente)
→ redirecionamento pós-aprovação.

**Fora de escopo desta fase** (ver fases 2-5 acima): gamificação completa
além de um XP ledger mínimo, certificados em PDF/QR, canais Hotmart/Kwify,
painel admin, produtos 2-6, `refund_requests` (fluxo de aprovação manual).

### Conteúdo já existente (reaproveitado sem alteração)
- `content/ebooks/ebook_llm_local_matrizcentral.md` — ebook completo (9 capítulos)
- `src/data/quiz-llm-local.ts` — 15 questões do quiz de validação, com gabarito, dica e explicação
- `src/components/QuizValidacao.tsx` — componente React completo do quiz de validação

### Conteúdo a ser criado nesta fase
- Restante do quiz de triagem: a arquitetura fonte (`arquitetura-1/parte3-fluxo-de-triagem.md`)
  já define o formato (perguntas `radio`/`checkbox`, pontos por perfil, ~18-20
  perguntas, 5-7 min) e tem 5 perguntas de exemplo escritas. Faltam ~15
  perguntas no mesmo formato, cobrindo os 6 perfis de forma balanceada. Essas
  perguntas serão escritas como parte do plano de implementação desta fase.

## Modelo de dados (Supabase)

Subconjunto da arquitetura core (`arquitetura-1/parte2`), com 3 ajustes
deliberados em relação à fonte (ver "Decisões que resolvem inconsistências"
abaixo):

```sql
users (
  id UUID PK,
  email TEXT UNIQUE,
  stripe_customer_id TEXT,
  total_xp INTEGER DEFAULT 0,
  created_at TIMESTAMP
)

purchases (
  id UUID PK,
  user_id UUID FK -> users,
  product_id TEXT,              -- ex: "ebook_llm_local"
  price_cents INTEGER,          -- 4700
  status TEXT DEFAULT 'pending', -- pending | paid | refunded
  stripe_payment_id TEXT UNIQUE,
  downloaded BOOLEAN DEFAULT false,
  refund_window_expires TIMESTAMP, -- created_at + 30 dias
  created_at TIMESTAMP
)

tokens (
  token TEXT PK,                 -- curto, ex: gerado via nanoid(10)
  purchase_id UUID FK -> purchases,
  profile_id TEXT NULL FK -> profiles,
  triaged BOOLEAN DEFAULT false,
  triaged_at TIMESTAMP NULL,
  valid_until TIMESTAMP,         -- created_at + 365 dias (acesso, distinto do refund_window)
  created_at TIMESTAMP
)

quiz_responses (
  id UUID PK,
  token TEXT FK -> tokens,
  quiz_type TEXT,                -- 'triagem' | 'validacao'
  question_id INTEGER,
  answer TEXT,                   -- JSON serializado (suporta radio e checkbox)
  is_correct BOOLEAN NULL,       -- só usado em quiz_type='validacao'
  created_at TIMESTAMP
)

profiles (
  id TEXT PK,                    -- ex: "dev_python_aia"
  name TEXT,
  description TEXT,
  recommended_ebooks JSON,       -- inclui o ebook 2 grátis do perfil
  study_roadmap JSON
)

xp_events (
  id UUID PK,
  user_id UUID FK -> users,
  xp_amount INTEGER,
  action_type TEXT,              -- 'compra' | 'triagem' | 'download' | 'validacao'
  reference_id TEXT,
  created_at TIMESTAMP
)
```

### Decisões que resolvem inconsistências da arquitetura fonte

1. **`quiz_responses` única** com coluna `quiz_type`, em vez de tabelas
   separadas para triagem e validação — a arquitetura fonte já usava esse
   nome único, mas não tinha uma forma de diferenciar os dois quizzes; a
   coluna `quiz_type` resolve isso sem introduzir uma tabela nova.
2. **`tokens.valid_until` = 365 dias.** A arquitetura fonte tinha uma
   inconsistência entre o fluxo textual (30 dias) e o código do webhook (365
   dias). Resolvido a favor de 365 dias porque é validade de *acesso* ao
   dashboard/conteúdo, conceito distinto da janela de reembolso de 30 dias
   (`purchases.refund_window_expires`) — o usuário deve continuar acessando o
   que comprou mesmo depois que a janela de reembolso fechar.
3. **Sem tabela `recommended_products`.** A arquitetura fonte propunha essa
   tabela normalizada (profile→produto, ordem, gratuidade, dia de trigger de
   e-mail), mas só se justifica com múltiplos produtos ativos. Com 1 produto,
   `profiles.recommended_ebooks` (JSON) já cobre o caso; a tabela entra
   quando o catálogo crescer (Fase 4+).
4. **Sem tabela `refund_requests`.** Nunca existiu como SQL na arquitetura
   fonte (só em diagrama). Nesta fase, reembolso é apenas *verificação de
   elegibilidade* computada a partir de `purchases` + `tokens`, sem
   persistência — não há fluxo de aprovação manual (isso é admin, Fase 4).

## Acesso e segurança

Não há Supabase Auth — o token na URL é a credencial (padrão magic-link).
Todas as leituras/escritas passam por rotas server-side (Route Handlers e
Server Components) usando a **service role key** do Supabase. RLS fica
default-deny para a anon key, evitando desenhar políticas RLS complexas em
cima de um token que não é um usuário autenticado de verdade.

## Fluxo de dados / rotas

```
POST /api/checkout
  → cria sessão Stripe Checkout (PIX + cartão + boleto) para o produto 1
  → metadata: product_id

POST /api/webhooks/stripe
  → verifica assinatura Stripe
  → idempotência: se stripe_payment_id já processado, ignora (Stripe retry-safe)
  → evento checkout.session.completed:
     - upsert users (por email)
     - insert purchases (status=paid, refund_window_expires = now+30d)
     - gera token curto único (nanoid, 10 chars) → insert tokens (valid_until = now+365d)
     - insert xp_events (+100 XP, action_type='compra')
     - chama lib/email.ts (Brevo) → envia link /quiz/[token]
       (falha no envio de e-mail não desfaz a compra; fica logada para reenvio manual)

GET /quiz/[token]  (Server Component)
  → valida token: existe, não expirado (valid_until), ainda não triado
  → se inválido/expirado/já triado → tela de erro amigável (não 500 cru)
  → renderiza quiz de triagem (perguntas em formato radio/checkbox, com pontos por perfil)

POST /api/quiz  (body: { token, quizType: "triagem", answers })
  → bloqueia se tokens.triaged já é true (evita reenvio duplicado)
  → insere em quiz_responses (quiz_type='triagem')
  → calcula perfil vencedor por soma de pontos
  → seta tokens.profile_id, tokens.triaged=true, tokens.triaged_at=now
  → insert xp_events (+50 XP, action_type='triagem')
  → retorna profile_id → client redireciona para /dashboard/[token]

GET /dashboard/[token]  (Server Component)
  → busca token + profile + purchase
  → mostra perfil descoberto, roadmap, XP atual, download do ebook 1,
    acesso ao ebook 2 grátis (do perfil), quiz de validação (QuizValidacao.tsx)

GET /api/download?token=...
  → valida token, serve o conteúdo do ebook 1
  → na primeira chamada: seta purchases.downloaded=true + insert xp_events
    (+25 XP, action_type='download'). Chamadas seguintes não duplicam o XP
    (idempotente por purchases.downloaded já ser true)
  → `purchases.downloaded=true` é o mesmo campo que bloqueia reembolso (ver
    "Decisões que resolvem inconsistências", item 4)

POST /api/quiz  (body: { token, quizType: "validacao", answers, score, passed })
  → insere respostas em quiz_responses (quiz_type='validacao', is_correct por questão)
  → se passed: insert xp_events (+100 XP, action_type='validacao')
  → certificado fica para a Fase 3 — o botão "Ver Meu Certificado" do
    QuizValidacao.tsx apenas redireciona para /dashboard/[token] por enquanto
```

Endpoint único `/api/quiz` com discriminador `quizType`, em vez de duas rotas
separadas — mais simples e alinhado à estrutura de pastas já definida em
`contextocentral.md` (`api/quiz/route.ts`).

## Estrutura de pastas (Fase 1)

```
src/
├─ app/
│  ├─ (marketing)/
│  │  ├─ page.tsx              ← landing page
│  │  └─ layout.tsx
│  ├─ quiz/[token]/page.tsx    ← triagem
│  ├─ dashboard/[token]/page.tsx ← área do aluno
│  └─ api/
│     ├─ checkout/route.ts
│     ├─ webhooks/stripe/route.ts
│     ├─ quiz/route.ts
│     └─ download/route.ts
├─ components/
│  ├─ marketing/ (Hero, ProductCard, PricingSection, FAQ)
│  ├─ dashboard/ (RoadmapCard — versão mínima, sem XPProgress/BadgeGrid/ChallengeCard ainda)
│  └─ quiz/
│     ├─ QuizTriagem.tsx       ← novo, quiz de perfil
│     └─ QuizValidacao.tsx     ← já existe, mover de src/components/ para src/components/quiz/
├─ lib/
│  ├─ supabase/ (client.ts, server.ts)
│  ├─ stripe.ts
│  ├─ email.ts                 ← Brevo
│  ├─ tokens.ts                ← geração e validação
│  └─ quiz-scoring.ts          ← lógica de pontuação/perfil vencedor
├─ data/
│  ├─ quiz-llm-local.ts        ← já existe
│  └─ quiz-triagem.ts          ← novo, ~20 perguntas
└─ types/index.ts

content/ebooks/
└─ ebook_llm_local_matrizcentral.md  ← já existe, mantém nome e local atuais
```

## Tratamento de erros

- Webhook Stripe: assinatura obrigatória (rejeita requests não assinados);
  idempotência por `stripe_payment_id` evita duplicar compra em retry do
  Stripe; falha de envio de e-mail não reverte a compra, só fica logada.
- Token inválido/expirado/já triado: páginas de quiz e dashboard mostram
  estado de erro amigável.
- Reenvio de triagem: bloqueado no servidor se `tokens.triaged = true`,
  independentemente do estado do client.

## Testes

- **Unitário (Vitest):** lógica de pontuação do quiz de triagem (perfil
  vencedor por soma de pontos, incluindo empates), geração/validação de
  token.
- **Integração:** handler do webhook Stripe com evento
  `checkout.session.completed` mockado, validando criação de
  user/purchase/token e chamada ao Brevo (mockada).
- **Manual/E2E:** `stripe trigger checkout.session.completed` em modo teste
  + navegação real pelo fluxo completo (compra → e-mail → triagem →
  dashboard → validação) no browser local.

## Variáveis de ambiente (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
BREVO_API_KEY=
NEXT_PUBLIC_URL=http://localhost:3000
```
