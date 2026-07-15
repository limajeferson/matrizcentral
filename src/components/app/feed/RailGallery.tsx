"use client";

import { useEffect, useRef } from "react";
import { CONTENT_ICON } from "@/lib/content-icons";
import type { FeedCard } from "@/lib/feed";
import type { ContentType } from "@/data/content-hub";

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
 * Rail "Comece por aqui" como galeria horizontal deslizante (modelo
 * image-gallery): sem barra de rolagem visível (`.no-scrollbar`), com scroll-snap
 * e **wheel vertical convertido em deslize horizontal**. O listener é nativo e
 * não-passivo (React torna `onWheel` passivo, impedindo `preventDefault`).
 * Quando o rail chega ao fim/início na direção do gesto, libera o scroll da
 * página (não sequestra a rolagem vertical).
 */
export function RailGallery({ cards }: { cards: FeedCard[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; // já é gesto horizontal
      const atStart = el.scrollLeft <= 0;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
      if ((e.deltaY < 0 && atStart) || (e.deltaY > 0 && atEnd)) return; // deixa a página rolar
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div
      ref={ref}
      className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2"
    >
      {cards.map((card) => (
        <RailCard key={card.id} card={card} />
      ))}
      {cards.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhum conteúdo disponível ainda.</p>
      )}
    </div>
  );
}

export default RailGallery;
