"use client";

import { useState } from "react";

type State = "idle" | "loading" | "sent" | "no-account" | "error";

export default function EntrarForm({ initialError = false }: { initialError?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/auth/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        setState("error");
        return;
      }
      const data = await res.json();
      setState(data.status === "no-account" ? "no-account" : "sent");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <p className="rounded-lg bg-green-50 p-4 text-green-800">
        Link enviado! Confira seu e-mail (<strong>{email}</strong>) e clique no
        link para entrar. Ele vale por 15 minutos.
      </p>
    );
  }

  if (state === "no-account") {
    return (
      <div className="rounded-lg bg-amber-50 p-4 text-amber-900">
        <p className="mb-3">Esse e-mail ainda não tem acesso à Matriz Central.</p>
        <a
          href="/oferta"
          className="inline-block rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white"
        >
          Adquirir acesso
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {initialError && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          Link inválido ou expirado. Peça um novo abaixo.
        </p>
      )}
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="seu@email.com"
        className="w-full rounded-lg border px-4 py-2"
      />
      <button
        type="submit"
        disabled={state === "loading"}
        className="w-full rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
      >
        {state === "loading" ? "Enviando..." : "Enviar link de acesso"}
      </button>
      {state === "error" && (
        <p className="text-sm text-red-600">Algo deu errado. Tente novamente.</p>
      )}
    </form>
  );
}
