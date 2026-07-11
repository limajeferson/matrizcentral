-- Normaliza e-mails existentes para minúsculas/trim, alinhando os dados ao
-- write path (webhook) e read path (login) que já normalizam. Defensivo: só
-- atualiza linhas cuja versão normalizada NÃO colide com outro usuário, para
-- não falhar o apply em caso (improvável) de duplicata. Colisões remanescentes
-- (se houver) ficam para resolução manual.
update users u
set email = lower(trim(u.email))
where u.email <> lower(trim(u.email))
  and not exists (
    select 1 from users u2
    where u2.id <> u.id
      and u2.email = lower(trim(u.email))
  );
