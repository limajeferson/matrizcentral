# Spec — Trilha D: Fórum (design v2 Frente 5)

> Programa: [`README.md`](README.md). Última frente do programa design v2:
> pergunta estilo **stack-overflow-q-a** + respostas **aninhadas** estilo
> **reddit-nested-thread**. Herda as Global Constraints do design v2 (custo zero,
> framer-motion/Tailwind/ícones caseiros, violeta `#7c5cff`, dark-aware, pt-BR,
> commit por item). **Depende da Trilha C (dark-aware)** ter passado antes, pra a
> nova UI nascer theme-aware.

## Estado atual (mapeado 2026-07-16)

- `forum_replies` é **plano**: `id, topic_id, user_id, body, created_at`. **Sem
  `parent_reply_id`.** Índice `(topic_id, created_at)`. RLS on, sem policies
  (acesso via app: sessão + `isSubscriber`). Última migration: **0025** (mais
  0026 waitlist reservada na Trilha B → esta é a **0027**).
- `forum-data.ts`: `getTopicWithReplies(topicId)` busca replies **flat**, ordem
  `created_at` asc; `TopicDetail.replies` = `{id, body, author, created_at}[]`.
  `createReply(userId, topicId, body)` insere `user_id, topic_id, body`.
- `forum.ts`: `validateReplyInput({ body })` (sem `parentReplyId`). Puro, testado.
- `/forum/[id]/page.tsx`: renderiza as respostas num **`.map()` flat**, sem
  indentação nem "responder a esta resposta". `ResponderForm` (props `{topicId}`)
  no rodapé, único.
- **Sem XP no fórum** (anti-farming) → não toca a dedup de XP da Trilha B.

## Item D1 — Respostas aninhadas (backend + árvore pura)

- **Migration `0027_forum_nested_replies.sql`:**
  ```sql
  alter table forum_replies add column if not exists parent_reply_id uuid references forum_replies(id);
  create index if not exists forum_replies_parent_idx on forum_replies(topic_id, parent_reply_id, created_at);
  ```
  Aditiva; respostas atuais ficam `parent_reply_id = null` (raiz).
- **`src/lib/forum-tree.ts` (puro, testável):**
  ```ts
  export type FlatReply = { id: string; body: string; author: string; created_at: string; parent_reply_id: string | null };
  export type ReplyNode = FlatReply & { children: ReplyNode[]; depth: number };
  export function buildReplyTree(replies: FlatReply[]): ReplyNode[];
  ```
  Agrupa por `parent_reply_id`, ordena irmãos por `created_at` asc, atribui
  `depth` (0 na raiz). Pais órfãos (parent inexistente) caem como raiz (defensivo).
- **`forum-data.ts`:** `getTopicWithReplies` passa a selecionar `parent_reply_id`;
  `TopicDetail.replies` vira `FlatReply[]` (o tree é montado na página/componente
  via `buildReplyTree`). `createReply(userId, topicId, body, parentReplyId?)` →
  insert com `parent_reply_id: parentReplyId ?? null`.
- **`forum.ts`:** `validateReplyInput({ body, parentReplyId? })` — `parentReplyId`
  opcional; se presente, precisa ser string não-vazia (o vínculo real ao tópico é
  garantido no server ao inserir; validação de formato aqui).
- **`/api/forum/reply/route.ts`:** aceitar `parentReplyId` opcional do body, passar
  a `createReply`. Gating (sessão + subscriber) intocado.

## Item D2 — Thread aninhada (reddit-nested-thread, UI)

- **`src/components/forum/ReplyThread.tsx` (client):** recebe
  `nodes: ReplyNode[]` + `topicId`. Render **recursivo** com **indentação por
  `depth`** (linha guia à esquerda, estilo Reddit); cada nó mostra autor, tempo
  relativo (`relativeTime`), corpo, e um botão **"Responder"** que abre um
  `ResponderForm` inline com `parentReplyId = node.id`.
- **Cap de profundidade visual:** indentar até ~`depth 5`; além disso, manter o
  aninhamento lógico mas parar de indentar (não estourar no mobile). Colapsar/
  expandir subárvore (opcional, framer-motion) — nice-to-have, não bloqueia.
- **`ResponderForm`:** ganha prop opcional `parentReplyId?: string`; inclui no
  POST (`{ topicId, body, parentReplyId }`). O form raiz (responder ao tópico)
  segue no rodapé com `parentReplyId` ausente.
- A11y: botões "Responder" com `aria-label`; teclado. Dark-aware (tokens).

## Item D3 — Pergunta estilo stack-overflow (apresentação)

- **`/forum/[id]/page.tsx`:** reorganizar como Q&A: bloco da **pergunta** em
  destaque no topo (título grande, meta autor·data, corpo em `GlassCard`/card
  theme-aware), contador "N respostas", e a seção de respostas usando
  `ReplyThread`. Manter o gating a subscriber (senão `ContentGate`).
- **`/forum/page.tsx`:** lista de tópicos com um tratamento mais rico (card por
  pergunta: título, autor, contagem de respostas, tempo) — sem votos (não há no
  MVP; não inventar métrica). Reusar identidade/ícones do app.
- Sem migration extra; só apresentação.

## Não-objetivos / diferido

- Votos/reputação (não existem no modelo; fora do MVP). XP no fórum (anti-farming).
- Policies RLS novas (segue o padrão app-enforced; não introduzir agora).
- Colapsar subárvore é nice-to-have.

## Verificação

- Gate: `tsc` 0 + `npm run test` (novo: `buildReplyTree` — raiz/filhos/ordem/
  depth/órfão) + `next lint`. Migration 0027 aplicada no remoto (SQL Editor) —
  aplicar junto do bloco de migrations do lançamento.
- App (subscriber logado): criar tópico → responder → **responder a uma
  resposta** → ver o aninhamento indentado; ordem cronológica por nível; dark-aware.
- Migração aditiva confirmada: respostas antigas aparecem como raiz.
