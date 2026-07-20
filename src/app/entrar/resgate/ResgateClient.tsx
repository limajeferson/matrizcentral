"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconLock } from "@/components/ui/icons";

// src/data/reader-docs.ts é a fonte única do slug — confirmado ali (EBOOK.slug).
const READER_PATH = "/biblioteca/guia-llm-local";

type Status = "loading" | "error";

/**
 * Troca o token da URL (credencial de quem comprou pelo fluxo antigo, sem
 * conta) por uma sessão de verdade. Chama `POST /api/resgate` — a criação da
 * sessão e o cookie só podem acontecer numa Route Handler, por isso a lógica
 * de sessão vive lá e esta página só orquestra a navegação (mesmo padrão de
 * `AccessReveal`/`/api/checkout-login`: fetch → cookie chega no Set-Cookie da
 * resposta → navegação cheia para o cookie valer no próximo request).
 */
export default function ResgateClient({ token }: { token: string | null }) {
  const [status, setStatus] = useState<Status>(token ? "loading" : "error");

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
          window.location.href = READER_PATH; // navegação cheia: o cookie novo passa a valer no servidor
          return;
        }
      } catch {
        // cai no estado de erro abaixo
      }
      if (active) setStatus("error");
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

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <IconLock size={22} />
      </div>
      <h1 className="text-lg font-bold text-foreground">Não foi possível confirmar seu acesso</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Esse link de resgate é inválido ou expirou. Fale com o suporte para recuperar o acesso
        ao seu material.
      </p>
      <Link
        href="/suporte"
        className="mt-6 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
      >
        Falar com o suporte
      </Link>
    </div>
  );
}
