create table if not exists content_unlocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  content_id text not null,
  cycle_key text not null,
  unlocked_at timestamptz not null default now(),
  unique (user_id, content_id)
);
create index if not exists content_unlocks_user_idx on content_unlocks(user_id);
alter table content_unlocks enable row level security;
