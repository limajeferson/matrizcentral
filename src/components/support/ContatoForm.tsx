"use client";
import { useState } from "react";
import { SELLER } from "@/data/legal";

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

  if (state === "done")
    return (
      <p role="status" aria-live="polite" className="rounded-lg bg-emerald-500/10 p-4 text-emerald-600">
        Recebemos sua mensagem! Responderemos por e-mail em breve.
      </p>
    );

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div>
        <label htmlFor="contato-email" className="mb-1 block text-sm font-medium text-foreground">
          Seu e-mail
        </label>
        <input id="contato-email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-violet-500 focus:outline-none" />
      </div>
      <div>
        <label htmlFor="contato-mensagem" className="mb-1 block text-sm font-medium text-foreground">
          Sua mensagem
        </label>
        <textarea id="contato-mensagem" name="message" required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Como podemos ajudar?" rows={4} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-violet-500 focus:outline-none" />
      </div>
      <p aria-live="polite" className="sr-only">
        {state === "loading" ? "Enviando sua mensagem..." : ""}
      </p>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={state === "loading"} className="rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white disabled:opacity-60">
        {state === "loading" ? "Enviando..." : "Enviar mensagem"}
      </button>
      <p className="text-xs text-muted-foreground mt-2">
        Respondemos em até {SELLER.supportResponseDays} dias corridos.
      </p>
    </form>
  );
}
