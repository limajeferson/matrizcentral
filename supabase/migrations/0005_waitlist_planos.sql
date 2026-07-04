create table if not exists plan_waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  plan_id text not null check (plan_id in ('mensal_97', 'anual_497')),
  created_at timestamptz not null default now()
);

alter table plan_waitlist enable row level security;
-- Default-deny: sem policies, acesso só via service role key (mesmo padrão das demais tabelas).
