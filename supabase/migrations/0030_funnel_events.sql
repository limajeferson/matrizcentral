-- Funil próprio (custo zero, sem dependência de terceiro).
-- SEM PII: anon_id é um identificador opaco de cookie first-party; user_id só
-- é preenchido quando já existe sessão. Nunca gravar e-mail nem URL com token.
create table if not exists funnel_events (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  anon_id text not null,
  user_id uuid references users(id) on delete set null,
  path text,
  referrer text,
  meta jsonb,
  created_at timestamptz not null default now()
);

create index if not exists funnel_events_event_created_idx
  on funnel_events (event, created_at desc);
create index if not exists funnel_events_anon_idx
  on funnel_events (anon_id, created_at desc);

-- RLS ligada e SEM policy: só o service role (que a ignora) escreve e lê.
-- O cliente nunca fala com esta tabela direto — sempre por POST /api/track.
alter table funnel_events enable row level security;
