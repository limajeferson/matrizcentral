create table if not exists forum_topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists forum_topics_created_idx on forum_topics(created_at desc);

create table if not exists forum_replies (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references forum_topics(id),
  user_id uuid not null references users(id),
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists forum_replies_topic_idx on forum_replies(topic_id, created_at);

alter table forum_topics enable row level security;
alter table forum_replies enable row level security;
