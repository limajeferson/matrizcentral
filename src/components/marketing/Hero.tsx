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
    <div className="container hero" id="hero">
      <span className="badge mono">
        <i>✦</i> Para quem quer dominar IA — programando ou não
      </span>
      <h1>Construa Seu Próprio ChatGPT Particular em Poucos Minutos</h1>
      <p>
        O guia definitivo para ter sua própria IA rodando no seu computador —
        sem pagar mensalidade, sem depender da nuvem e sem precisar ser
        especialista.
      </p>

      <div className="hero-cta">
        <input
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="email-input"
        />
        <button
          type="button"
          className="btn btn-accent"
          onClick={handleCheckout}
          disabled={loading}
        >
          {loading ? "Redirecionando..." : "Quero por R$47"}
        </button>
      </div>

      {error && <p className="hero-error">{error}</p>}

      <p className="hero-note">
        Pare de Pagar por IA — Monte sua própria IA Local em menos de uma hora.
      </p>

      <DemoWidget />
    </div>
  );
}
