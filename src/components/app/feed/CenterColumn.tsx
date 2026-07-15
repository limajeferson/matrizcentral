import { CONTENT_ICON } from "@/lib/content-icons";
import { isSubscriber } from "@/lib/forum";
import { FeedTimeline } from "./FeedTimeline";
import type { AccessLevel } from "@/lib/entitlements";
import type { FeedCard } from "@/lib/feed";
import type { FeedEntry } from "@/lib/feed-timeline";
import type { ContentType } from "@/data/content-hub";

export type CenterColumnProps = {
  /** Cards de conteúdo do hub para o rail "Comece por aqui" (`buildContentFeed`). */
  cards: FeedCard[];
  /** Timeline inicial (posts + threads + conteúdo) para a lista principal. */
  timeline: FeedEntry[];
  /** Cursor da 1ª página (created_at do post mais antigo) ou null se acabou. */
  timelineCursor: string | null;
  /** Nível de acesso — controla link de threads e composer. */
  access: AccessLevel;
  /** Logado pode publicar posts (mostra o composer). */
  canPost: boolean;
};

const TYPE_LABEL: Record<ContentType, string> = {
  relatorio: "Relatório",
  podcast: "Podcast",
  video: "Vídeo",
  pesquisa: "Pesquisa",
};

function RailCard({ card }: { card: FeedCard }) {
  const Icon = CONTENT_ICON[card.type];
  return (
    <article className="w-64 shrink-0 snap-start rounded-2xl border border-border bg-card p-4 shadow-sm">
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
        <a href={card.href} className="text-xs font-semibold text-violet-600 hover:underline">
          Acessar →
        </a>
      )}
    </article>
  );
}

/**
 * Coluna central do feed: rail "Comece por aqui" (galeria deslizante de cards do
 * hub) + a lista principal "Do hub e da comunidade" (timeline unificado com
 * scroll infinito e composer de post, via `FeedTimeline`). `id="conteudos"` é o
 * alvo dos links de "Conteúdos"/formato da LeftSidebar.
 */
export function CenterColumn({ cards, timeline, timelineCursor, access, canPost }: CenterColumnProps) {
  return (
    <div id="conteudos" className="space-y-6">
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Comece por aqui
        </h2>
        <div className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2">
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
        <FeedTimeline
          initial={timeline}
          initialCursor={timelineCursor}
          canPost={canPost}
          canOpenThreads={isSubscriber(access)}
        />
      </section>
    </div>
  );
}

export default CenterColumn;
