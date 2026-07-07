create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table newsletter_subscribers enable row level security;
-- Default-deny: sem policies, acesso só via service role key (mesmo padrão das demais tabelas).
