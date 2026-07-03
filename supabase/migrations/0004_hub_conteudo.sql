alter table xp_events drop constraint xp_events_action_type_check;
alter table xp_events add constraint xp_events_action_type_check
  check (action_type in ('compra', 'triagem', 'download', 'validacao', 'conteudo'));

create table if not exists content_completions (
  id uuid primary key default gen_random_uuid(),
  token text not null references tokens(token),
  content_id text not null,
  completed_at timestamptz not null default now(),
  unique (token, content_id)
);

alter table content_completions enable row level security;
-- Default-deny: sem policies, acesso só via service role key (mesmo padrão das demais tabelas).
