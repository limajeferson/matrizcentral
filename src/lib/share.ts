export type SharePlatform = "whatsapp" | "x" | "linkedin";

export function buildShareUrl(platform: SharePlatform, url: string, text: string): string {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  switch (platform) {
    case "whatsapp":
      return `https://wa.me/?text=${t}%20${u}`;
    case "x":
      return `https://twitter.com/intent/tweet?text=${t}&url=${u}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
  }
}

/** Guarda de segurança: URLs /dashboard/<token>/... dão acesso à conta e NUNCA
 *  podem ser compartilhadas. */
export function isTokenizedPath(url: string): boolean {
  return /\/dashboard\/[^/]+/.test(url);
}
