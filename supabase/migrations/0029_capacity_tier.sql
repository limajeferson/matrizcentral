-- 0029: eixo de capacidade (segmentacao de publico).
-- Texto validado em codigo como CapacityTier (mesmo padrao do profile_id/0022).
-- NULL = usuario ainda nao respondeu as perguntas de capacidade (gate de UX
-- para a versao mini do diagnostico).
alter table users add column if not exists capacity_tier text;
