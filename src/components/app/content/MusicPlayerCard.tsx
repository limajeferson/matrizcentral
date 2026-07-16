"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { parseMediaSource, withAutoplay } from "@/lib/media";
import { IconHeadphones } from "@/components/ui/icons";

type MusicPlayerCardProps = {
  title: string;
  description?: string;
  embedUrl: string | null;
  durationMinutes?: number;
};

/**
 * Player de áudio (modelo music-player-card): artwork + play; ao clicar, o
 * card cede lugar ao embed (Spotify com altura própria, YouTube/genérico em
 * 16:9 com autoplay). Estado "em breve" quando não há `embedUrl` reconhecível.
 */
export function MusicPlayerCard({ title, description, embedUrl, durationMinutes }: MusicPlayerCardProps) {
  const source = parseMediaSource(embedUrl);
  const [playing, setPlaying] = useState(false);

  if (playing && source) {
    if (source.kind === "spotify") {
      return (
        <iframe
          src={source.embedSrc}
          height={source.height}
          className="w-full rounded-xl"
          allow="autoplay; encrypted-media"
          title={title}
        />
      );
    }
    return (
      <iframe
        src={withAutoplay(source.embedSrc)}
        className="aspect-video w-full rounded-2xl"
        allow="autoplay; encrypted-media"
        allowFullScreen
        title={title}
      />
    );
  }

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-violet-500 to-violet-700">
        <IconHeadphones size={32} className="text-white" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-foreground">{title}</p>
        {description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{description}</p>
        )}
        {durationMinutes != null && (
          <p className="mt-1 text-xs text-muted-foreground">{durationMinutes} min</p>
        )}
      </div>

      {source ? (
        <motion.button
          type="button"
          aria-label={`Ouvir ${title}`}
          onClick={() => setPlaying(true)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.96 }}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg"
        >
          <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </motion.button>
      ) : (
        <span className="shrink-0 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-600">
          Em breve
        </span>
      )}
    </div>
  );
}

export default MusicPlayerCard;
