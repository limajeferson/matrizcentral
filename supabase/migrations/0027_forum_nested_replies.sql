alter table forum_replies add column if not exists parent_reply_id uuid references forum_replies(id);
create index if not exists forum_replies_parent_idx on forum_replies(topic_id, parent_reply_id, created_at);
