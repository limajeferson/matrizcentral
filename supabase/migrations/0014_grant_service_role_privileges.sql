-- O role service_role nunca recebeu os GRANTs padrão do Supabase no schema
-- public (migrations 0001-0004 foram aplicadas fora do fluxo padrão de
-- provisionamento). Sem isso, a service_role key falha com "permission
-- denied" mesmo tendo RLS habilitada mas sem policies (o acesso server-side
-- deveria ignorar RLS via privilégio de tabela, não via policy).

grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
