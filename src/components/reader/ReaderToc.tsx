"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { IconClose, IconContent } from "@/components/ui/icons";

export type ReaderTocItem = { slug: string; title: string; index: number };

export type ReaderTocProps = {
  /** Só os campos necessários para listar — nunca os blocos das seções. */
  items: ReaderTocItem[];
  currentSlug: string;
  /** Caminho base do leitor, ex.: `/biblioteca/guia-llm-local`. */
  basePath: string;
};

/**
 * Sumário do leitor: coluna lateral fixa em telas largas, sheet acionado por
 * botão em telas estreitas. Recebe só `{slug,title,index}` por item — o
 * conteúdo das outras seções nunca chega ao cliente.
 */
export function ReaderToc({ items, currentSlug, basePath }: ReaderTocProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const list = (onNavigate?: () => void) => (
    <ol className="space-y-1">
      {items.map((item) => {
        const isCurrent = item.slug === currentSlug;
        return (
          <li key={item.slug}>
            <Link
              href={`${basePath}?s=${item.slug}`}
              onClick={onNavigate}
              aria-current={isCurrent ? "step" : undefined}
              className={`flex min-h-[44px] items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                isCurrent
                  ? "bg-violet-600/10 font-semibold text-violet-600"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground/70">
                {item.index + 1}.
              </span>
              <span className="truncate">{item.title}</span>
            </Link>
          </li>
        );
      })}
    </ol>
  );

  return (
    // Um único elemento raiz de propósito: em `lg:grid`, o container pai trata
    // cada filho direto como uma célula — precisa ser UM item, não um Fragment
    // com dois irmãos (o que quebraria o layout de 2 colunas).
    <div>
      {/* Desktop: coluna lateral fixa */}
      <nav aria-label="Sumário" className="hidden lg:sticky lg:top-6 lg:block lg:self-start">
        <h2 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Sumário
        </h2>
        {list()}
      </nav>

      {/* Mobile: botão + sheet */}
      <div className="mb-4 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium text-foreground"
        >
          <IconContent size={16} className="text-violet-600" />
          Sumário
        </button>

        <AnimatePresence>
          {open && (
            <>
              <motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60"
                onClick={() => setOpen(false)}
              />
              <motion.aside
                key="panel"
                ref={panelRef}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-label="Sumário"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="fixed inset-x-0 bottom-0 z-50 max-h-[75vh] overflow-y-auto rounded-t-2xl border-t border-border bg-card p-4 outline-none"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold uppercase text-muted-foreground">
                    Sumário
                  </span>
                  <button
                    type="button"
                    aria-label="Fechar sumário"
                    onClick={() => setOpen(false)}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                  >
                    <IconClose size={18} />
                  </button>
                </div>
                {list(() => setOpen(false))}
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default ReaderToc;
