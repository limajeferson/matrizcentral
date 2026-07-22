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
