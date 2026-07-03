# CONTEXTO COMPLETO — MATRIZ CENTRAL

## IDENTIDADE DO PROJETO
Nome: Matriz Central
Domínio: matrizcentral.com.br
Objetivo: Plataforma de info-produtos low-ticket (R$37-97)
  com sistema inteligente de triagem, gamificação e
  certificados digitais.
Nicho: AI/DevTools em Português Brasileiro
Status: Iniciando build (contas em setup)

---

## STACK TÉCNICO
- Frontend: Next.js 14 (App Router) + TypeScript
- Estilo: Tailwind CSS + shadcn/ui
- Banco: Supabase (PostgreSQL + RLS ativo)
- Pagamento: Stripe (principal) + Hotmart/Kwify (webhooks)
- Email: Brevo (automação e sequences)
- Deploy: Vercel
- Domínio: matrizcentral.com.br

---

## PRODUTOS (6 ebooks low-ticket)

### PRODUTO 1 (MVP - foco atual):
Título: "Construa Seu Próprio ChatGPT Particular em
        Poucos Minutos - LLM Local"
Hero: "O Guia Definitivo para Rodar LLMs Localmente
      e Nunca Mais Pagar por Tokens ou Mensalidades"
CTA: "Pare de Pagar por IA — Monte sua própria IA
     Local em menos de uma hora."
Preço: R$47
Arquivo: /content/ebooks/llm-local.md (gerado)
Quiz: /src/data/quiz-llm-local.ts (gerado, 15 questões)
Componente Quiz: /src/components/quiz/QuizValidacao.tsx

### PRODUTOS 2-6 (em elaboração):
- Claude Code - Python Edition (R$67)
- MCP: Integrações Avançadas (R$57)
- CEO + IA: Decisões Financeiras (R$77)
- NotebookLM + Obsidian: Combo Infinito (R$47)
- Harness + PTC: Automação (R$47)

---

## PERFIS DE USUÁRIO (6 personas)
Após compra, usuário faz triagem (quiz 20 perguntas)
e é classificado em 1 dos 6 perfis:

1. dev_python_aia     → Dev Python + IA Local
2. dev_nodejs_web     → Dev JS/TS + Web
3. devops_infra       → DevOps + Infra
4. ceo_financeiro     → CEO/Gestor Financeiro
5. pm_product         → Product Manager
6. founder_builder    → Founder/Hacker

Cada perfil recebe:
- Ebook 2 GRATUITO personalizado
- Roadmap de estudo recomendado
- Sequência de emails automatizada (Brevo)

---

## FLUXO COMPLETO DO USUÁRIO

1. COMPRA
   └─ Landing: matrizcentral.com.br
   └─ Checkout: Stripe (PIX + cartão + boleto)
   └─ Webhook: gera token único (UUID)

2. EMAIL PÓS-COMPRA (Brevo automático)
   └─ Assunto: "Seu token chegou! Descubra seu perfil"
   └─ Link: matrizcentral.com.br/quiz/[token]

3. TRIAGEM (Quiz 20 perguntas)
   └─ URL: /quiz/[token]
   └─ Calcula perfil por pontuação
   └─ Ganha 50 XP + Badge "Autoconhecimento"
   └─ Redireciona para /dashboard/[token]

4. DASHBOARD PERSONALIZADO
   └─ URL: /dashboard/[token]
   └─ Mostra: perfil, roadmap, produtos recomendados
   └─ Download do Ebook 1 (comprado)
   └─ Acesso ao Ebook 2 (grátis, personalizado)
   └─ Quiz de validação (após ler ebook)
   └─ Sistema de gamificação (sidebar)

5. QUIZ DE VALIDAÇÃO (após ler ebook)
   └─ 15 perguntas + dica sempre visível
   └─ Mínimo 70% para aprovação
   └─ Aprovado: 100 XP + Badge + Certificado PDF
   └─ Reprovado: pode tentar novamente

6. GAMIFICAÇÃO
   └─ XP por ações (compra, quiz, download, streak)
   └─ 6 níveis: Aprendiz → Estudante → Praticante
                → Especialista → Mestre → Lenda
   └─ 20+ badges com raridades
   └─ Leaderboard global (semanal + all-time)
   └─ Desafios diários/semanais/mensais
   └─ Certificados PDF com QR code verificável

---

## POLÍTICA DE REEMBOLSO (Smart Gates)
Reembolso PERMITIDO apenas se:
✅ Dentro de 30 dias da compra
✅ NÃO completou a triagem
✅ NÃO fez download do arquivo

Reembolso BLOQUEADO se:
❌ Completou a triagem (recebeu benefícios extras)
❌ Fez download (produto digital acessado)
❌ Passou 30 dias

---

## BANCO DE DADOS (Supabase - tabelas necessárias)

Tabelas principais:
- users (id, email, stripe_customer_id,
         total_xp, current_level, study_streak,
         last_activity_date)

- purchases (id, user_id, product_id, price_cents,
             status, stripe_payment_id,
             downloaded, refund_window_expires)

- tokens (token, purchase_id, profile_id,
          triaged, triaged_at, valid_until)

- quiz_responses (id, token, question_id,
                  answer, created_at)

- profiles (id, name, description,
            recommended_ebooks, study_roadmap)

- badges (id, name, description, icon,
          xp_reward, unlock_condition, rarity)

- badges_earned (id, user_id, badge_id, earned_at)

- xp_transactions (id, user_id, xp_amount,
                   action_type, reference_id)

- levels (level_number, name, required_xp,
          description, rewards)

- certificates (id, user_id, certificate_type,
                product_id, title, issued_at,
                verification_code, pdf_url)

- challenges (id, title, type, xp_reward,
              condition, starts_at, ends_at)

- challenges_progress (id, user_id, challenge_id,
                        progress_json, is_completed)

- leaderboard (user_id, total_xp, level,
               week_xp, rank_weekly, rank_all_time)

---

## VARIÁVEIS DE AMBIENTE NECESSÁRIAS
(arquivo .env.local na raiz do projeto)

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
BREVO_API_KEY=
NEXT_PUBLIC_URL=http://localhost:3000

---

## ARQUIVOS JÁ GERADOS (disponíveis)
- /src/data/quiz-llm-local.ts
  (15 questões com gabarito, dicas, explicações)

- /src/components/quiz/QuizValidacao.tsx
  (componente React completo do quiz)

- /content/ebooks/llm-local.md
  (ebook draft completo - 9 capítulos)

---

## PRIMEIRA TAREFA (execute agora):

1. Inicialize o projeto Next.js:
npx create-next-app@latest . --typescript \
  --tailwind --eslint --app --src-dir \
  --import-alias "@/*"

2. Instale dependências:
npm install @supabase/supabase-js @supabase/ssr \
  stripe @stripe/stripe-js lucide-react \
  class-variance-authority clsx tailwind-merge \
  @radix-ui/react-dialog @radix-ui/react-progress \
  @radix-ui/react-tabs qrcode jspdf

3. Inicialize shadcn/ui:
npx shadcn@latest init
(escolha: Default style, Slate, CSS variables: yes)

4. Adicione componentes shadcn:
npx shadcn@latest add button card badge \
  progress tabs dialog sheet separator avatar

5. Crie o arquivo .env.local na raiz com as
   variáveis listadas acima (deixe os valores
   vazios por enquanto)

6. Confirme quando terminar mostrando
   a estrutura de pastas gerada.

Vamos um passo por vez. Aguardo confirmação
antes de continuar.