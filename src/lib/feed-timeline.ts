import type { FeedPost } from "@/lib/feed-posts";
import type { TopicListItem } from "@/lib/forum-data";
import type { FeedCard } from "@/lib/feed";

/** Item unificado do feed (timeline). `at` é o timestamp ISO usado para ordenar. */
export type FeedEntry =
  | { kind: "post"; at: string; post: FeedPost }
  | { kind: "thread"; at: string; thread: TopicListItem }
  | { kind: "content"; at: string; card: FeedCard };

/** Converte posts em entries (usado na paginação, que traz só posts). */
export function postEntries(posts: FeedPost[]): FeedEntry[] {
  return posts.map((post) => ({ kind: "post", at: post.created_at, post }));
}

/**
 * Unifica posts, threads e conteúdo (com data) num timeline ordenado do mais
 * novo para o mais antigo. `at` ISO compara lexicograficamente = cronológico.
 */
export function buildFeedTimeline(
  posts: FeedPost[],
  threads: TopicListItem[],
  contents: { card: FeedCard; at: string }[],
): FeedEntry[] {
  const entries: FeedEntry[] = [
    ...postEntries(posts),
    ...threads.map((thread) => ({ kind: "thread" as const, at: thread.created_at, thread })),
    ...contents.map(({ card, at }) => ({ kind: "content" as const, at, card })),
  ];
  return entries.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
}
