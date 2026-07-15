import { describe, it, expect } from "vitest";
import { buildFeedTimeline, postEntries } from "./feed-timeline";
import type { FeedPost } from "./feed-posts";
import type { TopicListItem } from "./forum-data";
import type { FeedCard } from "./feed";

const post = (id: string, at: string): FeedPost => ({
  id, author: "A", body: "b", link_url: null, image_url: null, created_at: at,
});
const thread = (id: string, at: string): TopicListItem => ({
  id, title: "T", author: "A", created_at: at, replyCount: 0,
});
const card = (id: string): FeedCard => ({
  id, title: "C", description: "d", type: "relatorio", href: "/oferta", emBreve: false,
});

describe("buildFeedTimeline", () => {
  it("mescla os 3 tipos e ordena por `at` desc", () => {
    const t = buildFeedTimeline(
      [post("p1", "2026-07-10T00:00:00Z")],
      [thread("t1", "2026-07-14T00:00:00Z")],
      [{ card: card("c1"), at: "2026-07-12T00:00:00Z" }],
    );
    expect(t.map((e) => e.kind)).toEqual(["thread", "content", "post"]);
    expect(t.map((e) => e.at)).toEqual([
      "2026-07-14T00:00:00Z", "2026-07-12T00:00:00Z", "2026-07-10T00:00:00Z",
    ]);
  });

  it("preserva o payload por tipo", () => {
    const [e] = buildFeedTimeline([post("p1", "2026-07-10T00:00:00Z")], [], []);
    expect(e.kind).toBe("post");
    if (e.kind === "post") expect(e.post.id).toBe("p1");
  });

  it("lista vazia → []", () => {
    expect(buildFeedTimeline([], [], [])).toEqual([]);
  });

  it("postEntries mapeia posts para entries kind=post", () => {
    const es = postEntries([post("p1", "2026-07-10T00:00:00Z")]);
    expect(es).toEqual([{ kind: "post", at: "2026-07-10T00:00:00Z", post: post("p1", "2026-07-10T00:00:00Z") }]);
  });
});
