create table if not exists roadmap_progress (
  token text not null references tokens(token),
  stage_key text not null,
  completed_at timestamptz not null default now(),
  primary key (token, stage_key)
);
