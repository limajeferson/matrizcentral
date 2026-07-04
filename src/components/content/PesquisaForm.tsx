"use client";

import { useState } from "react";
import type { SurveyOption } from "@/data/content-hub";
import PesquisaResults from "@/components/content/PesquisaResults";

interface Props {
  token: string;
  surveyId: string;
  options: SurveyOption[];
}

export default function PesquisaForm({ token, surveyId, options }: Props) {
  const [loadingOptionId, setLoadingOptionId] = useState<string | null>(null);
  const [tally, setTally] = useState<Record<string, number> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVote = async (optionId: string) => {
    setLoadingOptionId(optionId);
    setError(null);

    const response = await fetch("/api/pesquisa/responder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, surveyId, optionId }),
    });

    setLoadingOptionId(null);

    if (!response.ok) {
      setError("Não foi possível registrar sua resposta. Tente novamente.");
      return;
    }

    const { tally: rawTally } = await response.json();
    const counts: Record<string, number> = {};
    for (const row of rawTally as { optionId: string; count: number }[]) {
      counts[row.optionId] = row.count;
    }
    setTally(counts);
  };

  if (tally) {
    return <PesquisaResults options={options} counts={tally} />;
  }

  return (
    <div className="space-y-2">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => handleVote(option.id)}
          disabled={loadingOptionId !== null}
          className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-left text-sm text-zinc-700 transition hover:border-violet-400 hover:bg-violet-50 disabled:opacity-60"
        >
          {loadingOptionId === option.id ? "Enviando..." : option.label}
        </button>
      ))}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
