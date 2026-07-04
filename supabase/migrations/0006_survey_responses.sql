create table if not exists survey_responses (
  id uuid primary key default gen_random_uuid(),
  token text not null references tokens(token),
  survey_id text not null,
  option_id text not null,
  created_at timestamptz not null default now(),
  unique (token, survey_id)
);

alter table survey_responses enable row level security;
-- Default-deny: sem policies, acesso só via service role key (mesmo padrão das demais tabelas).
