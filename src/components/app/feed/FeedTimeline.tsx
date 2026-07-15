"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { IconForum, IconLock } from "@/components/ui/icons";
import { CONTENT_ICON } from "@/lib/content-icons";
import { PostCard } from "./PostCard";
import type { FeedEntry } from "@/lib/feed-timeline";
import type { FeedPost } from "@/lib/feed-posts";
import type { FeedCard } from "@/lib/feed";
import type { TopicListItem } from "@/lib/forum-data";
import type { ContentType } from "@/data/content-hub";

export type FeedTimelineProps = {
  initial: FeedEntry[];
  initialCursor: string | null;
  /** Logado pode publicar (mostra o composer). */
  canPost: boolean;
  /** Assinante pode abrir threads do fórum (link ativo). */
  canOpenThreads: boolean;
};

const TYPE_LABEL: Record<ContentType, string> = {
  relatorio: "Relatório",
  podcast: "Podcast",
  video: "Vídeo",
  pesquisa: "Pesquisa",
};

function entryKey(entry: FeedEntry): string {
  if (entry.kind === "post") return `p-${entry.post.id}`;
  if (entry.kind === "thread") return `t-${entry.thread.id}`;
  return `c-${entry.card.id}`;
}

function ContentEntryCard({ card }: { card: FeedCard }) {
  const Icon = CONTENT_ICON[card.type];
  // buildContentFeed manda para "/oferta" quando não há token — proxy de "gated".
  const locked = !card.emBreve && card.href === "/oferta";
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Icon size={14} />
          {TYPE_LABEL[card.type]}
        </span>
        {card.emBreve && (
          <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-600">Em breve</span>
        )}
      </div>
      <Link href={card.href} className="text-sm font-semibold text-foreground hover:text-violet-600">
        {card.title}
      </Link>
      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{card.description}</p>
      {locked && (
        <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-violet-600">
          <IconLock size={12} /> Assine para acessar
        </span>
      )}
    </div>
  );
}

function ThreadEntryCard({ thread, clickable }: { thread: TopicListItem; clickable: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <IconForum size={14} />
        Fórum
      </div>
      {clickable ? (
        <Link href={`/forum/${thread.id}`} className="text-sm font-semibold text-foreground hover:text-violet-600">
          {thread.title}
        </Link>
      ) : (
        <span className="text-sm font-semibold text-foreground">{thread.title}</span>
      )}
      <p className="mt-1 text-xs text-muted-foreground">
        por {thread.author} · {thread.replyCount} resposta(s)
      </p>
    </div>
  );
}

function EntryCard({ entry, canOpenThreads }: { entry: FeedEntry; canOpenThreads: boolean }) {
  if (entry.kind === "post") return <PostCard post={entry.post} />;
  if (entry.kind === "thread") return <ThreadEntryCard thread={entry.thread} clickable={canOpenThreads} />;
  return <ContentEntryCard card={entry.card} />;
}

/**
 * Timeline do feed (modelo modern-timeline): itens entram com animação staggered
 * (framer-motion `whileInView`) e a lista revela mais posts ao rolar
 * (IntersectionObserver, sem lib). Logado vê um composer de novo post no topo.
 */
export function FeedTimeline({ initial, initialCursor, canPost, canOpenThreads }: FeedTimelineProps) {
  const [entries, setEntries] = useState<FeedEntry[]>(initial);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loading, setLoading] = useState(false);
  const done = cursor === null;
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || cursor === null) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/feed/page?before=${encodeURIComponent(cursor)}`);
      if (res.ok) {
        const data = (await res.json()) as { entries: FeedEntry[]; nextCursor: string | null };
        setEntries((prev) => [...prev, ...data.entries]);
        setCursor(data.nextCursor);
      } else {
        setCursor(null);
      }
    } catch {
      setCursor(null);
    } finally {
      setLoading(false);
    }
  }, [loading, cursor]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || done) return;
    const obs = new IntersectionObserver(
      (es) => {
        if (es[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "200px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore, done]);

  // Composer de novo post (logados).
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const submit = async () => {
    const text = body.trim();
    if (!text || posting) return;
    setPosting(true);
    try {
      const res = await fetch("/api/feed/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      if (res.ok) {
        const { post } = (await res.json()) as { post: FeedPost };
        setEntries((prev) => [{ kind: "post", at: post.created_at, post }, ...prev]);
        setBody("");
      }
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="space-y-3">
      {canPost && (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            maxLength={2000}
            aria-label="Novo post"
            placeholder="Compartilhe algo com a comunidade..."
            className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-violet-500 focus:outline-none"
          />
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={submit}
              disabled={!body.trim() || posting}
              className="rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
            >
              {posting ? "Publicando..." : "Publicar"}
            </button>
          </div>
        </div>
      )}

      {entries.map((entry) => (
        <motion.div
          key={entryKey(entry)}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.3 }}
        >
          <EntryCard entry={entry} canOpenThreads={canOpenThreads} />
        </motion.div>
      ))}

      {entries.length === 0 && (
        <p className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Ainda não há novidades por aqui.
        </p>
      )}

      {!done && <div ref={sentinelRef} className="h-8" />}
      {loading && <p className="text-center text-xs text-muted-foreground">Carregando…</p>}
    </div>
  );
}

export default FeedTimeline;
