import type { ContentType } from "@/data/content-hub";

/**
 * Identidade visual por tipo de conteúdo. Cada tipo ganha um acento próprio
 * (chip do ícone, cor do rótulo, brilho do pôster e realce no hover) para o
 * feed deixar de ser uma parede de texto e "dar cara" a cada formato — sempre
 * dentro da paleta da marca (violeta lidera; azul/âmbar/verde como semânticos;
 * NUNCA rosa). Classes completas e estáticas (Tailwind não faz purge de
 * concatenação).
 */
export type ContentAccent = {
  label: string;
  /** fundo do chip do ícone (tint leve) */
  chipBg: string;
  /** cor do ícone/rótulo do tipo */
  fg: string;
  /** brilho difuso de canto (from-…) */
  glow: string;
  /** gradiente saturado do pôster do rail (from-…/via-…) */
  poster: string;
  /** realce da borda no hover */
  hoverBorder: string;
};

export const CONTENT_ACCENT: Record<ContentType, ContentAccent> = {
  relatorio: {
    label: "Relatório",
    chipBg: "bg-sky-500/15",
    fg: "text-sky-400",
    glow: "from-sky-500/30",
    poster: "from-sky-600/45 via-sky-500/15",
    hoverBorder: "hover:border-sky-500/50",
  },
  pesquisa: {
    label: "Pesquisa",
    chipBg: "bg-amber-500/15",
    fg: "text-amber-400",
    glow: "from-amber-500/30",
    poster: "from-amber-600/45 via-amber-500/15",
    hoverBorder: "hover:border-amber-500/50",
  },
  podcast: {
    label: "Podcast",
    chipBg: "bg-violet-500/15",
    fg: "text-violet-400",
    glow: "from-violet-500/30",
    poster: "from-violet-600/45 via-violet-500/15",
    hoverBorder: "hover:border-violet-500/50",
  },
  video: {
    label: "Vídeo",
    chipBg: "bg-emerald-500/15",
    fg: "text-emerald-400",
    glow: "from-emerald-500/30",
    poster: "from-emerald-600/45 via-emerald-500/15",
    hoverBorder: "hover:border-emerald-500/50",
  },
};

/** Metadado curto e persuasivo: "12 min · +40 XP". */
export function contentMeta(durationMinutes?: number, xpReward?: number): string {
  const parts: string[] = [];
  if (durationMinutes) parts.push(`${durationMinutes} min`);
  if (xpReward) parts.push(`+${xpReward} XP`);
  return parts.join(" · ");
}
