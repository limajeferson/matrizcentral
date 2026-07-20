"use client";

import { useEffect } from "react";

export type ReadTrackerProps = {
  contentId: string;
  slug: string;
  index: number;
  /** Ver `recordRead` em `src/lib/reader-data.ts`: quando true, o evento de
   *  leitura ainda é gravado (auditoria), mas `reading_progress` NÃO é
   *  sobrescrito — usado quando a seção 0 está na tela só porque é o default
   *  da URL sem `?s=`, não porque a pessoa navegou até ali (visita que só
   *  mostra o banner "Você parou em X" não pode apagar essa posição salva). */
  skipProgress?: boolean;
};

/**
 * Sem UI: registra a leitura da seção corrente (`POST /api/leitura`). A
 * seção já está na tela ao montar — não há o que medir além disso, por isso
 * um único disparo (sem `setInterval`, sem tracking de scroll). Refaz o
 * disparo quando `slug`/`index` mudam (navegação entre seções sem reload de
 * página reaproveita esta instância). Falha de rede é silenciosa: registrar
 * leitura NUNCA pode atrapalhar quem está lendo.
 */
export function ReadTracker({ contentId, slug, index, skipProgress }: ReadTrackerProps) {
  useEffect(() => {
    fetch("/api/leitura", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentId, slug, index, skipProgress }),
    }).catch(() => {
      // Silencioso de propósito.
    });
  }, [contentId, slug, index, skipProgress]);

  return null;
}

export default ReadTracker;
