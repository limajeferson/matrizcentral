# Login Real (fundação de identidade) — Design

## Contexto

Hoje o acesso é resolvido **inteiramente pelo token na URL** (`/dashboard/[token]`,
`/quiz/[token]`). O token (nanoid de 10 chars, PK da tabela `tokens`) é um
credencial *portador*: quem tem o link, entra. Tudo é server-side com a
`service_role` (ignora RLS; RLS é default-deny sem policies). A tabela `users`
(`id uuid`, `email unique`, `stripe_customer_id`, `total_xp`) **não tem nenhum
vínculo de autenticação** — não há Supabase Auth, cookie de sessão nem middleware.

Dois problemas decorrem disso:

1. **Sem identidade persistente:** quem perde o e-mail do token fica sem
   caminho de volta ao próprio painel. E não há "quem é essa pessoa" ao longo do
   tempo — pré-requisito de assinatura, feed, fórum, perfil e CRM.
2. **Sem alavanca de conversão por identidade:** não há como mostrar a vitrine
   (preview visual) a um visitante e travar no momento de consumir, oferecendo
   os caminhos "adquirir" e "entrar".

Esta frente entrega a **fundação de identidade**: um login por magic link
(passwordless) **construído em casa** (zero dependência nova, `crypto` nativo do
Node), convivendo com o token atual sem substituí-lo.

## Decisões travadas (do brainstorm)

- **Motor: magic link próprio (portaria caseira), não Supabase Auth.** Zero
  dependência npm nova (honra o "custo zero" do CLAUDE.md); usa `crypto` nativo.
  A identidade continua **só na tabela `users`** já existente, achada por e-mail
  — sem `auth.users`, sem migração de dados. Reabre conscientemente a decisão
  anterior ("Supabase Auth"): trade-off apresentado e escolhido pelo usuário. O
  ônus assumido é manter o código de segurança de sessão nós mesmos (mitigado
  pelo checklist de segurança abaixo). Consequência: seguimos sem `auth.uid()`,
  mantendo `service_role` + gating no código (o padrão atual).
- **Duas chaves convivem:** o **token** continua destrancando o conteúdo já
  pago (atrito-zero pós-compra, não muda). O **login** (cookie de sessão) é a
  identidade que destranca as áreas novas e devolve o aluno ao painel sem o
  e-mail do token.
- **Escopo do login:** alcança **tudo** — depois de logar, o aluno chega ao
  painel de hoje (via `/conta`, que resolve o token nos bastidores) e às áreas
  novas (construídas nas próximas frentes).
- **A "tranca" de preview oferece dois caminhos:** "Adquirir acesso" (→ checkout,
  foco em conversão) + "Já sou aluno? Entrar" (→ magic link).
- **E-mail sem conta na tela de Entrar:** avisar "esse e-mail ainda não tem
  acesso" + botão Adquirir (escolha pró-conversão; aceita revelar existência de
  conta — baixo risco para o produto).
- **Sessão com estado (lista no banco):** tabela `sessions` revogável (resolve
  "revogação em reembolso" do backlog de auditoria); revogar = apagar a linha.

## Decisão técnica

### 1. Banco: migration `0015_login_magic_link.sql` (aditiva)

Duas tabelas novas. A `users` **não muda**.

```sql
create table if not exists magic_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  token_hash text not null,          -- SHA-256 do cartão; nunca o cru
  expires_at timestamptz not null,   -- created_at + 15 min
  used_at timestamptz,               -- nulo até o clique; uso único
  created_at timestamptz not null default now()
);
create index if not exists magic_links_token_hash_idx on magic_links(token_hash);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  token_hash text not null,          -- SHA-256 da carteirinha; nunca a crua
  expires_at timestamptz not null,   -- created_at + 30 dias
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists sessions_token_hash_idx on sessions(token_hash);

alter table magic_links enable row level security;
alter table sessions enable row level security;
-- Default-deny (mesmo padrão do 0001): todo acesso via service_role server-side.
```

