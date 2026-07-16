# Trilha D (Fórum — design v2 Frente 5) — Plano de Implementação

> REQUIRED SUB-SKILL: superpowers:subagent-driven-development.
> Spec: [`spec-D-forum.md`](spec-D-forum.md). **Um commit por item.** Vem depois
> da Trilha C (base theme-aware).

**Goal:** Respostas aninhadas (reddit-style) + apresentação de pergunta
(stack-overflow-style) no fórum.

**Architecture:** Migration aditiva `parent_reply_id`; árvore montada por helper
puro `buildReplyTree`; render recursivo `ReplyThread`; `ResponderForm` ganha
`parentReplyId`. Sem XP (fórum não tem XP → não toca a dedup da Trilha B).

## Global Constraints (verbatim)
- Custo zero (framer-motion/Tailwind/ícones caseiros). Violeta acento, nunca rosa.
  Dark-aware (tokens). pt-BR. Commit por item. Gate: `tsc` 0 + `test` + `lint`.
  Migration 0027 aplicada no remoto (SQL Editor) com o bloco do lançamento.

---

### Task D1 — Backend das respostas aninhadas
**Files:** Create `supabase/migrations/0027_forum_nested_replies.sql`; Create
`src/lib/forum-tree.ts` + `src/lib/forum-tree.test.ts`; Modify `src/lib/forum-data.ts`,
`src/lib/forum.ts`, `src/app/api/forum/reply/route.ts`.

**Interfaces (produz):**
```ts
export type FlatReply = { id: string; body: string; author: string; created_at: string; parent_reply_id: string | null };
export type ReplyNode = FlatReply & { children: ReplyNode[]; depth: number };
export function buildReplyTree(replies: FlatReply[]): ReplyNode[];
```

- [ ] **Step 1: Migration** `0027_forum_nested_replies.sql`:
```sql
alter table forum_replies add column if not exists parent_reply_id uuid references forum_replies(id);
create index if not exists forum_replies_parent_idx on forum_replies(topic_id, parent_reply_id, created_at);
```
- [ ] **Step 2: Teste puro (falha)** — `forum-tree.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { buildReplyTree } from "./forum-tree";
const r = (id: string, parent: string | null, at: string) =>
  ({ id, body: "b", author: "A", created_at: at, parent_reply_id: parent });
describe("buildReplyTree", () => {
  it("monta raiz→filhos, ordena por created_at, atribui depth", () => {
    const tree = buildReplyTree([
      r("a", null, "2026-01-01"), r("b", "a", "2026-01-03"), r("c", "a", "2026-01-02"), r("d", null, "2026-01-04"),
    ]);
    expect(tree.map((n) => n.id)).toEqual(["a", "d"]);
    expect(tree[0].depth).toBe(0);
    expect(tree[0].children.map((n) => n.id)).toEqual(["c", "b"]); // ordena por data
    expect(tree[0].children[0].depth).toBe(1);
  });
  it("pai órfão (parent inexistente) vira raiz", () => {
    const tree = buildReplyTree([r("x", "nope", "2026-01-01")]);
    expect(tree.map((n) => n.id)).toEqual(["x"]);
  });
});
```
- [ ] **Step 3: Implementar `forum-tree.ts`:**
```ts
export type FlatReply = { id: string; body: string; author: string; created_at: string; parent_reply_id: string | null };
export type ReplyNode = FlatReply & { children: ReplyNode[]; depth: number };

export function buildReplyTree(replies: FlatReply[]): ReplyNode[] {
  const byId = new Map<string, ReplyNode>();
  for (const r of replies) byId.set(r.id, { ...r, children: [], depth: 0 });
  const roots: ReplyNode[] = [];
  const sorted = [...byId.values()].sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
  for (const node of sorted) {
    const parent = node.parent_reply_id ? byId.get(node.parent_reply_id) : undefined;
    if (parent) { node.depth = parent.depth + 1; parent.children.push(node); }
    else roots.push(node);
  }
  return roots;
}
```
- [ ] **Step 4: Rodar/ver passar.**
- [ ] **Step 5:** `forum-data.ts`: `getTopicWithReplies` seleciona `parent_reply_id`;
  `TopicDetail.replies: FlatReply[]`. `createReply(userId, topicId, body,
  parentReplyId?)` → insert com `parent_reply_id: parentReplyId ?? null`.
  `forum.ts`: `validateReplyInput({ body, parentReplyId? })` (parentReplyId, se
  presente, string não-vazia). `reply/route.ts`: aceitar `parentReplyId` do body.
- [ ] **Step 6: Gate + Commit** `feat(forum): respostas aninhadas (parent_reply_id + buildReplyTree)`.

### Task D2 — `ReplyThread` recursivo (reddit-nested-thread)
**Files:** Create `src/components/forum/ReplyThread.tsx`; Modify
`src/components/forum/ResponderForm.tsx`.
- [ ] **`ResponderForm`:** adicionar prop `parentReplyId?: string`; incluir no POST
  (`{ topicId, body, parentReplyId }`). Manter o form raiz (sem parentReplyId).
- [ ] **`ReplyThread` (client):** props `{ nodes: ReplyNode[]; topicId: string }`.
  Render recursivo: cada nó = card theme-aware com autor + `relativeTime(created_at)`
  + corpo + botão **"Responder"** (`aria-label`) que abre um `ResponderForm` inline
  com `parentReplyId={node.id}`. Indentação por `depth` (linha guia à esquerda,
  `ml-4`/`border-l`); **cap visual em depth 5** (parar de indentar além). Renderiza
  `node.children` recursivamente. Dark-aware, violeta.
- [ ] **Gate + Commit** `feat(forum): thread recursiva com responder inline (nested)`.

### Task D3 — Pergunta stack-overflow + montagem
**Files:** Modify `src/app/forum/[id]/page.tsx`, `src/app/forum/page.tsx`.
- [ ] `forum/[id]/page.tsx`: layout Q&A — pergunta em destaque no topo (título,
  meta autor·data, corpo em card theme-aware), "N respostas", e
  `<ReplyThread nodes={buildReplyTree(topic.replies)} topicId={topic.id} />` no
  lugar do `.map()` flat. Manter o gating a subscriber (`ContentGate`).
- [ ] `forum/page.tsx`: lista de tópicos como cards (título, autor, contagem,
  tempo) — sem votos. Reusar ícones/identidade.
- [ ] **Gate + verificar ao vivo** (subscriber logado): criar tópico → responder →
  responder a uma resposta → aninhamento indentado; migração aditiva (respostas
  antigas como raiz). Commit `feat(forum): apresentacao Q&A (pergunta em destaque) + montagem`.

## Self-Review
- Cobertura: backend+árvore (D1); UI recursiva (D2); apresentação (D3). Puro
  testado: `buildReplyTree`. Migration 0027 aditiva. Sem XP.
- Consistência: `FlatReply`/`ReplyNode` (D1) consumidos por `ReplyThread` (D2) e a
  página (D3); `ResponderForm.parentReplyId` alinhado com o insert.
