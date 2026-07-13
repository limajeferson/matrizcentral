"use client";

import { useEffect, useState, type FormEvent } from "react";

type ResendState = "idle" | "sending" | "done" | "error";

/**
 * Após a compra, tenta LOGAR o usuário automaticamente pelo session_id da
 * Stripe (o webhook cria a conta; aqui a sessão é minted sem depender de
 * e-mail) e leva para /feed. Enquanto o webhook processa, faz polling curto.
 * O reenvio por e-mail continua como rede de segurança.
 */
export default function AccessReveal({ sessionId }: { sessionId: string | null }) {
  const [checking, setChecking] = useState<boolean>(Boolean(sessionId));
  const [email, setEmail] = useState("");
  const [resend, setResend] = useState<ResendState>("idle");

  useEffect(() => {
    if (!sessionId) {
      setChecking(false);
      return;
    }
    let active = true;
    let tries = 0;

    const poll = async () => {
      tries += 1;
      try {
        const res = await fetch("/api/checkout-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json().catch(() => null);
        if (active && data?.ready) {
          window.location.href = "/feed"; // navegação cheia: o cookie novo passa a valer no servidor
          return;
        }
      } catch {
        // ignora e tenta de novo
      }
      if (active && tries < 12) {
        setTimeout(poll, 2500);
      } else if (active) {
        setChecking(false);
      }
    };

    poll();
    return () => {
      active = false;
    };
  }, [sessionId]);

  const handleResend = async (e: FormEvent) => {
    e.preventDefault();
    if (resend === "sending") return;
    setResend("sending");
    try {
      const res = await fetch("/api/resend-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResend(res.ok ? "done" : "error");
    } catch {
      setResend("error");
    }
  };

  return (
    <>
      <p>
        {checking
          ? "Preparando seu acesso — entrando na sua conta…"
          : "Sua conta está pronta. Entre para acessar seu feed."}
      </p>
      {!checking && (
        <a className="mc-checkout-cta" href="/entrar">
          Entrar na minha conta →
        </a>
      )}
      {resend === "done" ? (
        <p className="mc-checkout-hint">
          ✓ Se este e-mail tiver uma compra, o link de acesso foi reenviado.
        </p>
      ) : (
        <form className="mc-resend" onSubmit={handleResend}>
          <label htmlFor="resend-email" className="mc-sr-only">Seu e-mail</label>
          <input
            id="resend-email"
            type="email"
            required
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Seu e-mail"
          />
          <button type="submit" disabled={resend === "sending"}>
            {resend === "sending" ? "Enviando…" : "Não recebeu? Reenviar"}
          </button>
        </form>
      )}
      {resend === "error" && (
        <p className="mc-checkout-hint">
          Não foi possível reenviar agora. Tente novamente em instantes.
        </p>
      )}
    </>
  );
}
