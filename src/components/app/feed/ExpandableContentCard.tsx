"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { IconClose, IconLock, IconArrow } from "@/components/ui/icons";
import { CONTENT_ICON } from "@/lib/content-icons";
import { CONTENT_ACCENT, contentMeta } from "@/lib/content-accent";
import type { FeedCard } from "@/lib/feed";

/**
 * Card de conteúdo no feed que **expande** para uma camada de detalhe (modelo
 * expandable-card): compartilha `layoutId` único (`content-<id>`) entre o card
 * compacto e o overlay, então o framer-motion anima a transição. Cada card tem
 * identidade por tipo (chip do ícone colorido, rótulo, brilho e realce no
 * hover) + metadados (duração/XP) e um CTA persuasivo. O CTA navega de fato
 * (respeita o gating via `card.href`). Escape/backdrop fecham; scroll travado.
 */
export function ExpandableContentCard({ card }: { card: FeedCard }) {
  const [open, setOpen] = useState(false);
  const Icon = CONTENT_ICON[card.type];
  const accent = CONTENT_ACCENT[card.type];
  const meta = contentMeta(card.durationMinutes, card.xpReward);
  const locked = !card.emBreve && card.href === "/oferta";
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      opener?.focus?.(); // devolve o foco ao gatilho ao fechar
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`group relative block w-full overflow-hidden rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${accent.hoverBorder}`}
      >
        {/* brilho de canto na cor do tipo */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${accent.glow} to-transparent opacity-70 blur-2xl transition-opacity duration-300 group-hover:opacity-100`}
        />
        <div className="relative flex gap-3.5">
          <span
            aria-hidden="true"
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent.chipBg} ${accent.fg}`}
          >
            <Icon size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className={`text-[11px] font-semibold uppercase tracking-wide ${accent.fg}`}>
                {accent.label}
              </span>
              {card.emBreve && (
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-500">
                  Em breve
                </span>
              )}
            </div>
            <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-foreground">
              {card.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {card.description}
            </p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-muted-foreground">{meta}</span>
              {card.emBreve ? (
                <span className="text-[11px] font-medium text-muted-foreground">Chega em breve</span>
              ) : locked ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-400">
                  <IconLock size={12} /> Assinar para acessar
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-400 transition-all group-hover:gap-1.5">
                  Abrir <IconArrow size={13} />
                </span>
              )}
            </div>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          /* Filho direto ÚNICO e keyed do AnimatePresence: fragment + div comum
           * quebram o tracking de exit e o véu ficava montado para sempre,
           * engolindo todos os cliques da página (bug real, achado ao vivo). */
          <motion.div
            key={`overlay-${card.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          >
              <motion.div
                ref={dialogRef}
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 4 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-label={card.title}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl outline-none"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent.chipBg} ${accent.fg}`}
                    >
                      <Icon size={18} />
                    </span>
                    <span className={`text-[11px] font-semibold uppercase tracking-wide ${accent.fg}`}>
                      {accent.label}
                    </span>
                  </span>
                  <button
                    type="button"
                    aria-label="Fechar"
                    onClick={() => setOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                  >
                    <IconClose size={18} />
                  </button>
                </div>
                <h2 className="text-lg font-bold leading-snug text-foreground">{card.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.description}</p>
                {meta && <p className="mt-2 text-xs font-medium text-muted-foreground">{meta}</p>}
                <div className="mt-5">
                  {card.emBreve ? (
                    <span className="rounded-full bg-amber-500/15 px-4 py-2 text-sm font-semibold text-amber-600">
                      Em breve
                    </span>
                  ) : (
                    <Link
                      href={card.href}
                      onClick={() => setOpen(false)}
                      className="inline-block rounded-full bg-violet-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700"
                    >
                      {locked ? "Assinar para acessar" : "Abrir conteúdo"}
                    </Link>
                  )}
                </div>
              </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ExpandableContentCard;
