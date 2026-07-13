# CRM / pós-venda — Matriz Central

> Artefato de **planejamento** (não código). Jornada do cliente após a compra:
> onboarding, retenção, reativação e suporte, alinhada ao produto real —
> **passes de pagamento único** (Start/Regular/Advanced, sem mensalidade),
> e-mail transacional via **Brevo** (domínio `matrizcentral.com.br`
> autenticado, entrega confirmada) e comunidade (**feed** + **fórum**) como
> motor de engajamento contínuo. Complementa
> [`marketing.md`](../blog-marketing/marketing.md) (aquisição/funil de
> vendas) — este documento cobre o que acontece **depois** do clique em
> "comprar".

## 1. Onboarding (compra → primeiro valor)

```
Compra (Stripe)  →  E-mail de acesso (token)  →  Triagem (quiz)  →  Primeiro valor
   webhook            sendTokenEmail              /quiz/[token]      /dashboard/[token]
                                                                       + ebook
```

1. **Compra concluída** — o webhook do Stripe (`/api/webhooks/stripe`) cria o
   entitlement (Start/Regular/Advanced) e gera o token de acesso individual.
2. **E-mail de acesso** — `sendTokenEmail` (`src/lib/email.ts`) entrega o link
   `/quiz/[token]` na hora; é o único passo entre pagar e começar (sem
   necessidade de criar senha — o token dá acesso imediato, atrito zero).
3. **Triagem (diagnóstico)** — `/quiz/[token]` coleta o perfil/contexto do
   cliente (nível de experiência com IA, objetivo) para personalizar o
   roadmap que vem a seguir.
4. **Primeiro valor** — `/dashboard/[token]` entrega o roadmap
   personalizado + acesso ao ebook (o material de apoio, sempre incluso).
   É o momento de ativação: o cliente precisa sair da triagem já com algo
   concreto em mãos, não só uma tela de "obrigado pela compra".
5. **Login (opcional, recomendado)** — o e-mail de acesso não exige conta;
   o magic link (`/entrar`) é oferecido para quem quiser voltar depois sem
   guardar o link do token, e é **obrigatório** para consumir feed/fórum/
   assinatura (Regular/Advanced).

**Ponto de atenção operacional:** se o e-mail de acesso não chegar (falha de
entrega), o cliente fica sem forma de reclamar dentro do produto — é por
isso que `/suporte` (§4) precisa estar visível e acessível **sem login**,
como rede de segurança do onboarding.

## 2. Retenção (assinatura ativa)

A retenção depende do plano — Start é view-only (sem ciclo), Regular e
Advanced têm 12 meses de acesso com gatilhos próprios de e-mail (Frente 2
Plano 2, `email-cycle.ts` / `email.ts`):

- **Regular (R$97, 1 conteúdo/mês, acumula):** `sendNewCycleEmail` dispara a
  cada abertura de ciclo mensal (`computeDueEmails`, level-triggered) —
  "novo ciclo, escolha seu conteúdo do mês". É o gatilho recorrente de
  retorno sem cobrança recorrente: o cliente já pagou, o e-mail só lembra
  que há valor esperando para ser resgatado.
- **Advanced (R$497 ou 12x R$47, tudo liberado):** `sendNewContentEmail` a
  cada publicação nova na plataforma — motivo de retorno contínuo
  independente de ciclo, já que o consumo é ilimitado.
- **Feed e fórum como engajamento contínuo:** para quem já está dentro
  (Advanced no feed sem restrição; Regular/Advanced no fórum), a comunidade
  é o mecanismo de retenção que não depende de e-mail — cada visita gera um
  motivo de voltar (novo post no feed, nova resposta no tópico que o
  cliente participou). Não há gamificação de retenção (XP) no fórum hoje;
  é área de expansão natural se a retenção via e-mail não for suficiente.
- **Confirmação de compra:** `sendPassPurchaseEmail` no momento da compra do
  passe já reforça "entre em `/entrar` e comece a consumir" — primeira
  ponte entre a compra e o hábito de retorno.

## 3. Reativação / win-back (passe expirado)

```
7 dias antes de expirar  →  1 dia antes de expirar  →  expirado (sem e-mail)  →  /oferta
   sendExpiryEmail            sendExpiryEmail            (janela fechada)        renovação manual
```

