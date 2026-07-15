"use client";

import { useState } from "react";
import { IconHeart, IconComment, IconShare } from "@/components/ui/icons";
import { relativeTime } from "@/lib/relative-time";
import type { FeedPost } from "@/lib/feed-posts";

export type PostCardProps = {
  post: FeedPost;
};

/** Card de post do feed (modelo post-card): cabeçalho com avatar+autor+data,
 * corpo com texto/link/imagem opcionais, e rodapé com ações (curtir/comentar/
 * compartilhar) — sem persistência nesta etapa. */
export function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const initial = post.author.trim().charAt(0).toUpperCase() || "A";

  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-semibold text-white"
        >
          {initial}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{post.author}</p>
          <p className="text-xs text-muted-foreground">{relativeTime(post.created_at, new Date())}</p>
        </div>
      </div>

      <p className="whitespace-pre-wrap text-sm text-foreground">{post.body}</p>

      {post.link_url && (
        <a
          href={post.link_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block break-all text-sm font-medium text-violet-600 hover:underline"
        >
          {post.link_url}
        </a>
      )}

      {post.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.image_url}
          alt=""
          loading="lazy"
          className="mt-3 max-h-96 w-full rounded-xl object-cover"
        />
      )}

      <div className="mt-3 flex items-center gap-4 border-t border-border pt-3">
        <button
          type="button"
          onClick={() => setLiked((v) => !v)}
          title="Em breve"
          aria-label="Curtir"
          aria-pressed={liked}
          className={
            liked
              ? "flex items-center gap-1.5 text-xs font-medium text-violet-600"
              : "flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-violet-600"
          }
        >
          <IconHeart size={16} />
          {liked ? 1 : 0}
        </button>
        <button
          type="button"
          title="Em breve"
          aria-label="Comentar"
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-violet-600"
        >
          <IconComment size={16} />
          0
        </button>
        <button
          type="button"
          title="Em breve"
          aria-label="Compartilhar"
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-violet-600"
        >
          <IconShare size={16} />
          0
        </button>
      </div>
    </article>
  );
}

export default PostCard;
