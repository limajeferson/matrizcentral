create table if not exists feed_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  body text not null,
  link_url text,
  image_url text,
  created_at timestamptz not null default now()
);
create index if not exists feed_posts_created_idx on feed_posts(created_at desc);
alter table feed_posts enable row level security;
