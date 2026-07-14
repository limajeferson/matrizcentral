"use client";

import { useState } from "react";
import { ROADMAP_STAGE_KEYS, ROADMAP_STAGE_LABELS, type RoadmapStages } from "@/data/roadmap-stages";
import { deriveRoadmapView } from "@/lib/roadmap-progress";
import { IconCheck, IconLock } from "@/components/ui/icons";

interface Props {
  roadmap: RoadmapStages;
  completedStages: string[];
  token: string;
}

export default function RoadmapCard({ roadmap, completedStages, token }: Props) {
  const [completed, setCompleted] = useState(completedStages);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const view = deriveRoadmapView(completed);

  const handleComplete = async (stageKey: string) => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/roadmap/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, stageKey }),
      });
      if (response.ok) {
        setCompleted((prev) => [...prev, stageKey]);
      } else {
        setError("Não foi possível concluir a etapa agora. Tente novamente.");
      }
    } catch {
      setError("Não foi possível concluir a etapa agora. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="mb-2 text-xl font-bold text-zinc-900">Sua Trilha Recomendada</h2>
      <p className="mb-1 text-sm text-zinc-500">
        Etapa {view.currentStageNumber} de {ROADMAP_STAGE_KEYS.length}
      </p>
      <div className="mb-6 h-2 w-full rounded-full bg-zinc-200">
        <div
          className="h-2 rounded-full bg-violet-600 transition-all"
          style={{ width: `${view.progressPercent}%` }}
        />
      </div>

      <div className="space-y-3">
        {ROADMAP_STAGE_KEYS.map((key) => {
          const stage = roadmap[key];
          const label = ROADMAP_STAGE_LABELS[key];
          const status = view.statusFor(key);

          if (status === "done") {
            return (
              <div key={key} className="border-l-4 border-emerald-400 pl-4 py-2">
                <h3 className="flex items-center gap-1.5 font-semibold text-zinc-900">
                  <IconCheck size={16} className="text-emerald-500" />
                  {label}
                </h3>
              </div>
            );
          }

          if (status === "active") {
            return (
              <div key={key} className="border-l-4 border-violet-500 bg-violet-50 pl-4 py-4 rounded-r-xl">
                <h3 className="font-semibold text-zinc-900">{label}</h3>
                <p className="mt-1 text-sm text-zinc-600">{stage.objective}</p>
                <ul className="mt-3 space-y-1 text-sm text-zinc-600">
                  {stage.checklist.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => handleComplete(key)}
                  disabled={submitting}
                  className="mt-4 rounded-xl bg-violet-600 px-5 py-2 font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
                >
                  {submitting ? "Enviando..." : "Concluir Etapa"}
                </button>
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              </div>
            );
          }

          return (
            <div key={key} className="border-l-4 border-zinc-200 pl-4 py-2 text-zinc-400">
              <h3 className="flex items-center gap-1.5 font-semibold">
                <IconLock size={16} />
                {label}
              </h3>
              <p className="mt-1 text-sm">Disponível após concluir a etapa anterior.</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
