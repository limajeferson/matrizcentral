import Link from "next/link";
import { IconForum, IconLock } from "@/components/ui/icons";
import { CONTENT_ICON } from "@/lib/content-icons";
import { isSubscriber } from "@/lib/forum";
import type { AccessLevel } from "@/lib/entitlements";
import type { FeedCard } from "@/lib/feed";
import type { ContentType } from "@/data/content-hub";
import type { TopicListItem } from "@/lib/forum-data";

export type CenterColumnProps = {
  /** Cards de conteúdo do hub (já resolvidos por `buildContentFeed`). */
  cards: FeedCard[];
  /** Threads recentes do fórum (`listTopics`). */
  threads: TopicListItem[];
  /** Nível de acesso do usuário — controla se as threads do fórum têm link. */
  access: AccessLevel;
};

const TYPE_LABEL: Record<ContentType, string> = {
  relatorio: "Relatório",
  podcast: "Podcast",
  video: "Vídeo",
  pesquisa: "Pesquisa",
};

type MixedItem =
  | { kind: "content"; key: string; card: FeedCard }
  | { kind: "thread"; key: string; thread: TopicListItem };

/** Intercala cards de conteúdo com threads do fórum, alternando as fontes. */
function mixFeed(cards: FeedCard[], threads: TopicListItem[]): MixedItem[] {
  const items: MixedItem[] = [];
  const max = Math.max(cards.length, threads.length);
  for (let i = 0; i < max; i++) {
    if (cards[i]) items.push({ kind: "content", key: `c-${cards[i].id}`, card: cards[i] });
    if (threads[i]) items.push({ kind: "thread", key: `t-${threads[i].id}`, thread: threads[i] });
  }
  return items;
}

function RailCard({ card }: { card: FeedCard }) {
  const Icon = CONTENT_ICON[card.type];
  return (
    <article className="w-64 shrink-0 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Icon size={16} />
          {TYPE_LABEL[card.type]}
        </span>
        <span
          className={
            card.emBreve
              ? "shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600"
              : "shrink-0 rounded-full bg-violet-600/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-600"
          }
        >
          {card.emBreve ? "Em breve" : "Novo"}
        </span>
      </div>
      <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-foreground">{card.title}</h3>
      <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">{card.description}</p>
      {card.emBreve ? (
        <span className="text-xs font-medium text-muted-foreground">Em breve</span>
      ) : (
        <Link href={card.href} className="text-xs font-semibold text-violet-600 hover:underline">
          Acessar →
        </Link>
      )}
    </article>
  );
}

function ContentListItem({ card }: { card: FeedCard }) {
  const Icon = CONTENT_ICON[card.type];
  // buildContentFeed manda para "/oferta" quando não há token de compra —
  // é o proxy existente para "gated": sem compra, sem acesso ao conteúdo.
  const locked = !card.emBreve && card.href === "/oferta";
  return (
    <li className="rounded-2xl border border-border bg-card p-4 shadow-sm">
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
    </li>
  );
}

function ThreadListItem({ thread, clickable }: { thread: TopicListItem; clickable: boolean }) {
  return (
    <li className="rounded-2xl border border-border bg-card p-4 shadow-sm">
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
    </li>
  );
}

/**
 * Rail horizontal "Comece por aqui" (cards do hub com selo NOVO/em breve) +
 * lista "Do hub e da comunidade" (conteúdo intercalado com threads recentes
 * do fórum). `id="conteudos"` é o alvo dos links de "Conteúdos"/formato da
 * LeftSidebar.
 */
export function CenterColumn({ cards, threads, access }: CenterColumnProps) {
  const sub = isSubscriber(access);
  const mixed = mixFeed(cards, threads);

  return (
    <div id="conteudos" className="space-y-6">
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Comece por aqui
        </h2>
        <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
          {cards.map((card) => (
            <RailCard key={card.id} card={card} />
          ))}
          {cards.length === 0 && <p className="text-sm text-muted-foreground">Nenhum conteúdo disponível ainda.</p>}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Do hub e da comunidade
        </h2>
        <ul className="space-y-3">
          {mixed.map((item) =>
            item.kind === "content" ? (
              <ContentListItem key={item.key} card={item.card} />
            ) : (
              <ThreadListItem key={item.key} thread={item.thread} clickable={sub} />
            )
          )}
          {mixed.length === 0 && (
            <li className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
              Ainda não há novidades por aqui.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}

export default CenterColumn;
