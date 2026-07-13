# Suporte/autoatendimento + CRM/pós-venda — Design (MVP)

> Decisões com autonomia autorizada, recomendadas e documentadas.

## Contexto

O prompt pede um **canal de autoatendimento** para clientes que entram em
contato, e a estruturação da **jornada de CRM / pós-venda**. Já existem: FAQ
(`FAQ_ITEMS` em `faq-data.ts`), e-mail transacional que **entrega** (Brevo,
domínio autenticado), a fundação de identidade (login) e o ciclo de e-mails da
assinatura (Frente 2 Plano 2). Falta a superfície de suporte e o documento de CRM.

## Escopo do MVP

### A. Suporte / autoatendimento (código)
- **`/suporte`** — página pública: **FAQ** (reusa `FAQ_ITEMS`) + **formulário de
  contato** (e-mail + mensagem). Se logado, associa a mensagem ao `user_id`.
- **`POST /api/suporte`** — valida, grava em `support_messages` e **notifica o
  time por e-mail** (Brevo → `contato@matrizcentral.com.br`). Retorna ok.
- **`support_messages`** (migration `0021`): `id`, `user_id` (nullable), `email`,
  `message`, `status` (default `'aberto'`), `created_at`.

### B. CRM / pós-venda (documento de estratégia)
- **`docs/frentes/suporte-crm/crm.md`** — a **jornada de CRM/pós-venda**:
  onboarding (pós-compra → token/acesso → triagem → primeiro valor), retenção
  (ciclo de e-mails da assinatura, feed/fórum como engajamento), reativação
  (win-back de passe expirado), suporte (SLA simples, do autoatendimento ao
  contato humano), e as métricas por etapa. Artefato de planejamento (não código).

## Fora de escopo (YAGNI / v2)

- Painel admin de tickets, respostas dentro do app, chat ao vivo, base de
  conhecimento rica, automação de CRM (segmentação/scoring), integração com
  ferramenta de CRM externa. MVP = captura + notificação + FAQ + estratégia.

## Decisão técnica

### 1. Dados — migration `0021_support_messages.sql`
```sql
create table if not exists support_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  email text not null,
  message text not null,
  status text not null default 'aberto',
  created_at timestamptz not null default now()
);
create index if not exists support_messages_created_idx on support_messages(created_at desc);
alter table support_messages enable row level security;
```

### 2. Lógica pura — `src/lib/suporte.ts`
- `validateContactInput({ email, message }): { ok: true } | { ok: false; error }`
  — e-mail válido (reusa `isValidEmail`), mensagem 5–5000 chars. pt-BR.
- Testes: e-mail inválido, mensagem curta/longa/ok.

### 3. E-mail + dados
- `email.ts`: `sendSupportNotification({ fromEmail, message })` — avisa o time
  (usa o helper `sendBrevo`; `to: contato@matrizcentral.com.br`).
- `src/lib/support-data.ts`: `createSupportMessage(userId | null, email, message)`.

### 4. Rota — `POST /api/suporte`
- Valida input (400). `getSessionUser()` (opcional → `user_id` se logado). Cria a
  mensagem + `sendSupportNotification` (best-effort; falha de e-mail não derruba o
  registro). Retorna `{ ok: true }`.

### 5. Página `/suporte`
- Server component: FAQ (`FAQ_ITEMS`) + `<ContatoForm>` (client, posta em
  `/api/suporte`, mostra sucesso/erro). Link "Suporte" no header e footer.

## Casos de borda
- Input inválido → 400 pt-BR. E-mail de notificação falha → mensagem ainda gravada
  (best-effort). Deslogado → `user_id` null (usa o e-mail do form).

## Verificação
- Lógica pura (`validateContactInput`) → testes Vitest.
- `tsc` 0 + `npm run test`. Visual: `/suporte` (FAQ + enviar mensagem → sucesso;
  conferir `delivered` no Brevo e a linha em `support_messages`).

## Dependências
`FAQ_ITEMS`, `isValidEmail`, `sendBrevo` (Frente 2 Plano 2), `getSessionUser`.
Migration nova `0021`.
