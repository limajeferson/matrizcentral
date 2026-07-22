export type FlatReply = { id: string; body: string; author: string; created_at: string; parent_reply_id: string | null };
export type ReplyNode = FlatReply & { children: ReplyNode[]; depth: number };

export function buildReplyTree(replies: FlatReply[]): ReplyNode[] {
  const byId = new Map<string, ReplyNode>();
  for (const r of replies) byId.set(r.id, { ...r, children: [], depth: 0 });
  const roots: ReplyNode[] = [];
  const sorted = Array.from(byId.values()).sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
  for (const node of sorted) {
    const parent = node.parent_reply_id ? byId.get(node.parent_reply_id) : undefined;
    if (parent) { node.depth = parent.depth + 1; parent.children.push(node); }
    else roots.push(node);
  }
  return roots;
}
