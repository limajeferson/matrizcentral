"use client";
import { useState } from "react";

export default function ContatoForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading"); setError(null);
    try {
      const res = await fetch("/api/suporte", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? "Erro ao enviar."); setState("error"); return; }
      setState("done");
    } catch {
      setError("Falha de conexão. Tente novamente."); setState("error");
    }
  }

  if (state === "done") return <p className="rounded-lg bg-green-50 p-4 text-green-800">Recebemos sua mensagem! Responderemos por e-mail em breve.</p>;

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="w-full rounded-lg border px-3 py-2" />
      <textarea required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Como podemos ajudar?" rows={4} className="w-full rounded-lg border px-3 py-2" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={state === "loading"} className="rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white disabled:opacity-60">
        {state === "loading" ? "Enviando..." : "Enviar mensagem"}
      </button>
    </form>
  );
}
