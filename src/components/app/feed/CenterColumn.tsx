import { isSubscriber } from "@/lib/forum";
import { FeedTimeline } from "./FeedTimeline";
import { RailGallery } from "./RailGallery";
import type { AccessLevel } from "@/lib/entitlements";
import type { FeedCard } from "@/lib/feed";
import type { FeedEntry } from "@/lib/feed-timeline";

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

/**
 * Coluna central do feed: rail "Comece por aqui" (galeria deslizante de cards do
 * hub) + a lista principal "Do hub e da comunidade" (timeline unificado com
 * scroll infinito e composer de post, via `FeedTimeline`). `id="conteudos"` é o
 * alvo dos links de "Conteúdos"/formato da LeftSidebar.
 */
export function CenterColumn({ cards, timeline, timelineCursor, access, canPost }: CenterColumnProps) {
  return (
    <div id="conteudos" className="scroll-mt-24 space-y-6">
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Comece por aqui
        </h2>
        <RailGallery cards={cards} />
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
