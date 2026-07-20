-- supabase/migrations/0028_reading_progress.sql
-- Leitor protegido: retomada (produto) e livro-razão de consumo (auditoria).

-- Retomada: uma linha por (usuário, conteúdo). Sobrescreve.
create table if not exists reading_progress (
  user_id uuid not null references users(id) on delete cascade,
  content_id text not null,
  section_slug text not null,
  section_index int not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, content_id)
);

-- Auditoria: append-only. É a prova de consumo (garantia comercial + chargeback).
-- NUNCA sofre update/delete.
create table if not exists reading_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  content_id text not null,
  section_slug text not null,
  section_index int not null,
  created_at timestamptz not null default now()
);

create index if not exists reading_events_user_content_idx
  on reading_events (user_id, content_id, created_at desc);

alter table reading_progress enable row level security;
alter table reading_events enable row level security;
-- Sem policies: default-deny. Acesso só via service role (server-side).
