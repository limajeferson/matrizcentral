"use client";

import { useState } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { IconBadge } from "@/components/ui/icons";
import type { ActivityItem } from "@/lib/feed";
import { relativeTime } from "@/lib/relative-time";

export type SwipeableActivityListProps = {
  items: ActivityItem[];
};

const DISMISS_THRESHOLD = -64;

/**
 * Atividade recente (selos conquistados) com item swipeable (modelo
 * swipeable-list): arraste para a esquerda revela o rótulo "Dispensar" num
 * fundo neutro; soltar além do limiar remove o item (`AnimatePresence`
 * anima a saída). Botão "Dispensar" visível cobre o acesso por teclado.
 */
export function SwipeableActivityList({ items }: SwipeableActivityListProps) {
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  function dismiss(index: number) {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }

  function handleDragEnd(index: number, info: PanInfo) {
    if (info.offset.x < DISMISS_THRESHOLD) dismiss(index);
  }

  const visible = items
    .map((item, index) => ({ item, index }))
    .filter(({ index }) => !dismissed.has(index));

  if (visible.length === 0) {
    return <p className="text-sm text-muted-foreground">Ainda sem atividade por aqui.</p>;
  }

  return (
    <ul className="space-y-2">
      <AnimatePresence initial={false}>
        {visible.map(({ item, index }) => (
          <motion.li
            key={index}
            layout
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.18 }}
            className="relative overflow-hidden rounded-xl"
          >
            <div className="absolute inset-0 flex items-center justify-end rounded-xl bg-destructive/10 px-4 text-xs font-semibold text-muted-foreground">
              Dispensar
            </div>
            <motion.div
              drag="x"
              dragConstraints={{ left: -96, right: 0 }}
              dragElastic={0.15}
              onDragEnd={(_event, info) => handleDragEnd(index, info)}
              className="relative flex items-start gap-2 rounded-xl bg-card px-1 py-1.5 text-sm text-foreground"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-600/10 text-violet-600">
                <IconBadge size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block">{item.text}</span>
                <span className="block text-xs text-muted-foreground">{relativeTime(item.at, new Date())}</span>
              </span>
              <button
                type="button"
                onClick={() => dismiss(index)}
                aria-label={`Dispensar atividade: ${item.text}`}
                className="shrink-0 self-start rounded-full px-2 py-1 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                Dispensar
              </button>
            </motion.div>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}

export default SwipeableActivityList;