### 2. Lógica pura testável: `src/lib/auth-tokens.ts`

Funções sem I/O, testadas com Vitest (mesmo padrão de `tokens.ts`/`levels.ts`).
É aqui que mora o risco de segurança → é aqui que os testes valem ouro.

- `generateAuthSecret(): string` — cartão/carteirinha aleatório de 256 bits
  (`crypto.randomBytes(32)` em base64url). Testes: comprimento, alfabeto,
  unicidade em N chamadas.
- `hashAuthSecret(secret: string): string` — SHA-256 hex (`crypto.createHash`).
  Testes: determinístico, muda com input, formato hex.
- `magicLinkExpiry(from?: Date): Date` — `from + 15 min`.
- `sessionExpiry(from?: Date): Date` — `from + 30 dias`.
- `isExpired(at: string | Date, now?: Date): boolean` — reaproveita o padrão de
  `isTokenExpired`. Testes: passado→true, futuro→false, limite.

> Constantes de janela (15 min, 30 dias, 60s de rate-limit) ficam nomeadas neste
> módulo para teste e reuso.

### 3. Camada de dados: `src/lib/auth-session.ts` (server-side, `service_role`)

Orquestra banco + `auth-tokens.ts`. Não testado por Vitest (faz I/O) — coberto
pela verificação no navegador.

- `requestMagicLink(email): Promise<'sent' | 'no-account'>`
  1. Acha `users` por e-mail. Não existe → retorna `'no-account'` (a UI mostra o
     aviso + Adquirir). **Não cria usuário** (usuário só nasce na compra).
  2. Rate-limit: se há `magic_links` para o `user_id` criado há < 60s → trata
     como `'sent'` sem reenviar (anti-spam).
  3. Gera cartão, grava `token_hash` + `expires_at` (15 min), envia o link
     `${NEXT_PUBLIC_URL}/entrar/verificar?c=<cartão-cru>` via `email.ts`.
  4. Retorna `'sent'`.
- `verifyMagicLink(rawSecret): Promise<{ userId } | null>`
  - Faz `hashAuthSecret`, busca por `token_hash` (índice), valida `used_at is
    null` e não expirado. Válido → marca `used_at = now()` (trava condicional
    para uso único), cria `sessions` (carteirinha), retorna `{ userId }`.
    Qualquer falha → `null`.
- `createSession(userId): Promise<rawSessionSecret>` — gera carteirinha, grava
  hash + `expires_at` (30 dias). Retorna o segredo cru (vai pro cookie).
- `getSessionUser(): Promise<{ id, email } | null>` — **o "porteiro"**. Lê o
  cookie (via `next/headers`), faz hash, busca `sessions` válida (não expirada);
  atualiza `last_seen_at` (renovação deslizante) e retorna o `users`. É a função
  que cada área nova chama para decidir "entra ou mostra a tranca".
- `destroySession(): Promise<void>` — apaga a `sessions` do cookie e limpa o
  cookie (logout). A mesma exclusão de linha serve à revogação em reembolso.

Nome do cookie: `mc_session`. Flags: `httpOnly`, `secure` (prod), `sameSite:
'lax'`, `path: '/'`, `maxAge` = 30 dias.

### 4. Rotas e telas

- **`/entrar`** (`src/app/entrar/page.tsx`) — form com campo de e-mail. Envia
  via **server action** `requestMagicLink`. Estados na tela: "link enviado,
  confira seu e-mail" · "esse e-mail ainda não tem acesso" + botão **Adquirir**
  (→ `/oferta` ou `/checkout`).
- **`/entrar/verificar`** (`route.ts`, GET) — recebe `?c=`, chama
  `verifyMagicLink`. Sucesso → seta cookie e redireciona pra `/conta` (ou pro
  `next` seguro, se houver). Falha → redireciona pra `/entrar?erro=link` com
  mensagem "link inválido ou expirado, peça outro".
