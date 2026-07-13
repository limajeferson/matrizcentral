"use client";
import { useState } from "react";

export default function NovoTopicoForm() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const res = await fetch("/api/forum/topic", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body }),
    });
    if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? "Erro ao criar."); setLoading(false); return; }
    const { id } = await res.json();
    window.location.href = `/forum/${id}`;
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título do tópico"
        className="w-full rounded-lg border px-3 py-2" />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="O que você quer discutir?"
        rows={4} className="w-full rounded-lg border px-3 py-2" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading}
        className="rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white disabled:opacity-60">
        {loading ? "Publicando..." : "Publicar tópico"}
      </button>
    </form>
  );
}
