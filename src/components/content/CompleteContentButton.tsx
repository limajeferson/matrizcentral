"use client";

import { useState } from "react";

interface Props {
  token: string;
  contentId: string;
  initiallyCompleted: boolean;
}

export default function CompleteContentButton({ token, contentId, initiallyCompleted }: Props) {
  const [completed, setCompleted] = useState(initiallyCompleted);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    const response = await fetch("/api/content/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, contentId }),
    });
    setLoading(false);
    if (response.ok) {
      setCompleted(true);
    }
  };

  if (completed) {
    return <p className="font-semibold text-emerald-600">✔ Concluído</p>;
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="rounded-xl bg-violet-600 px-6 py-2 font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
    >
      {loading ? "Salvando..." : "Marcar como concluído"}
    </button>
  );
}
