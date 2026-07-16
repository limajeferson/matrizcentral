"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconContent } from "@/components/ui/icons";
import type { MdHeading } from "@/lib/markdown";

export type ArticleTocProps = {
  headings: MdHeading[];
};

/**
 * Sumário flutuante estilo "ilha dinâmica": recolhido mostra o título da
 * seção ativa (por scroll), clique expande a lista completa de headings.
 * Só aparece em artigos substanciais (>= 3 headings).
 */
export function ArticleToc({ headings }: ArticleTocProps) {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? "");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (headings.length < 3) return;
    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [headings]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [open]);

  if (headings.length < 3) return null;

  const activeHeading = headings.find((h) => h.id === activeId) ?? headings[0];

  const handleItemClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.div
      ref={rootRef}
      layout
      className="fixed top-3 left-1/2 z-40 -translate-x-1/2 max-w-[90vw] sm:max-w-md"
    >
      <motion.button
        layout
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 rounded-full border border-border bg-card/90 px-4 py-2 shadow-lg backdrop-blur"
      >
        <IconContent size={16} className="shrink-0 text-violet-600" />
        <span className="truncate text-sm font-medium text-foreground">
          {activeHeading?.text}
        </span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.nav
            aria-label="Sumário"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            className="mt-2 max-h-[60vh] overflow-y-auto rounded-2xl border border-border bg-card/95 p-2 shadow-lg backdrop-blur"
          >
            <ul className="space-y-0.5">
              {headings.map((h) => {
                const isActive = h.id === activeId;
                return (
                  <li key={h.id} style={{ paddingLeft: `${(h.level - 1) * 12}px` }}>
                    <a
                      href={`#${h.id}`}
                      onClick={(e) => handleItemClick(e, h.id)}
                      className={`block truncate rounded-lg px-3 py-1.5 text-sm transition ${
                        isActive
                          ? "font-semibold text-violet-600"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {h.text}
                    </a>
                  </li>
                );
              })}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default ArticleToc;
