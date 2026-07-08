"use client";

import { useState } from "react";

interface LeaderboardOptInProps {
  token: string;
  initialOptIn: boolean;
  initialDisplayName: string | null;
}

export default function LeaderboardOptIn({
  token,
  initialOptIn,
  initialDisplayName,
}: LeaderboardOptInProps) {
  const [optIn, setOptIn] = useState(initialOptIn);
  const [displayName, setDisplayName] = useState(initialDisplayName ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const handleSave = async () => {
    setStatus("saving");
    const response = await fetch("/api/leaderboard/opt-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, optIn, displayName }),
    });
    setStatus(response.ok ? "saved" : "error");
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <label className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
        <input
          type="checkbox"
          checked={optIn}
          onChange={(e) => setOptIn(e.target.checked)}
        />
        Aparecer no ranking público
      </label>
      {optIn && (
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Seu nome de exibição"
          className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
      )}
      <button
        onClick={handleSave}
        disabled={status === "saving"}
        className="mt-3 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-40"
      >
        {status === "saving" ? "Salvando..." : "Salvar preferência"}
      </button>
      {status === "saved" && (
        <p className="mt-2 text-sm text-emerald-600">✔ Preferência salva.</p>
      )}
      {status === "error" && (
        <p className="mt-2 text-sm text-red-600">Não foi possível salvar. Tente novamente.</p>
      )}
    </div>
  );
}
