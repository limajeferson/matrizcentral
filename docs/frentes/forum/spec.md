# Fórum (portal de tópicos) — Design (MVP)

> Decisões tomadas com autonomia autorizada, recomendadas e documentadas aqui.

## Contexto

O produto prevê um **fórum** onde assinantes criam tópicos e trocam insights. A
fundação de identidade (login, Frente 1) e o entitlement (passes, Frente 2) já
existem, com o `ContentGate` para gating. Falta o fórum em si.

## Escopo do MVP (o que ENTRA)

- **Lista de tópicos** (`/forum`): título, autor (`display_name`), data e
  contagem de respostas — **prévia aberta a todos** (conversão). Quem tem passe
  ativo vê o botão "novo tópico".
- **Thread** (`/forum/[id]`): o tópico + respostas + form de resposta. **Ler a
  thread e postar (criar tópico/responder) exige passe ativo** (Regular **ou**
  Advanced — é o espaço de assinante). `view`/Start → `ContentGate` (prévia dos
  títulos + convite a assinar).
- **Escrita** via route handlers protegidos (sessão + passe), com validação de
  entrada (não-vazio, limites de tamanho). Autor = usuário logado.

## Fora de escopo (YAGNI / v2)

- **XP por participação** — deixado para v2 **com anti-abuso** (postar por XP é
  vetor de farming; o backlog de auditoria já cita forja de XP). MVP não dá XP.
- Moderação avançada (denúncia, remoção, ban), edição/exclusão de posts, upvotes,
  markdown rico, notificações — v2.
- Categorias/sub-fóruns — MVP é uma lista única cronológica.

## Decisão técnica

### 1. Dados — migration `0020_forum.sql`

```sql
create table if not exists forum_topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists forum_topics_created_idx on forum_topics(created_at desc);

create table if not exists forum_replies (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references forum_topics(id),
  user_id uuid not null references users(id),
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists forum_replies_topic_idx on forum_replies(topic_id, created_at);

alter table forum_topics enable row level security;
alter table forum_replies enable row level security;
-- Default-deny (padrão 0001): acesso via service_role server-side.
```

### 2. Lógica pura testável — `src/lib/forum.ts`

- `isSubscriber(access: AccessLevel): boolean` — `access === "regular" || "advanced"`.
- `validateTopicInput({ title, body }): { ok: true } | { ok: false; error: string }`
  — título 3–120 chars (trim), body 1–5000. pt-BR nos erros.
- `validateReplyInput({ body }): { ok: true } | { ok: false; error: string }`
  — body 1–5000.
- Testes: subscriber para cada nível; limites (vazio, curto, longo, ok).

### 3. Camada de dados — `src/lib/forum-data.ts` (server, I/O)

- `listTopics(limit=50)` — tópicos recentes + `display_name` do autor + contagem
  de respostas (duas queries, robusto ao `Relationships: []`).
- `getTopicWithReplies(topicId)` — o tópico + suas respostas (com `display_name`).
- `createTopic(userId, title, body)` / `createReply(userId, topicId, body)` —
  inserts (assumem validação já feita na rota).

### 4. Rotas de escrita — `POST /api/forum/topic`, `POST /api/forum/reply`

- Guard: `getSessionUser()` → 401 se deslogado; `getAccessContext` →
  `isSubscriber` → 403 se sem passe. Valida input (lógica pura) → 400. Cria via
  `forum-data`. Retorna o id criado (ou redireciona no client).

### 5. Páginas

- **`/forum` (`src/app/forum/page.tsx`)**, server component: lista via
  `listTopics` (prévia p/ todos). Se `isSubscriber` → mostra `<NovoTopicoForm>`
  (client, posta em `/api/forum/topic`). Senão → `ContentGate` no lugar do form.
- **`/forum/[id]` (`src/app/forum/[id]/page.tsx`)**: se `isSubscriber` → tópico +
  respostas + `<ResponderForm>`; senão → prévia do título + `ContentGate`.
- Link "Fórum" no header (anônimo alcança) e no `/conta`.

## Casos de borda

- **Deslogado / view / Start:** vê a lista (prévia); thread e escrita → gate.
- **Regular e Advanced:** acesso pleno ao fórum (ler + postar).
- **Input inválido:** 400 com mensagem pt-BR; o form mostra o erro.
- **Tópico inexistente:** `notFound()`.
- **Passe expirado:** `resolveAccess` → `view` → gate (perde acesso ao postar).

## Verificação

- Lógica pura (`isSubscriber`, validações) → testes Vitest.
- `tsc` 0 + `npm run test`. Visual: `/forum` e `/forum/[id]` nos estados
  (deslogado/view/subscriber) — criar tópico e responder como subscriber.

## Dependências

Login (✅), entitlement/`ContentGate`/`resolveAccess` (✅), `users.display_name` (✅).
Migration nova `0020`.
