alter table xp_events drop constraint xp_events_action_type_check;
alter table xp_events add constraint xp_events_action_type_check
  check (action_type in ('compra', 'triagem', 'download', 'validacao', 'conteudo', 'roadmap'));
