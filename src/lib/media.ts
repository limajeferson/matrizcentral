export type MediaSource =
  | { kind: "youtube"; id: string; embedSrc: string; thumbnailUrl: string }
  | { kind: "spotify"; embedSrc: string; height: number }
  | { kind: "generic"; embedSrc: string };

const YOUTUBE_RE = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=|shorts\/))([\w-]{11})/;
const SPOTIFY_RE = /open\.spotify\.com\/(?:embed\/)?(track|episode|show|playlist|album)\/([A-Za-z0-9]+)/;

/** Fonte única de parsing de embedUrl (YouTube/Spotify/genérico). */
export function parseMediaSource(embedUrl: string | null): MediaSource | null {
  if (!embedUrl) return null;
  const yt = embedUrl.match(YOUTUBE_RE);
  if (yt) {
    const id = yt[1];
    return {
      kind: "youtube",
      id,
      embedSrc: `https://www.youtube.com/embed/${id}`,
      thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    };
  }
  const sp = embedUrl.match(SPOTIFY_RE);
  if (sp) {
    return {
      kind: "spotify",
      embedSrc: `https://open.spotify.com/embed/${sp[1]}/${sp[2]}`,
      height: sp[1] === "track" || sp[1] === "episode" ? 152 : 232,
    };
  }
  return { kind: "generic", embedSrc: embedUrl };
}

export function withAutoplay(src: string): string {
  return `${src}${src.includes("?") ? "&" : "?"}autoplay=1`;
}
