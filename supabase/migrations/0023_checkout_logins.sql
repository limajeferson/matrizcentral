-- Uso único do auto-login pós-compra: cada session_id da Stripe só pode
-- mintar uma sessão uma vez (impede replay da URL de sucesso).
create table if not exists checkout_logins (
  session_id text primary key,
  user_id uuid not null references users(id),
  consumed_at timestamptz not null default now()
);
alter table checkout_logins enable row level security;
-- Default-deny: acesso só via service role server-side (nenhuma policy criada).
