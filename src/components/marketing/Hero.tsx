"use client";

import { useState } from "react";
import DemoWidget from "@/components/marketing/DemoWidget";
import Eyebrow from "@/components/marketing/Eyebrow";

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
    <section id="hero" className="mx-auto max-w-6xl px-6 pb-10 pt-16 text-center sm:pt-20">
      <div className="mx-auto max-w-3xl">
        <Eyebrow className="mb-6">Para quem quer dominar IA — programando ou não</Eyebrow>
        <h1 className="mx-auto mb-5 max-w-xl text-[clamp(2.25rem,5vw,3.5rem)] font-bold leading-[1.1] tracking-tight text-zinc-900">
          Construa Seu Próprio ChatGPT Particular em Poucos Minutos
        </h1>
        <p className="mx-auto mb-7 max-w-md text-[15px] text-zinc-600">
          O guia definitivo para ter sua própria IA rodando no seu computador —
          sem pagar mensalidade, sem depender da nuvem e sem precisar ser
          especialista.
        </p>

        <div className="mx-auto flex max-w-md flex-col justify-center gap-3 sm:flex-row">
          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 rounded-full border border-zinc-200 px-5 py-3 text-sm focus:border-violet-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleCheckout}
            disabled={loading}
            className="rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
          >
            {loading ? "Redirecionando..." : "Quero por R$47"}
          </button>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <p className="mt-4 text-sm text-zinc-500">
          Pare de Pagar por IA — Monte sua própria IA Local em menos de uma hora.
        </p>
      </div>

      <DemoWidget />
    </section>
  );
}
