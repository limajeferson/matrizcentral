"use client";

import { useState } from "react";
import DemoWidget from "@/components/marketing/DemoWidget";

export default function Hero() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!email) {
      setError("Informe seu e-mail para continuar.");
      return;
    }

    setLoading(true);
    setError(null);

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      setLoading(false);
      setError("Não foi possível iniciar o checkout. Tente novamente.");
      return;
    }

    const { url } = await response.json();
    window.location.href = url;
  };

  return (
    <section id="hero" className="mx-auto max-w-3xl px-6 py-24 text-center">
      <span className="mb-6 inline-block rounded-full bg-violet-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-violet-700">
        Para devs brasileiros
      </span>
      <h1 className="mb-4 text-4xl font-bold text-zinc-900 sm:text-5xl">
        Construa Seu Próprio ChatGPT Particular em Poucos Minutos
      </h1>
      <p className="mb-8 text-lg text-zinc-600">
        O Guia Definitivo para Rodar LLMs Localmente e Nunca Mais Pagar por
        Tokens ou Mensalidades.
      </p>

      <div className="mx-auto flex max-w-md flex-col justify-center gap-3 sm:flex-row">
        <input
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-xl border-2 border-zinc-200 px-4 py-3 focus:border-violet-400 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleCheckout}
          disabled={loading}
          className="rounded-xl bg-violet-600 px-6 py-3 font-bold text-white transition hover:bg-violet-700 disabled:opacity-50"
        >
          {loading ? "Redirecionando..." : "Quero por R$47"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <p className="mt-4 text-sm text-zinc-500">
        Pare de Pagar por IA — Monte sua própria IA Local em menos de uma hora.
      </p>

      <DemoWidget />
    </section>
  );
}
