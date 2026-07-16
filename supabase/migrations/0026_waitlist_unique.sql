-- Dedup existentes e adiciona unicidade (email, plan_id) no waitlist
delete from plan_waitlist a using plan_waitlist b
where a.email = b.email and a.plan_id = b.plan_id and a.created_at > b.created_at;
create unique index if not exists plan_waitlist_email_plan_idx
  on plan_waitlist (email, plan_id);
