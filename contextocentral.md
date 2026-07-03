# MATRIZ CENTRAL — Contexto Completo do Projeto

## VISÃO GERAL
Plataforma brasileira de info-produtos low-ticket (R$37-97)
no nicho de AI/DevTools. O modelo de negócio combina venda
de ebooks com triagem inteligente por perfil, gamificação
completa e certificados digitais verificáveis.

Site: matrizcentral.com.br
Pasta local: C:\Users\jefer\Documents\Projetos\matrizcentral
Status atual: Setup de infraestrutura + build inicial

---

## STACK TÉCNICO
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (PostgreSQL + RLS + Edge Functions)
- Stripe (pagamento principal)
- Hotmart + Kwify (canais extras via webhook)
- Brevo (email + automação)
- Vercel (deploy)

---

## PRODUTOS (6 ebooks)

### PRODUTO 1 — MVP (foco do build atual)
Título: "Construa Seu Próprio ChatGPT Particular
        em Poucos Minutos - LLM Local"
Hero: "O Guia Definitivo para Rodar LLMs Localmente
      e Nunca Mais Pagar por Tokens ou Mensalidades"
CTA: "Pare de Pagar por IA — Monte sua própria IA
     Local em menos de uma hora."
Preço: R$47
Arquivo gerado: /content/ebooks/llm-local.md
Quiz gerado: /src/data/quiz-llm-local.ts

### PRODUTOS 2-6 (em elaboração)
- "Setup Claude Code - Do Zero ao Deploy" (R$67)
- "MCP: Integrações Avançadas" (R$57)
- "CEO + IA: Decisões Financeiras" (R$77)
- "NotebookLM + Obsidian: Combo Infinito" (R$47)
- "Harness + PTC: Automação" (R$47)

---

## FLUXO COMPLETO DO USUÁRIO

ETAPA 1 — COMPRA
→ Landing page (matrizcentral.com.br)
→ Checkout Stripe (PIX + cartão + boleto)
→ Webhook gera token único no Supabase
→ Email automático (Brevo) com token

ETAPA 2 — TRIAGEM
→ URL: /quiz/[token] (quiz 20 perguntas)
→ Sistema calcula 1 de 6 perfis
→ Ganha: 50 XP + Badge "Autoconhecimento"
→ Redirect: /dashboard/[token]

ETAPA 3 — DASHBOARD PERSONALIZADO
→ Perfil descoberto com descrição
→ Roadmap de estudo personalizado
→ Download Ebook 1 (comprado)
→ Acesso Ebook 2 (GRÁTIS, baseado no perfil)
→ Sidebar gamificada (XP, badges, ranking)

ETAPA 4 — VALIDAÇÃO
→ Quiz 15 questões (após ler ebook)
→ Dica sempre visível em cada questão
→ Mínimo 70% para aprovação
→ Aprovado: 100 XP + Badge + Certificado PDF
→ Certificado tem QR code verificável em
  matrizcentral.com.br/verify/[codigo]

ETAPA 5 — GAMIFICAÇÃO CONTÍNUA
→ Desafios diários/semanais/mensais
→ Leaderboard global (semanal + all-time)
→ Upsells automáticos via email (Brevo)

---

## 6 PERFIS DE USUÁRIO

Após triagem, usuário é classificado em:

1. dev_python_aia     → Dev Python + IA Local
   Ebook 2 grátis: "Claude Code Python Edition"

2. dev_nodejs_web     → Dev JS/TS + Web Apps
   Ebook 2 grátis: "MCP: Integrações Avançadas"

3. devops_infra       → DevOps + Infra + Deploy
   Ebook 2 grátis: "LLM no Seu Servidor"

4. ceo_financeiro     → CEO/Gestor Financeiro
   Ebook 2 grátis: "CEO + IA: Decisões Financeiras"

5. pm_product         → Product Manager
   Ebook 2 grátis: "NotebookLM + Obsidian"

6. founder_builder    → Founder + Growth
   Ebook 2 grátis: "Harness + PTC: Automação"

---

## GAMIFICAÇÃO COMPLETA

### XP por Ação
- Comprar produto: 100 XP
- Completar triagem: 50 XP
- Download ebook: 25 XP
- Completar ebook (marcar lido): 150 XP
- Passar quiz validação (70%+): 100 XP
- Desafio diário: 50 XP
- Desafio semanal: 200 XP
- Streak 7 dias: 100 XP
- Streak 30 dias: 300 XP

