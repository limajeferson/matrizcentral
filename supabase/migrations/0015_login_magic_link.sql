-- Login real: magic link próprio (portaria caseira). Aditivo — não toca users.
create table if not exists magic_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  token_hash text not null,          -- SHA-256 do segredo; nunca o cru
  expires_at timestamptz not null,   -- criado_em + 15 min
  used_at timestamptz,               -- nulo até o clique; uso único
  created_at timestamptz not null default now()
);
create index if not exists magic_links_token_hash_idx on magic_links(token_hash);
create index if not exists magic_links_user_id_idx on magic_links(user_id);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  token_hash text not null,          -- SHA-256 da carteirinha; nunca a crua
  expires_at timestamptz not null,   -- criado_em + 30 dias
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists sessions_token_hash_idx on sessions(token_hash);

alter table magic_links enable row level security;
alter table sessions enable row level security;
-- Default-deny (mesmo padrão do 0001): todo acesso via service_role server-side.