- **`/conta`** (`src/app/conta/page.tsx`) — server component protegido por
  `getSessionUser()` (nulo → redireciona pra `/entrar`). Mostra "olá, {email}",
  botão **"ir para meu painel de conteúdo"** (resolve o token mais recente do
  usuário e linka `/dashboard/{token}`) e espaço reservado (assinatura/feed/
  fórum — próximas frentes). Botão **Sair** (server action `destroySession`).
- **Botão de sessão no header** — no header do marketing (`(marketing)`):
  deslogado → "Entrar" (`/entrar`); logado → "Minha conta" (`/conta`). Estado
  lido por `getSessionUser()` no server component do header/layout.

### 5. A "tranca" (gate de preview): `src/components/auth/ContentGate.tsx`

Componente reusável de bloqueio. Recebe o item de conteúdo e renderiza o
cadeado + dois caminhos: **"Adquirir acesso"** (→ checkout) e **"Já sou aluno?
Entrar"** (→ `/entrar?next=<destino>`). **Esta frente entrega o componente**; a
aplicação dele nas superfícies de marketing (quais 2-3 conteúdos, onde) é
afinada depois (ver Fora de escopo). Um ponto de uso mínimo é incluído para
validar o componente ponta a ponta.

### 6. Segurança (checklist da portaria bem-feita)

| Risco | Mitigação |
|---|---|
| Cartão adivinhável | `crypto.randomBytes(32)` (256 bits), base64url |
| Vazamento do banco | Guardar só `token_hash` (SHA-256), nunca o segredo cru |
| Reuso do link | `used_at` (uso único) + `expires_at` 15 min |
| Falsificação por tentativa | Segredo de 256 bits + busca por hash indexado (brute-force/timing inviáveis; sem comparação em app) |
| Roubo da carteirinha | Cookie `httpOnly` + `secure` + `sameSite=lax` |
| Acesso após reembolso/logout | Apagar linha em `sessions` |
| Spam de e-mails de login | Rate-limit 60s por usuário |
| Open redirect no `next` | Só aceitar paths internos (começando com `/`, sem `//`) |

## Casos de borda

- **E-mail com múltiplas compras/tokens:** `/conta` resolve o token da compra
  **mais recente** (`purchases.created_at desc`) — mesma lógica de
  `resendAccessByEmail`.
- **Sessão expirada:** `getSessionUser()` retorna `null`; áreas protegidas
  redirecionam pra `/entrar`. Linha velha em `sessions` fica inerte (limpeza
  pode ser um cron futuro — fora de escopo).
- **Clicar link já usado ou expirado:** `verifyMagicLink` → `null` →
  `/entrar?erro=link`.
- **Usuário sem compra tenta entrar:** `'no-account'` → aviso + Adquirir (não
  cria `users`).
- **Fluxo atual intacto:** compra → token → `/dashboard/{token}` → gamificação →
  certificado continua funcionando sem tocar em nada; login é 100% aditivo.

## Fora de escopo (YAGNI)

- Páginas de assinatura, feed e fórum — próximas frentes; aqui só criamos o
  porteiro (`getSessionUser`) que elas vão chamar.
- Escolha editorial de **quais** 2-3 conteúdos viram isca e **onde** na landing/
  hub — decisão de marketing, afinada depois. Aqui entregamos o componente
  `ContentGate` e um ponto de uso mínimo de validação.
- RLS por `auth.uid()` / policies por usuário — não há `auth.uid()` neste
  desenho; segue `service_role` + gating no código.
- Migração do `/dashboard/[token]` para ser cookie-gated — o token segue como
  está; `/conta` apenas devolve o aluno pra lá.
- Limpeza automática (cron) de `magic_links`/`sessions` expirados.
- Recuperação/troca de e-mail, multi-dispositivo com "sair de todos", 2FA.