### 6 Níveis
1. Aprendiz     → 0 XP
2. Estudante    → 500 XP
3. Praticante   → 1.200 XP
4. Especialista → 2.500 XP
5. Mestre       → 5.000 XP
6. Lenda        → 10.000 XP

### Badges Principais (20+)
- 🧠 Autoconhecimento (completou triagem)
- 📖 Primeiros Passos (1 ebook completo)
- 📚 Leitor Dedicado (3 ebooks)
- 🏆 Mestre do Conhecimento (6 ebooks)
- ✅ Validador (passou no quiz)
- 🔥 Fogo Semanal (7 dias streak)
- ⚡ Imparável (90 dias streak)
- 🥇 Campeão Semanal (10 desafios)

### Certificados
- Por ebook concluído (PDF gerado)
- Especialista (3+ ebooks mesmo tema)
- Master (todos os 6 ebooks)
- Cada certificado: nome, data, score,
  QR code, verificação online

---

## POLÍTICA DE REEMBOLSO (Smart Gates)

PERMITIDO se (todas as condições):
✅ Dentro de 30 dias da compra
✅ NÃO completou triagem
✅ NÃO fez download

BLOQUEADO automaticamente se:
❌ Completou triagem (recebeu ebook grátis)
❌ Fez download de qualquer arquivo
❌ Passou 30 dias

Lógica: após triagem o usuário recebeu
benefícios extras (ebook 2 grátis +
roadmap personalizado). Isso torna a
transação não reembolsável por design.

---

## BANCO DE DADOS (Supabase)

Tabelas necessárias:

users
├─ id (UUID)
├─ email
├─ stripe_customer_id
├─ total_xp (default 0)
├─ current_level (default 1)
├─ study_streak (default 0)
└─ last_activity_date

purchases
├─ id (UUID)
├─ user_id → users
├─ product_id (ex: "ebook_llm_local")
├─ price_cents (ex: 4700)
├─ status (pending/paid/refunded)
├─ stripe_payment_id
├─ downloaded (boolean, default false)
└─ refund_window_expires (now + 30 dias)

tokens
├─ token (unique string, ex: ABC123XYZ)
├─ purchase_id → purchases
├─ profile_id (ex: "dev_python_aia")
├─ triaged (boolean, default false)
├─ triaged_at (timestamp)
└─ valid_until (now + 365 dias)

quiz_responses
├─ id (UUID)
├─ token → tokens
├─ question_id (integer)
├─ answer (text)
└─ created_at

profiles
├─ id (ex: "dev_python_aia")
├─ name (ex: "Dev Python + IA Local")
├─ description
├─ recommended_ebooks (JSON array)
└─ study_roadmap (JSON)

badges
├─ id (ex: "autoconhecimento")
├─ name
├─ description
├─ icon (emoji ou URL)
├─ xp_reward
├─ unlock_condition (JSON)
└─ rarity (common/rare/epic/legendary)

badges_earned
├─ id (UUID)
├─ user_id → users
├─ badge_id → badges
└─ earned_at

xp_transactions
├─ id (UUID)
├─ user_id → users
├─ xp_amount
├─ action_type
├─ reference_id
└─ created_at (timestamp)

levels
├─ level_number (1-6)
├─ name
├─ required_xp
└─ rewards (JSON)

certificates
├─ id (UUID)
├─ user_id → users
├─ certificate_type
├─ product_id
├─ title
├─ issued_at
├─ verification_code (unique)
└─ pdf_url

challenges
├─ id (UUID)
├─ title
├─ challenge_type (daily/weekly/monthly)
├─ xp_reward
├─ condition (JSON)
├─ starts_at
└─ ends_at

challenges_progress
├─ id (UUID)
├─ user_id → users
├─ challenge_id → challenges
├─ progress_json
├─ is_completed (boolean)
└─ completed_at

leaderboard
├─ user_id → users
├─ total_xp
├─ current_level
├─ week_xp
├─ rank_weekly
└─ rank_all_time

---

## ESTRUTURA DE PASTAS DO PROJETO

