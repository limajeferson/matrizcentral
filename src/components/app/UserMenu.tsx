"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { IconMoon, IconSun } from "@/components/ui/icons";

export type UserMenuProps = {
  email: string;
  level: number;
  levelName: string;
};

/** Avatar (inicial do e-mail) + dropdown com nível, toggle de tema, conta e sair. */
export function UserMenu({ email, level, levelName }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/";
    }
  }

  const initial = email.trim().charAt(0).toUpperCase() || "?";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menu do usuário"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-sm font-semibold text-white transition hover:bg-violet-700"
      >
        {initial}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-11 z-50 w-64 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-medium">{email}</p>
            <p className="text-xs text-muted-foreground">
              Nível {level} — {levelName}
            </p>
          </div>

          <button
            type="button"
            role="menuitem"
            onClick={toggle}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
          >
            {theme === "dark" ? <IconSun size={16} /> : <IconMoon size={16} />}
            Tema: {theme === "dark" ? "escuro" : "claro"}
          </button>

          <Link
            href="/conta"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-accent hover:text-accent-foreground"
          >
            Minha conta
          </Link>

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-destructive hover:bg-accent disabled:opacity-60"
          >
            {loggingOut ? "Saindo..." : "Sair"}
          </button>
        </div>
      )}
    </div>
  );
}
