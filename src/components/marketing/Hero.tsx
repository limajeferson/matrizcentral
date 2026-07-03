"use client";

import { useState } from "react";

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
    <section className="max-w-3xl mx-auto px-6 py-20 text-center">
      <h1 className="text-4xl font-bold mb-4">
        Construa Seu Próprio ChatGPT Particular em Poucos Minutos
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        O Guia Definitivo para Rodar LLMs Localmente e Nunca Mais Pagar por
        Tokens ou Mensalidades.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
        <input
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-3"
        />
        <button
          type="button"
          onClick={handleCheckout}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold disabled:opacity-50"
        >
          {loading ? "Redirecionando..." : "Quero por R$47"}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

      <p className="text-sm text-gray-500 mt-4">
        Pare de Pagar por IA — Monte sua própria IA Local em menos de uma hora.
      </p>
    </section>
  );
}
