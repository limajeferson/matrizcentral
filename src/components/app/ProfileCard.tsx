"use client";

import Link from "next/link";
import { useState } from "react";
import { IconClose } from "@/components/ui/icons";

export type ProfileCardPlan = "Start" | "Regular" | "Advanced";

export type ProfileCardProps = {
  email: string;
  level: number;
  levelName: string;
  progressPercent: number;
  plan: ProfileCardPlan;
};

/**
 * Card de perfil flutuante: pill minimizado (canto inferior direito) que
 * expande para mostrar progresso de XP, plano e atalho para a conta.
 * Client component — não bloqueia o feed, `position: fixed` fora do fluxo.
 */
export function ProfileCard({ email, level, levelName, progressPercent, plan }: ProfileCardProps) {
  const [expanded, setExpanded] = useState(false);
  const initial = email.trim().charAt(0).toUpperCase() || "?";
  const shortEmail = email.length > 22 ? `${email.slice(0, 19)}...` : email;
  const clampedProgress = Math.min(100, Math.max(0, progressPercent));

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        aria-label="Expandir card de perfil"
        className="fixed bottom-6 right-6 z-40 flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-left shadow-lg transition hover:bg-accent sm:gap-3 sm:px-4"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-semibold text-white">
          {initial}
        </span>
        <span className="hidden min-w-0 flex-col leading-tight sm:flex">
          <span className="truncate text-sm font-medium text-foreground">{shortEmail}</span>
          <span className="truncate text-xs text-muted-foreground">Nível {level}</span>
        </span>
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-label="Card de perfil"
      className="fixed bottom-6 right-6 z-40 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-card p-4 shadow-xl"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-600 text-base font-semibold text-white">
            {initial}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{email}</p>
            <p className="text-xs text-muted-foreground">
              Nível {level} — {levelName}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          aria-label="Recolher card de perfil"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
        >
          <IconClose size={14} />
        </button>
      </div>

      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>Progresso de XP</span>
          <span>{clampedProgress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-accent">
          <div
            className="h-full rounded-full bg-violet-600"
            style={{ width: `${clampedProgress}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2">
        <span className="text-xs text-muted-foreground">Plano</span>
        <span className="text-sm font-medium text-foreground">{plan}</span>
      </div>

      <Link
        href="/conta"
        className="mt-4 flex w-full items-center justify-center rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
      >
        Ir para minha conta
      </Link>
    </div>
  );
}

export default ProfileCard;
