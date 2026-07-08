-- Fundação da gamificação avançada: mantém users.total_xp em sincronia via
-- trigger (hoje a coluna existe mas nunca é incrementada), faz o backfill do
-- que já foi acumulado em xp_events, e cria as tabelas de badges, certificado,
-- leaderboard (opt-in) e desafios.

update users set total_xp = coalesce(
  (select sum(xp_amount) from xp_events where xp_events.user_id = users.id),
  0
);

create or replace function sync_users_total_xp()
returns trigger as $$
begin
  update users set total_xp = total_xp + new.xp_amount where id = new.user_id;
  return new;
end;
$$ language plpgsql;

drop trigger if exists xp_events_sync_total_xp on xp_events;
create trigger xp_events_sync_total_xp
after insert on xp_events
for each row
execute function sync_users_total_xp();

alter table xp_events drop constraint xp_events_action_type_check;
alter table xp_events add constraint xp_events_action_type_check
  check (action_type in ('compra', 'triagem', 'download', 'validacao', 'conteudo', 'roadmap', 'desafio'));

alter table users add column if not exists display_name text;
alter table users add column if not exists leaderboard_opt_in boolean not null default false;

create table if not exists badges_earned (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  badge_id text not null,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_id)
);

alter table badges_earned enable row level security;

create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  certificate_type text not null,
  reference_id text not null,
  title text not null,
  issued_at timestamptz not null default now(),
  verification_code text not null unique
);

alter table certificates enable row level security;

create table if not exists challenge_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  week_key text not null,
  challenge_id text not null,
  claimed_at timestamptz not null default now(),
  unique (user_id, week_key)
);

alter table challenge_claims enable row level security;
-- Default-deny: sem policies novas, acesso só via service role key (mesmo padrão das demais tabelas).
