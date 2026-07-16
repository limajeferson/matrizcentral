"use client";

import { motion } from "framer-motion";
import { ROADMAP_STAGE_KEYS, ROADMAP_STAGE_LABELS } from "@/data/roadmap-stages";
import { deriveRoadmapView } from "@/lib/roadmap-progress";
import { IconCheck, IconLock } from "@/components/ui/icons";

interface Props {
  completedStages: string[];
}

/**
 * Sumário lateral fixo (sticky) da jornada: mostra as 5 etapas do roadmap
 * com status (concluída/ativa/bloqueada) e navega até a etapa correspondente
 * em RoadmapCard via scroll suave. Só aparece em telas xl+.
 */
export default function JornadaToc({ completedStages }: Props) {
  const view = deriveRoadmapView(completedStages);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, key: string) => {
    e.preventDefault();
    document.getElementById(`etapa-${key}`)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="hidden xl:block sticky top-24 w-56 shrink-0">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Sua jornada
      </h3>
      <div className="mb-4 h-1.5 w-full rounded-full bg-zinc-200">
        <div
          className="h-1.5 rounded-full bg-violet-600 transition-all"
          style={{ width: `${view.progressPercent}%` }}
        />
      </div>

      <nav aria-label="Etapas da jornada">
        <ul className="space-y-2.5">
          {ROADMAP_STAGE_KEYS.map((key) => {
            const status = view.statusFor(key);
            const label = ROADMAP_STAGE_LABELS[key];

            return (
              <li key={key}>
                <a
                  href={`#etapa-${key}`}
                  onClick={(e) => handleClick(e, key)}
                  className={`flex items-center gap-2 text-sm transition ${
                    status === "active"
                      ? "font-medium text-zinc-900"
                      : "text-zinc-500 hover:text-zinc-700"
                  }`}
                >
                  {status === "done" && (
                    <IconCheck size={14} className="shrink-0 text-violet-600" />
                  )}
                  {status === "active" && (
                    <motion.span
                      aria-hidden="true"
                      className="block h-2 w-2 shrink-0 rounded-full bg-violet-600"
                      animate={{ scale: [1, 1.25, 1] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                  {status === "locked" && (
                    <IconLock size={14} className="shrink-0 text-zinc-400" />
                  )}
                  <span className="truncate">{label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
