"use client";

import { useState } from "react";
import GlassCard from "@/components/ui/glass-card";
import CategoryBadge from "@/components/ui/category-badge";
import { IconCheck } from "@/components/ui/icons";

interface ChallengeWidgetProps {
  token: string;
  title: string;
  description: string;
  xpReward: number;
  progress: number;
  target: number;
  alreadyClaimed: boolean;
}

export default function ChallengeWidget({
  token,
  title,
  description,
  xpReward,
  progress,
  target,
  alreadyClaimed,
}: ChallengeWidgetProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "claimed" | "error">(
    alreadyClaimed ? "claimed" : "idle"
  );

  const complete = progress >= target;

  const handleClaim = async () => {
    setStatus("loading");
    const response = await fetch("/api/challenges/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    setStatus(response.ok ? "claimed" : "error");
  };

  return (
    <GlassCard className="p-6">
      <div className="mb-2">
        <CategoryBadge variant="roadmap">Desafio da Semana</CategoryBadge>
      </div>
      <h2 className="font-bold text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <p className="mt-2 text-xs text-muted-foreground">
        Progresso: {Math.min(progress, target)}/{target} · Recompensa: +{xpReward} XP
      </p>
      {status === "claimed" ? (
        <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
          <IconCheck size={16} />
          Resgatado
        </p>
      ) : (
        <button
          onClick={handleClaim}
          disabled={!complete || status === "loading"}
          className="mt-3 rounded-xl bg-violet-600 px-6 py-2 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status === "loading" ? "Resgatando..." : "Resgatar recompensa"}
        </button>
      )}
      {status === "error" && (
        <p className="mt-2 text-sm text-red-600">Não foi possível resgatar. Tente novamente.</p>
      )}
    </GlassCard>
  );
}
