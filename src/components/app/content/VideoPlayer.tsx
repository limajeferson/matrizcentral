"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { parseMediaSource, withAutoplay } from "@/lib/media";
import { IconVideo } from "@/components/ui/icons";

type VideoPlayerProps = {
  title: string;
  embedUrl: string | null;
  durationMinutes?: number;
};

/**
 * Player de vídeo (modelo video-player): poster com botão play central que
 * troca para o iframe (autoplay) ao clicar. Estado "em breve" quando não há
 * `embedUrl` reconhecível — sem botão play.
 */
export function VideoPlayer({ title, embedUrl, durationMinutes }: VideoPlayerProps) {
  const source = parseMediaSource(embedUrl);
  const [playing, setPlaying] = useState(false);

  if (!source) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-violet-500/10 to-transparent" />
        <div className="relative flex h-full flex-col items-center justify-center gap-3">
          <IconVideo size={40} className="text-violet-500" />
          <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-600">
            Em breve
          </span>
        </div>
      </div>
    );
  }

  if (playing) {
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
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-card">
      {source.kind === "youtube" ? (
        <img src={source.thumbnailUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-violet-600 via-violet-500 to-violet-700" />
      )}
      <div className="absolute inset-0 bg-black/25" />

      <div className="absolute inset-0 flex items-center justify-center">
        <motion.button
          type="button"
          aria-label={`Reproduzir ${title}`}
          onClick={() => setPlaying(true)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.96 }}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg"
        >
          <svg viewBox="0 0 24 24" width={26} height={26} fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </motion.button>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/70 to-transparent px-4 py-3">
        <p className="truncate text-sm font-medium text-white">{title}</p>
        {durationMinutes != null && (
          <span className="shrink-0 text-xs text-white/80">{durationMinutes} min</span>
        )}
      </div>
    </div>
  );
}

export default VideoPlayer;
