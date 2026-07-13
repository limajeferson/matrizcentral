import { getSupabaseServerClient } from "@/lib/supabase/server";

export type TopicListItem = { id: string; title: string; author: string; created_at: string; replyCount: number };

export async function listTopics(limit = 50): Promise<TopicListItem[]> {
  const supabase = getSupabaseServerClient();
  const { data: topics } = await supabase
    .from("forum_topics").select("id, title, user_id, created_at")
    .order("created_at", { ascending: false }).limit(limit);
  const rows = topics ?? [];
  if (rows.length === 0) return [];
  const userIds = Array.from(new Set(rows.map((t) => t.user_id)));
  const { data: users } = await supabase.from("users").select("id, display_name").in("id", userIds);
  const nameById = new Map((users ?? []).map((u) => [u.id, u.display_name ?? "Aluno"]));
  const topicIds = rows.map((t) => t.id);
  const { data: replies } = await supabase.from("forum_replies").select("topic_id").in("topic_id", topicIds);
  const counts = new Map<string, number>();
  for (const r of replies ?? []) counts.set(r.topic_id, (counts.get(r.topic_id) ?? 0) + 1);
  return rows.map((t) => ({
    id: t.id, title: t.title, author: nameById.get(t.user_id) ?? "Aluno",
    created_at: t.created_at, replyCount: counts.get(t.id) ?? 0,
  }));
}

export type TopicDetail = {
  id: string; title: string; body: string; author: string; created_at: string;
  replies: { id: string; body: string; author: string; created_at: string }[];
};

export async function getTopicWithReplies(topicId: string): Promise<TopicDetail | null> {
  const supabase = getSupabaseServerClient();
  const { data: topic } = await supabase
    .from("forum_topics").select("id, title, body, user_id, created_at").eq("id", topicId).maybeSingle();
  if (!topic) return null;
  const { data: replies } = await supabase
    .from("forum_replies").select("id, body, user_id, created_at").eq("topic_id", topicId)
    .order("created_at", { ascending: true });
  const userIds = Array.from(new Set([topic.user_id, ...(replies ?? []).map((r) => r.user_id)]));
  const { data: users } = await supabase.from("users").select("id, display_name").in("id", userIds);
  const nameById = new Map((users ?? []).map((u) => [u.id, u.display_name ?? "Aluno"]));
  return {
    id: topic.id, title: topic.title, body: topic.body,
    author: nameById.get(topic.user_id) ?? "Aluno", created_at: topic.created_at,
    replies: (replies ?? []).map((r) => ({
      id: r.id, body: r.body, author: nameById.get(r.user_id) ?? "Aluno", created_at: r.created_at,
    })),
  };
}

export async function createTopic(userId: string, title: string, body: string): Promise<string | null> {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase.from("forum_topics")
    .insert({ user_id: userId, title: title.trim(), body: body.trim() }).select("id").single();
  return data?.id ?? null;
}

export async function createReply(userId: string, topicId: string, body: string): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("forum_replies")
    .insert({ user_id: userId, topic_id: topicId, body: body.trim() });
  return !error;
}
