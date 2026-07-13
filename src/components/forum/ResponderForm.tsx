"use client";
import { useState } from "react";

export default function ResponderForm({ topicId }: { topicId: string }) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const res = await fetch("/api/forum/reply", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicId, body }),
    });
    if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? "Erro ao responder."); setLoading(false); return; }
    window.location.reload();
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Sua resposta"
        rows={3} className="w-full rounded-lg border px-3 py-2" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading}
        className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
        {loading ? "Enviando..." : "Responder"}
      </button>
    </form>
  );
}
