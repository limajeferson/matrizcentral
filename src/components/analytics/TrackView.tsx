"use client";

import { useEffect, useRef } from "react";
import type { FunnelEvent } from "@/lib/funnel";

/** Dispara um evento de funil uma única vez, quando a página monta. */
export default function TrackView({ event }: { event: FunnelEvent }) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
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
  }, [event]);
  return null;
}
