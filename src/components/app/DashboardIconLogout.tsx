"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";

/** Botão de logout da sidebar do painel (ícone, sem texto) — mesma chamada
 *  de `LogoutButton`, só com a aparência de ícone da sidebar do dashboard. */
export function DashboardIconLogout() {
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      aria-label="Sair da conta"
      className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:opacity-60"
    >
      <LogOut className="h-5 w-5" />
    </button>
  );
}

export default DashboardIconLogout;
