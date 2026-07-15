"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { IconClose, IconLock } from "@/components/ui/icons";
import { CONTENT_ICON } from "@/lib/content-icons";
import type { FeedCard } from "@/lib/feed";
import type { ContentType } from "@/data/content-hub";

const TYPE_LABEL: Record<ContentType, string> = {
  relatorio: "Relatório",
  podcast: "Podcast",
  video: "Vídeo",
  pesquisa: "Pesquisa",
};

/**
 * Card de conteúdo no feed que **expande** para uma camada de detalhe (modelo
 * expandable-card): compartilha `layoutId` único (`content-<id>`) entre o card
 * compacto e o overlay, então o framer-motion anima a transição. O CTA "Abrir
 * conteúdo" navega de fato (respeita o gating via `card.href`). Escape/backdrop
 * fecham; scroll do body travado enquanto aberto.
 */
export function ExpandableContentCard({ card }: { card: FeedCard }) {
  const [open, setOpen] = useState(false);
  const Icon = CONTENT_ICON[card.type];
  const locked = !card.emBreve && card.href === "/oferta";
  const layoutId = `content-${card.id}`;
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
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
    };
  }, [open]);

  return (
    <>
      <motion.button
        layoutId={layoutId}
        type="button"
        onClick={() => setOpen(true)}
        className="block w-full rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition hover:border-violet-500/50"
      >
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Icon size={14} />
            {TYPE_LABEL[card.type]}
          </span>
          {card.emBreve && (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-600">Em breve</span>
          )}
        </div>
        <h3 className="text-sm font-semibold text-foreground">{card.title}</h3>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{card.description}</p>
        {locked && (
          <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-violet-600">
            <IconLock size={12} /> Assine para acessar
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
            />
            <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
              <motion.div
                ref={dialogRef}
                layoutId={layoutId}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-label={card.title}
                className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl outline-none"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Icon size={16} />
                    {TYPE_LABEL[card.type]}
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
                <h2 className="text-lg font-bold text-foreground">{card.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{card.description}</p>
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
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default ExpandableContentCard;
