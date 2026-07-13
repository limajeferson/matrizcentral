create table if not exists entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  plan text not null check (plan in ('regular','advanced')),
  starts_at timestamptz not null default now(),
  expires_at timestamptz not null,
  stripe_payment_id text unique,
  created_at timestamptz not null default now()
);
create index if not exists entitlements_user_id_idx on entitlements(user_id);
alter table entitlements enable row level security;
