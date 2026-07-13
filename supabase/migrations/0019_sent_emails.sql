create table if not exists sent_emails (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  email_type text not null,
  reference text not null,
  sent_at timestamptz not null default now(),
  unique (user_id, email_type, reference)
);
create index if not exists sent_emails_user_idx on sent_emails(user_id);
alter table sent_emails enable row level security;
