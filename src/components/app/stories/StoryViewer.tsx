"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CONTENT_ICON } from "@/lib/content-icons";
import { IconClose } from "@/components/ui/icons";
import { STORY_DURATION_MS, type StoryGroup } from "@/lib/stories";

export type StoryViewerProps = {
  groups: StoryGroup[];
  /** Índice do grupo em que o viewer abre. */
  startGroup: number;
  onClose: () => void;
  onSlideSeen: (contentId: string) => void;
};

/**
 * Overlay fullscreen de histórias: barrinhas de progresso, auto-avanço de
 * STORY_DURATION_MS por slide (pausável ao segurar), navegação por toque nas
 * bordas e por teclado (setas / Escape), CTA que respeita o gating do conteúdo.
 */
export function StoryViewer({ groups, startGroup, onClose, onSlideSeen }: StoryViewerProps) {
  const [pos, setPos] = useState({ g: startGroup, s: 0 });
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  // Refs para manter os callbacks estáveis dentro do loop de animação.
  const onCloseRef = useRef(onClose);
  const onSeenRef = useRef(onSlideSeen);
  const pausedRef = useRef(paused);
  const posRef = useRef({ g: startGroup, s: 0 });
  useEffect(() => {
    onCloseRef.current = onClose;
    onSeenRef.current = onSlideSeen;
  });
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);
  useEffect(() => {
    posRef.current = pos;
  }, [pos]);

  const goNext = useCallback(() => {
    const p = posRef.current;
    const grp = groups[p.g];
    if (grp && p.s < grp.slides.length - 1) setPos({ g: p.g, s: p.s + 1 });
    else if (p.g < groups.length - 1) setPos({ g: p.g + 1, s: 0 });
    else onCloseRef.current();
  }, [groups]);

  const goPrev = useCallback(() => {
    setPos((p) => {
      if (p.s > 0) return { g: p.g, s: p.s - 1 };
      if (p.g > 0) return { g: p.g - 1, s: groups[p.g - 1].slides.length - 1 };
      return p; // já no primeiro slide do primeiro grupo
    });
  }, [groups]);

  const group = groups[pos.g];
  const slide = group?.slides[pos.s];

  // Timer/progresso por slide, baseado em requestAnimationFrame (pausável).
  useEffect(() => {
    if (!slide) return;
    onSeenRef.current(slide.contentId);
    let raf = 0;
    let elapsed = 0;
    let last: number | null = null;
    setProgress(0);
    const tick = (ts: number) => {
      if (pausedRef.current) {
        last = ts;
      } else {
        if (last != null) elapsed += ts - last;
        last = ts;
        const p = Math.min(elapsed / STORY_DURATION_MS, 1);
        setProgress(p);
        if (p >= 1) {
          goNext();
          return;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pos.g, pos.s, slide, goNext]);

  // Teclado: setas navegam, Escape fecha.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  // Foco inicial no overlay + trava o scroll do fundo enquanto aberto.
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    containerRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!group || !slide) return null;
  const Icon = CONTENT_ICON[slide.type];

  return (
    <motion.div
      ref={containerRef}
      tabIndex={-1}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[100] flex flex-col bg-black/90 outline-none backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Histórias de ${group.label}`}
    >
      {/* Barra superior: progresso + fechar */}
      <div className="flex items-center gap-3 px-4 pt-4">
        <div className="flex flex-1 gap-1">
          {group.slides.map((s, i) => (
            <div key={s.contentId} className="h-1 flex-1 overflow-hidden rounded-full bg-white/25">
              <div
                className="h-full rounded-full bg-white"
                style={{ width: `${i < pos.s ? 100 : i === pos.s ? progress * 100 : 0}%` }}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar histórias"
          className="shrink-0 rounded-full p-1 text-white/80 transition hover:text-white"
        >
          <IconClose size={22} />
        </button>
      </div>

      {/* Área central: zonas de toque + card */}
      <div
        className="relative flex flex-1 items-center justify-center p-4"
        onPointerDown={() => setPaused(true)}
        onPointerUp={() => setPaused(false)}
        onPointerLeave={() => setPaused(false)}
        onPointerCancel={() => setPaused(false)}
      >
        <button
          type="button"
          onClick={goPrev}
          aria-label="História anterior"
          className="absolute inset-y-0 left-0 z-10 w-1/4 cursor-default"
        />
        <button
          type="button"
          onClick={goNext}
          aria-label="Próxima história"
          className="absolute inset-y-0 right-0 z-10 w-1/4 cursor-default"
        />

        <article className="relative z-20 flex w-full max-w-sm flex-col items-center gap-4 rounded-3xl bg-gradient-to-br from-violet-600 to-violet-900 p-8 text-center text-white shadow-2xl">
          {slide.embedUrl && !slide.emBreve ? (
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-black/40">
              <iframe
                src={slide.embedUrl}
                title={slide.title}
                className="h-full w-full"
                allow="autoplay; encrypted-media"
              />
            </div>
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-white">
              <Icon size={34} />
            </span>
          )}

          <span className="text-xs font-semibold uppercase tracking-wide text-white/70">
            {group.label}
          </span>
          <h2 className="text-lg font-bold leading-snug">{slide.title}</h2>
          <p className="text-sm text-white/85">{slide.hook}</p>

          {slide.emBreve ? (
            <span className="rounded-full bg-amber-400/20 px-4 py-2 text-sm font-semibold text-amber-200">
              Em breve
            </span>
          ) : (
            <Link
              href={slide.href}
              onClick={onClose}
              className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-violet-700 transition hover:bg-white/90"
            >
              {slide.ctaLabel}
            </Link>
          )}
        </article>
      </div>
    </motion.div>
  );
}

export default StoryViewer;
