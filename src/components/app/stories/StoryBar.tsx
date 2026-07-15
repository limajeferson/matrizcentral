"use client";

import { useCallback, useEffect, useState } from "react";
import { CONTENT_ICON } from "@/lib/content-icons";
import type { StoryGroup } from "@/lib/stories";
import { StoryViewer } from "./StoryViewer";

export type StoryBarProps = { groups: StoryGroup[] };

const SEEN_KEY = "mc-stories-seen";

function loadSeen(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(SEEN_KEY);
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    return new Set(Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

/**
 * Barra de histórias do feed: um círculo por categoria (StoryGroup) que abre o
 * StoryViewer. Anel violeta enquanto houver slide não-visto; apagado quando
 * todos os slides do grupo já foram vistos (persistido em localStorage).
 */
export function StoryBar({ groups }: StoryBarProps) {
  const [viewer, setViewer] = useState<number | null>(null);
  const [seen, setSeen] = useState<Set<string>>(() => new Set());

  // Hidrata o "visto" só no cliente (evita divergência de SSR).
  useEffect(() => {
    setSeen(loadSeen());
  }, []);

  const markSeen = useCallback((contentId: string) => {
    setSeen((prev) => {
      if (prev.has(contentId)) return prev;
      const next = new Set(prev);
      next.add(contentId);
      try {
        window.localStorage.setItem(SEEN_KEY, JSON.stringify(Array.from(next)));
      } catch {
        /* localStorage indisponível — estado só em memória */
      }
      return next;
    });
  }, []);

  if (groups.length === 0) return null;

  return (
    <section aria-label="Histórias" className="mb-2">
      <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-1">
        {groups.map((group, idx) => {
          const Icon = CONTENT_ICON[group.type];
          const allSeen = group.slides.every((s) => seen.has(s.contentId));
          return (
            <button
              key={group.type}
              type="button"
              onClick={() => setViewer(idx)}
              aria-label={`Histórias de ${group.label}`}
              className="flex w-[72px] shrink-0 flex-col items-center gap-1.5"
            >
              <span
                className={
                  allSeen
                    ? "rounded-full border-2 border-border p-[3px]"
                    : "rounded-full bg-gradient-to-tr from-violet-600 to-indigo-400 p-[3px]"
                }
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-card text-violet-600">
                  <Icon size={26} />
                </span>
              </span>
              <span className="max-w-full truncate text-xs font-medium text-foreground">
                {group.label}
              </span>
            </button>
          );
        })}
      </div>

      {viewer !== null && (
        <StoryViewer
          groups={groups}
          startGroup={viewer}
          onClose={() => setViewer(null)}
          onSlideSeen={markSeen}
        />
      )}
    </section>
  );
}

export default StoryBar;
