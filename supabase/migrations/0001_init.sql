create extension if not exists pgcrypto;

create table if not exists profiles (
  id text primary key,
  name text not null,
  description text not null,
  recommended_ebooks jsonb not null default '[]'::jsonb,
  study_roadmap jsonb not null default '{}'::jsonb
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  stripe_customer_id text,
  total_xp integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  product_id text not null,
  price_cents integer not null,
  status text not null default 'pending',
  stripe_payment_id text unique,
  downloaded boolean not null default false,
  refund_window_expires timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists tokens (
  token text primary key,
  purchase_id uuid not null references purchases(id),
  profile_id text references profiles(id),
  triaged boolean not null default false,
  triaged_at timestamptz,
  valid_until timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists quiz_responses (
  id uuid primary key default gen_random_uuid(),
  token text not null references tokens(token),
  quiz_type text not null check (quiz_type in ('triagem', 'validacao')),
  question_id integer not null,
  answer text not null,
  is_correct boolean,
  created_at timestamptz not null default now()
);

create table if not exists xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  xp_amount integer not null,
  action_type text not null check (action_type in ('compra', 'triagem', 'download', 'validacao')),
  reference_id text,
  created_at timestamptz not null default now()
);

alter table users enable row level security;
alter table purchases enable row level security;
alter table tokens enable row level security;
alter table quiz_responses enable row level security;
alter table profiles enable row level security;
alter table xp_events enable row level security;
-- Default-deny: nenhuma policy é criada para anon/authenticated.
-- Todo acesso passa por código server-side com a service role key,
-- que ignora RLS por design (ver spec, seção "Acesso e segurança").
