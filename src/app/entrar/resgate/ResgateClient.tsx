"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconLock } from "@/components/ui/icons";

// src/data/reader-docs.ts é a fonte única do slug — confirmado ali (EBOOK.slug).
const READER_PATH = "/biblioteca/guia-llm-local";

type Status = "loading" | "error-token" | "error-server";

const ERROR_COPY: Record<Exclude<Status, "loading">, { title: string; body: string }> = {
  "error-token": {
    title: "Não foi possível confirmar seu acesso",
    body: "Esse link de resgate é inválido ou expirou. Se você já tem conta (todo comprador tem), entre com seu e-mail — ou fale com o suporte.",
  },
  "error-server": {
    title: "Não foi possível confirmar seu acesso agora",
    body: "Tivemos um problema por aqui — não é o seu link. Tente de novo em instantes ou fale com o suporte.",
  },
};

/**
 * Troca o token da URL (credencial de quem comprou pelo fluxo antigo, sem
 * conta) por uma sessão de verdade. Chama `POST /api/resgate` — a criação da
 * sessão e o cookie só podem acontecer numa Route Handler, por isso a lógica
 * de sessão vive lá e esta página só orquestra a navegação (mesmo padrão de
 * `AccessReveal`/`/api/checkout-login`: fetch → cookie chega no Set-Cookie da
 * resposta → navegação cheia para o cookie valer no próximo request).
 */
export default function ResgateClient({ token }: { token: string | null }) {
  const [status, setStatus] = useState<Status>(token ? "loading" : "error-token");

  useEffect(() => {
    if (!token) return;
    let active = true;

    (async () => {
      try {
        const res = await fetch("/api/resgate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json().catch(() => null);
        if (active && res.ok && data?.ok) {
          // O token agora vale uma sessão completa de 30 dias (não só um
          // arquivo) — não pode ficar no histórico do navegador nem vazar
          // por Referer. Limpa a query da URL antes de navegar e usa
          // `replace` pra não deixar a URL com token no histórico.
          history.replaceState({}, "", "/entrar/resgate");
          window.location.replace(READER_PATH); // navegação cheia: o cookie novo passa a valer no servidor
          return;
        }
        if (active) setStatus(res.status === 404 ? "error-token" : "error-server");
        return;
      } catch {
        // falha de rede/fetch: não é o token que está errado
      }
      if (active) setStatus("error-server");
    })();

    return () => {
      active = false;
    };
  }, [token]);

  if (status === "loading") {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <p className="text-sm text-muted-foreground">Confirmando seu acesso…</p>
      </div>
    );
  }

  const copy = ERROR_COPY[status];

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <IconLock size={22} />
      </div>
      <h1 className="text-lg font-bold text-foreground">{copy.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{copy.body}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/entrar"
          className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
        >
          Entrar com meu e-mail
        </Link>
        <Link
          href="/suporte"
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
        >
          Falar com o suporte
        </Link>
      </div>
    </div>
  );
}