- **Janela de aviso:** `computeDueEmails` calcula os limiares de **7 e 1
  dia(s)** antes de `expires_at` e dispara `sendExpiryEmail` (assunto "Seu
  passe expira em N dia(s)") uma única vez por limiar — evita duplicar
  aviso no mesmo run e garante que o cliente veja pelo menos um lembrete
  mesmo se o cron perder o dia exato.
- **Chamada:** o e-mail de expiração aponta para `/oferta` — não existe
  fluxo de renovação automática (passes não são recorrentes por decisão de
  produto), então a reativação é sempre uma nova decisão de compra,
  reforçando o eixo "você decide quando renovar, nunca é cobrado sem
  avisar".
- **Pós-expiração:** hoje não há e-mail de win-back depois que o passe já
  expirou (fora do escopo do MVP) — é a lacuna mais clara para uma v2:
  1 e-mail em D+3 ou D+7 pós-expiração, com prova social do que a
  comunidade produziu nesse intervalo, convidando à repescagem.

## 4. Suporte (autoatendimento → contato humano)

```
Dúvida  →  FAQ em /suporte  →  Formulário de contato  →  support_messages + e-mail ao time  →  resposta por e-mail
                                    (POST /api/suporte)      (Brevo, contato@matrizcentral.com.br)
```

- **Autoatendimento:** `/suporte` reúne o FAQ já existente (`FAQ_ITEMS`,
  reusado da landing) — primeira camada, resolve sem intervenção humana as
  dúvidas recorrentes (o que é o passe, como funciona o acesso, política de
  reembolso).
- **Escalada:** quando o FAQ não resolve, o formulário de contato
  (`ContatoForm` → `POST /api/suporte`) grava a mensagem em
  `support_messages` (associada ao `user_id` se o cliente estiver logado,
  ou só ao e-mail informado) e **notifica o time** por e-mail
  (`sendSupportNotification`, best-effort — falha no envio não derruba o
  registro, a mensagem já está salva).
- **Contato humano:** a resposta ao cliente hoje é manual, por e-mail
  (não há painel de tickets nem chat ao vivo no MVP — fora de escopo,
  YAGNI). O time responde diretamente ao e-mail que o cliente informou.
- **SLA simples (meta operacional, não automatizada):** responder em até
  **24h úteis** para dúvidas gerais e **4h úteis** para bloqueios de acesso
  (cliente pagou e não conseguiu entrar) — a mensagem em `support_messages`
  tem `status` (`'aberto'` por padrão) para o time acompanhar manualmente
  via SQL/painel do Supabase até existir um painel dedicado.
- **v2 (fora do MVP):** painel admin de tickets com fila e `status`
  (`aberto`/`respondido`/`fechado`), respostas dentro do app, base de
  conhecimento além do FAQ estático, chat ao vivo.

## 5. Métricas por etapa do funil pós-venda

| Etapa | Métrica principal | Métrica secundária |
|---|---|---|
| **Onboarding** | taxa de ativação (compra → conclusão da triagem em `/quiz`) | tempo entre compra e 1ª visita ao `/dashboard` |
| **Retenção** | taxa de abertura/clique de `novo_ciclo`/`novos_conteudos` | frequência de retorno ao feed/fórum (visitas/mês por cliente Regular/Advanced) |
| **Churn / expiração** | % de passes que chegam a `expires_at` sem renovação | taxa de clique do e-mail de expiração (7d + 1d) → `/oferta` |
| **Reativação (win-back)** | taxa de recompra após expiração (D+30) | tempo médio entre expiração e recompra |
| **Suporte** | tempo médio de primeira resposta (vs. SLA de 24h/4h) | volume de mensagens em `support_messages` por semana, % resolvido só pelo FAQ (proxy: visitas ao `/suporte` sem envio de formulário) |

### Leitura entre etapas
- Onboarding fraco (baixa ativação) tende a inflar o volume de
  `support_messages` logo na primeira semana — é o sinal cruzado mais
  simples de monitorar sem ferramenta nova: cruzar data de compra com data
  da 1ª mensagem de suporte.
- Uma taxa alta de expiração sem clique no e-mail de aviso indica que o
  gatilho de e-mail (e não o produto) é o gargalo de reativação — antes de
  redesenhar a oferta, checar entregabilidade no Brevo primeiro (já houve
  um incidente de domínio não autenticado, ver `ESTADO-ATUAL.md`).

## 6. Custo e operação

- **Custo zero de infraestrutura:** toda a jornada usa peças já existentes
  — Brevo (tier gratuito, domínio autenticado), Supabase (tabelas já
  criadas: `entitlements`, `sent_emails`, `support_messages`), Vercel Cron
  (e-mails de ciclo/expiração). Nenhuma ferramenta de CRM externa.
  Operação manual apenas na resposta a `support_messages` (sem equipe
  dedicada, sustentável no volume atual).
