alter table roadmap_progress enable row level security;
-- Default-deny: nenhuma policy é criada para anon/authenticated.
-- Todo acesso passa por código server-side com a service role key,
-- que ignora RLS por design (ver spec, seção "Acesso e segurança").
