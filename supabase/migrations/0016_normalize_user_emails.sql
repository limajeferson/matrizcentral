-- Normaliza e-mails existentes para minúsculas/trim, alinhando os dados ao
-- write path (webhook) e read path (login) que já normalizam. Defensivo: só
-- atualiza uma linha se a forma NORMALIZADA dela for única na tabela — a
-- subquery compara normalizado-com-normalizado, então duas linhas que colidem
-- ENTRE SI após normalizar (ex.: 'Foo@X.com' e 'FOO@x.com') excluem uma à
-- outra e nenhuma é atualizada, evitando violar o unique e falhar o apply.
-- Colisões remanescentes (se houver) ficam para resolução manual.
update users u
set email = lower(trim(u.email))
where u.email <> lower(trim(u.email))
  and not exists (
    select 1 from users u2
    where u2.id <> u.id
      and lower(trim(u2.email)) = lower(trim(u.email))
  );
