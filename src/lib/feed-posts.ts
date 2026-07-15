import { getSupabaseServerClient } from "@/lib/supabase/server";

export type NewPost = { body: string; link_url: string | null; image_url: string | null };
export type FeedPost = {
  id: string; author: string; body: string;
  link_url: string | null; image_url: string | null; created_at: string;
};

const MAX = 2000;

function safeUrl(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (s.length > 2048) return null; // teto defensivo p/ não persistir URL gigante
  return /^https?:\/\/\S+$/i.test(s) ? s : null;
}

export function parseNewPost(input: unknown): NewPost | null {
  if (!input || typeof input !== "object") return null;
  const o = input as Record<string, unknown>;
  if (typeof o.body !== "string") return null;
  const body = o.body.trim().slice(0, MAX);
  if (body.length === 0) return null;
  return { body, link_url: safeUrl(o.link_url), image_url: safeUrl(o.image_url) };
}

export async function createPost(userId: string, post: NewPost): Promise<FeedPost | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("feed_posts")
    .insert({ user_id: userId, body: post.body, link_url: post.link_url, image_url: post.image_url })
    .select("id, user_id, body, link_url, image_url, created_at").single();
  if (error || !data) return null;
  const { data: u } = await supabase.from("users").select("display_name").eq("id", userId).maybeSingle();
  return {
    id: data.id, author: u?.display_name ?? "Aluno", body: data.body,
    link_url: data.link_url, image_url: data.image_url, created_at: data.created_at,
  };
}

export async function listPosts(limit = 15, before?: string): Promise<FeedPost[]> {
  const supabase = getSupabaseServerClient();
  let q = supabase.from("feed_posts")
    .select("id, user_id, body, link_url, image_url, created_at")
    .order("created_at", { ascending: false }).limit(limit);
  if (before) q = q.lt("created_at", before);
  const { data: rows } = await q;
  const list = rows ?? [];
  if (list.length === 0) return [];
  const ids = Array.from(new Set(list.map((r) => r.user_id)));
  const { data: users } = await supabase.from("users").select("id, display_name").in("id", ids);
  const nameById = new Map((users ?? []).map((u) => [u.id, u.display_name ?? "Aluno"]));
  return list.map((r) => ({
    id: r.id, author: nameById.get(r.user_id) ?? "Aluno", body: r.body,
    link_url: r.link_url, image_url: r.image_url, created_at: r.created_at,
  }));
}