src/
├─ app/
│  ├─ (marketing)/
│  │  ├─ page.tsx          ← landing page
│  │  └─ layout.tsx
│  ├─ quiz/
│  │  └─ [token]/
│  │     └─ page.tsx       ← triagem
│  ├─ dashboard/
│  │  └─ [token]/
│  │     └─ page.tsx       ← área do aluno
│  ├─ admin/
│  │  └─ page.tsx          ← painel admin
│  ├─ verify/
│  │  └─ [code]/
│  │     └─ page.tsx       ← verificar certificado
│  └─ api/
│     ├─ checkout/
│     │  └─ route.ts       ← criar sessão Stripe
│     ├─ webhooks/
│     │  ├─ stripe/
│     │  │  └─ route.ts    ← pagamento confirmado
│     │  ├─ hotmart/
│     │  │  └─ route.ts    ← webhook Hotmart
│     │  └─ kwify/
│     │     └─ route.ts    ← webhook Kwify
│     ├─ quiz/
│     │  └─ route.ts       ← salvar respostas
│     ├─ refund/
│     │  └─ route.ts       ← verificar elegibilidade
│     └─ certificates/
│        └─ route.ts       ← gerar PDF
├─ components/
│  ├─ marketing/
│  │  ├─ Hero.tsx
│  │  ├─ ProductCard.tsx
│  │  ├─ PricingSection.tsx
│  │  └─ FAQ.tsx
│  ├─ dashboard/
│  │  ├─ Sidebar.tsx
│  │  ├─ XPProgress.tsx
│  │  ├─ BadgeGrid.tsx
│  │  ├─ RoadmapCard.tsx
│  │  ├─ CertificateCard.tsx
│  │  └─ ChallengeCard.tsx
│  └─ quiz/
│     ├─ QuizTriagem.tsx   ← quiz de perfil (20 q)
│     └─ QuizValidacao.tsx ← quiz de validação (15 q)
├─ lib/
│  ├─ supabase/
│  │  ├─ client.ts
│  │  └─ server.ts
│  ├─ stripe.ts
│  ├─ email.ts
│  ├─ tokens.ts
│  ├─ gamification.ts
│  └─ certificates.ts
├─ data/
│  └─ quiz-llm-local.ts    ← JÁ GERADO ✅
└─ types/
   └─ index.ts

content/
└─ ebooks/
   └─ llm-local.md         ← JÁ GERADO ✅

---

## ARQUIVOS JÁ PRONTOS

1. /src/data/quiz-llm-local.ts
   → 15 questões com gabarito, dicas e explicações
   → Configurações: 70% mínimo, 100 XP, Badge Validador

2. /src/components/quiz/QuizValidacao.tsx
   → Componente React completo
   → Dica sempre visível
   → Feedback visual por questão
   → Tela de resultado com revisão de erros
   → Recompensas exibidas ao passar

3. /content/ebooks/llm-local.md
   → 9 capítulos completos
   → Tabela comparativa 26 modelos
   → Organograma de decisão
   → Setup Ollama + LM Studio
   → Troubleshooting real
   → Links de hardware por budget

---

## VARIÁVEIS DE AMBIENTE (.env.local)

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
BREVO_API_KEY=
NEXT_PUBLIC_URL=http://localhost:3000

---

## CONTAS NECESSÁRIAS (status atual)

[ ] Supabase → em criação
[ ] Stripe   → pendente
[ ] Brevo    → pendente
[ ] Vercel   → pendente

---

## PRIMEIRA TAREFA PARA VOCÊ (Claude Cowork)

O projeto ainda não foi inicializado.
Execute em ordem:

PASSO 1: Inicializar Next.js
npx create-next-app@latest . \
  --typescript --tailwind --eslint \
  --app --src-dir --import-alias "@/*"

PASSO 2: Instalar dependências
npm install \
  @supabase/supabase-js \
  @supabase/ssr \
  stripe \
  @stripe/stripe-js \
  lucide-react \
  class-variance-authority \
  clsx \
  tailwind-merge \
  qrcode \
  jspdf

PASSO 3: Inicializar shadcn/ui
npx shadcn@latest init
(Default style, Slate, CSS variables: yes)

PASSO 4: Instalar componentes shadcn
npx shadcn@latest add \
  button card badge progress \
  tabs dialog sheet separator avatar

PASSO 5: Criar .env.local na raiz
(com as variáveis listadas acima, valores
vazios por enquanto)

PASSO 6: Criar estrutura de pastas
(conforme /src estrutura acima)

PASSO 7: Confirmar com:
npm run dev
(deve abrir em http://localhost:3000)

Aguardo confirmação de cada passo
antes de continuar.