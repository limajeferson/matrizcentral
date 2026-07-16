-- 1) Dedup dos existentes (mantém o mais antigo por chave), só reference_id não-nulo
delete from xp_events a
using xp_events b
where a.user_id = b.user_id
  and a.action_type = b.action_type
  and a.reference_id = b.reference_id
  and a.reference_id is not null
  and a.created_at > b.created_at;

-- 2) Reconciliar total_xp a partir do ledger deduplicado
update users u
set total_xp = coalesce((select sum(xp_amount) from xp_events e where e.user_id = u.id), 0);

-- 3) Constraint de unicidade (NULLs em reference_id continuam distintos)
create unique index if not exists xp_events_dedup_idx
  on xp_events (user_id, action_type, reference_id);
