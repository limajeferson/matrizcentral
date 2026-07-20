"use client";

import { useEffect } from "react";

export type ReadTrackerProps = {
  contentId: string;
  slug: string;
  index: number;
};

/**
 * Sem UI: registra a leitura da seção corrente (`POST /api/leitura`). A
 * seção já está na tela ao montar — não há o que medir além disso, por isso
 * um único disparo (sem `setInterval`, sem tracking de scroll). Refaz o
 * disparo quando `slug`/`index` mudam (navegação entre seções sem reload de
 * página reaproveita esta instância). Falha de rede é silenciosa: registrar
 * leitura NUNCA pode atrapalhar quem está lendo.
 */
export function ReadTracker({ contentId, slug, index }: ReadTrackerProps) {
  useEffect(() => {
    fetch("/api/leitura", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentId, slug, index }),
    }).catch(() => {
      // Silencioso de propósito.
    });
  }, [contentId, slug, index]);

  return null;
}

export default ReadTracker;
