"use client";

import { useEffect, useState } from "react";
import DiagnosticoInline from "@/components/quiz/DiagnosticoInline";
import { CAPACITY_PATHS, type CapacityTier } from "@/lib/capacity";

const DISMISSED_KEY = "mc-seu-caminho-dismissed-v1";

export interface SeuCaminhoCardProps {
  tier: CapacityTier;
}

/**
 * Bloco "Seu caminho" do feed: mostra o caminho recomendado (nome público,
 * tagline, setup e primeiro passo) para o tier de capacidade já gravado no
 * diagnóstico. Copy vem inteira de CAPACITY_PATHS (fonte única — landing,
 * feed e e-mails leem daqui, sem drift de mensagem entre canais).
 *
 * Dismiss é conveniência local (localStorage), não estado de servidor. O
 * link "meu setup mudou" reabre o mini-diagnóstico (mode="capacidade") no
 * lugar do card; ao clicar, limpa o dismiss também — senão o card novo,
 * pós-refresh, nasceria escondido.
 */
export function SeuCaminhoCard({ tier }: SeuCaminhoCardProps) {
  const [dismissed, setDismissed] = useState(false);
  const [refazendo, setRefazendo] = useState(false);

  // Hidrata o dismiss só no cliente (evita divergência de SSR/hydration).
  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(DISMISSED_KEY) === "1");
    } catch {
      /* localStorage indisponível — estado só em memória */
    }
  }, []);

  const dismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      /* localStorage indisponível — dismiss só nesta sessão */
    }
  };

  const refazer = () => {
    try {
      window.localStorage.removeItem(DISMISSED_KEY);
    } catch {
      /* localStorage indisponível — não bloqueia o refazer */
    }
    setRefazendo(true);
  };

  if (refazendo) {
    return <DiagnosticoInline mode="capacidade" />;
  }

  if (dismissed) return null;

  const path = CAPACITY_PATHS[tier];

  return (
    <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5 dark:border-violet-800 dark:bg-violet-950/40">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="mb-1 text-sm font-semibold text-violet-700 dark:text-violet-300">
            Seu caminho
          </p>
          <h2 className="mb-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {path.publicName}
          </h2>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dispensar bloco Seu caminho"
          className="shrink-0 rounded-full p-1 text-zinc-400 transition hover:bg-white hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        >
          ✕
        </button>
      </div>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{path.tagline}</p>
      <p className="mb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Setup recomendado</p>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{path.setup}</p>
      <p className="mb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Primeiro passo</p>
      <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-300">{path.primeiroPasso}</p>
      <button
        type="button"
        onClick={refazer}
        className="text-sm font-medium text-violet-700 underline-offset-2 hover:underline dark:text-violet-300"
      >
        meu setup mudou
      </button>
    </div>
  );
}
