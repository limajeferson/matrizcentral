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
