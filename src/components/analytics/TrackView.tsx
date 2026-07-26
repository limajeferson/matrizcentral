"use client";

import { useEffect, useRef } from "react";
import type { FunnelEvent } from "@/lib/funnel";

/**
 * Dispara um evento de funil quando a página monta.
 *
 * `dedupeKey` é opcional: quando presente, grava a chave em `sessionStorage`
 * depois de disparar e não dispara de novo se ela já existir. Usado em
 * `checkout_success`, medido no cliente numa URL pública — sem isso, recarregar
 * a página de sucesso contaria a conversão duas vezes. (A fonte autoritativa via
 * webhook da Stripe fica para a Onda 5.) `landing_view`/`oferta_view` não usam
 * dedupeKey: pageview repetido ali é semântica correta.
 */
export default function TrackView({
  event,
  dedupeKey,
}: {
  event: FunnelEvent;
  dedupeKey?: string;
}) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    if (dedupeKey) {
      try {
        if (sessionStorage.getItem(dedupeKey)) return;
      } catch {
        // sessionStorage pode lançar em modo restrito (ex.: cookies bloqueados);
        // segue e dispara mesmo assim — pior caso é medir de novo, não quebrar.
      }
    }

    const payload = JSON.stringify({
      event,
      path: window.location.pathname,
      referrer: document.referrer || undefined,
    });
    // sendBeacon nao segura a navegacao; fetch keepalive e o plano B.
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
    } else {
      void fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => null);
    }

    if (dedupeKey) {
      try {
        sessionStorage.setItem(dedupeKey, "1");
      } catch {
        // ignora — mesmo caso acima.
      }
    }
  }, [event, dedupeKey]);
  return null;
}
