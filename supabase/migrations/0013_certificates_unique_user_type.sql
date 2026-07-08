-- Garante que um usuário não pode ter dois certificados do mesmo tipo,
-- fechando a janela de corrida do padrão select-then-insert em
-- issueCertificateIfEligible (achado de revisão da Task 7).
alter table certificates add constraint certificates_user_id_certificate_type_key
  unique (user_id, certificate_type);
