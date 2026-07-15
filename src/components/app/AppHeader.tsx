"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconBell, IconClose, IconMenu, IconSearch } from "@/components/ui/icons";

export type AppHeaderProps = {
  /** Slot do menu de usuário (avatar/dropdown ou link "Entrar" se deslogado). */
  userMenu: ReactNode;
  /** Nav lateral (mesmos nós da `LeftSidebar`), renderizada dentro do drawer mobile. */
  mobileNav: ReactNode;
};

/**
 * Header sticky da área logada: esconde ao rolar para baixo (além de ~80px) e
 * reaparece ao rolar para cima; sempre visível no topo. Abaixo de `md`, expõe
 * um botão hambúrguer que abre um drawer lateral com a navegação (`mobileNav`).
 */
export function AppHeader({ userMenu, mobileNav }: AppHeaderProps) {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const lastY = useRef(0);
  const panelRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      if (y > lastY.current && y > 80) {
        setHidden(true);
      } else if (y < lastY.current) {
        setHidden(false);
      }
      setScrolled(y > 8);
      lastY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  return (
    <>
      <motion.header
        role="banner"
        animate={{ y: hidden ? -72 : 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className={`sticky top-0 z-40 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 ${
          scrolled ? "shadow-md" : ""
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 lg:px-6">
          <button
            type="button"
            aria-label="Abrir menu"
            onClick={() => setOpen(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-accent-foreground lg:hidden"
          >
            <IconMenu size={20} />
          </button>

          <a href="/feed" className="shrink-0 text-lg font-bold tracking-tight">
            Matriz <span className="text-violet-600">Central</span>
          </a>

          <div className="relative hidden max-w-md flex-1 md:block">
            <IconSearch
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="search"
              placeholder="Buscar conteúdo (em breve)"
              disabled
              aria-label="Buscar conteúdo (em breve)"
              className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-70"
            />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-3">
            <button
              type="button"
              aria-label="Notificações"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
            >
              <IconBell size={18} />
            </button>
            {userMenu}
          </div>
        </div>
      </motion.header>

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
              aria-label="Menu"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto bg-card p-4 outline-none"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold uppercase text-muted-foreground">Menu</span>
                <button
                  type="button"
                  aria-label="Fechar menu"
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                >
                  <IconClose size={18} />
                </button>
              </div>
              {mobileNav}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default AppHeader;
