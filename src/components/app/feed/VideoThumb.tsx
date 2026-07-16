"use client";

import { useState } from "react";
import { parseMediaSource, withAutoplay } from "@/lib/media";

export type VideoThumbProps = {
  title: string;
  /** Embed (YouTube). null = ainda não publicado ("em breve", sem play). */
  embedUrl: string | null;
  durationMinutes?: number;
};

/**
 * Thumbnail de vídeo (modelo video-thumbnail-player): capa + botão play central +
 * selo de duração + título overlay. Clique troca a capa pelo iframe do embed
 * (autoplay). Enquanto `embedUrl===null`, mostra estado "em breve" sem play.
 */
export function VideoThumb({ title, embedUrl, durationMinutes }: VideoThumbProps) {
  const [playing, setPlaying] = useState(false);
  const emBreve = !embedUrl;
  const source = embedUrl ? parseMediaSource(embedUrl) : null;
  const thumb = source?.kind === "youtube" ? source.thumbnailUrl : null;
  const src = embedUrl ? withAutoplay(embedUrl) : "";

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {playing && embedUrl ? (
        <div className="aspect-video w-full bg-black">
          <iframe
            src={src}
            title={title}
            className="h-full w-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </div>
      ) : (
        <button
          type="button"
          disabled={emBreve}
          onClick={() => setPlaying(true)}
          aria-label={emBreve ? `${title} (em breve)` : `Assistir: ${title}`}
          className="relative block aspect-video w-full"
        >
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb} alt="" loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-violet-600 to-violet-900" />
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            {emBreve ? (
              <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-200">
                Em breve
              </span>
            ) : (
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/60 text-white">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            )}
          </div>
          {typeof durationMinutes === "number" && (
            <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
              {durationMinutes} min
            </span>
          )}
          <span className="absolute inset-x-2 bottom-2 truncate pr-14 text-left text-sm font-semibold text-white drop-shadow">
            {title}
          </span>
        </button>
      )}
    </div>
  );
}

export default VideoThumb;
