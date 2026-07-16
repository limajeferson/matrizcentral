"use client";

import { useEffect, useRef } from "react";
import { CONTENT_ICON } from "@/lib/content-icons";
import { CONTENT_ACCENT, contentMeta } from "@/lib/content-accent";
import type { FeedCard } from "@/lib/feed";

function RailCard({ card }: { card: FeedCard }) {
  const Icon = CONTENT_ICON[card.type];
  const accent = CONTENT_ACCENT[card.type];
  const meta = contentMeta(card.durationMinutes, card.xpReward);
  return (
    <article
      className={`group flex w-72 shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${accent.hoverBorder}`}
    >
      {/* Pôster: dá imagem ao card mesmo sem thumbnail — banda com tint na cor
          do tipo + brilho difuso + ícone em destaque com anel. */}
      <div className="relative flex h-28 items-center justify-center overflow-hidden border-b border-border">
        <div aria-hidden="true" className={`absolute inset-0 bg-gradient-to-br ${accent.poster} to-transparent`} />
        <div
          aria-hidden="true"
          className={`absolute -right-6 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${accent.glow} to-transparent blur-2xl`}
        />
        <span
          aria-hidden="true"
          className={`relative flex h-16 w-16 items-center justify-center rounded-2xl bg-background/40 ring-1 ring-inset ring-white/15 backdrop-blur-sm ${accent.fg}`}
        >
          <Icon size={30} />
        </span>
        <span
          className={
            card.emBreve
              ? "absolute right-3 top-3 rounded-full bg-amber-500/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300"
              : "absolute right-3 top-3 rounded-full bg-violet-600/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-200"
          }
        >
          {card.emBreve ? "Em breve" : "Novo"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <span className={`text-[11px] font-semibold uppercase tracking-wide ${accent.fg}`}>
          {accent.label}
        </span>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-foreground">
          {card.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {card.description}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className="text-[11px] font-medium text-muted-foreground">{meta}</span>
          {card.emBreve ? (
            <span className="text-[11px] font-medium text-muted-foreground">Chega em breve</span>
          ) : (
            <a
              href={card.href}
              className="text-xs font-semibold text-violet-400 transition hover:text-violet-300"
            >
              Acessar →
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

/**
 * Rail "Comece por aqui" como galeria horizontal deslizante (modelo
 * image-gallery): sem barra de rolagem (`.no-scrollbar`); a roda vertical vira
 * deslize horizontal **direto e controlado** — move uma fração calma do delta
 * por evento (`* WHEEL_SPEED`), respondendo 1:1 ao gesto (sem inércia baseada em
 * rAF/smooth, que o navegador congela em abas de segundo plano, e sem
 * `scroll-snap`, que revertia o scroll por JS e engasgava). Ao chegar ao
 * fim/início na direção do gesto, libera a rolagem da página.
 */
const WHEEL_SPEED = 0.5;

export function RailGallery({ cards }: { cards: FeedCard[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; // gesto horizontal nativo
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      const atStart = el.scrollLeft <= 0;
      const atEnd = el.scrollLeft >= max - 1;
      if ((e.deltaY < 0 && atStart) || (e.deltaY > 0 && atEnd)) return; // deixa a página rolar
      e.preventDefault();
      el.scrollLeft = Math.max(0, Math.min(max, el.scrollLeft + e.deltaY * WHEEL_SPEED));
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div
      ref={ref}
      className="no-scrollbar -mx-1 flex gap-4 overflow-x-auto px-1 pb-2"
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
