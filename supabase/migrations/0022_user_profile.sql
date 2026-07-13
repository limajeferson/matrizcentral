-- Diagnóstico por sessão: o perfil passa a viver na conta (users), não no token.
-- profile_id é TEXTO validado em código (ProfileId), sem FK — desacopla a
-- escrita da semeadura de `profiles` e evita o bug de update rejeitado.
alter table users add column if not exists profile_id text;
alter table users add column if not exists diagnosed_at timestamptz;

-- Backfill idempotente: quem já tem token triado herda o perfil para a conta.
update users u
set profile_id = t.profile_id,
    diagnosed_at = coalesce(t.triaged_at, now())
from tokens t
join purchases p on p.id = t.purchase_id
where p.user_id = u.id
  and t.triaged = true
  and t.profile_id is not null
  and u.profile_id is null;
