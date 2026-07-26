/** Origem canônica do site. Sem barra no fim. */
export const SITE_URL = "https://www.matrizcentral.com.br";

/**
 * Caminhos que nunca podem ser indexados nem entrar no sitemap: área logada,
 * APIs, leitor protegido, checkout e páginas por token/código.
 * Entrada terminada em "/" é prefixo; sem "/" casa exata ou seguida de "/".
 */
export const PRIVATE_PATH_PREFIXES = [
  "/api/",
  "/dashboard/",
  "/checkout/",
  "/biblioteca/",
  "/certificado/",
  "/quiz/",
  "/conta",
  "/feed",
  "/forum",
  "/entrar",
] as const;

export function isPrivatePath(path: string): boolean {
  return PRIVATE_PATH_PREFIXES.some((prefix) =>
    prefix.endsWith("/")
      ? path.startsWith(prefix)
      : path === prefix || path.startsWith(`${prefix}/`)
  );
}

export interface SitemapEntry {
  url: string;
  lastModified?: string;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
}

const STATIC_ROUTES: Array<Omit<SitemapEntry, "url"> & { path: string }> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/oferta", changeFrequency: "weekly", priority: 0.9 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
  { path: "/sobre", changeFrequency: "monthly", priority: 0.5 },
  { path: "/suporte", changeFrequency: "monthly", priority: 0.5 },
  { path: "/legal/termos", changeFrequency: "yearly", priority: 0.3 },
  { path: "/legal/privacidade", changeFrequency: "yearly", priority: 0.3 },
];

export function buildSitemapEntries(
  posts: Array<{ slug: string; date: string }>
): SitemapEntry[] {
  const entries: SitemapEntry[] = STATIC_ROUTES.map(({ path, ...rest }) => ({
    url: `${SITE_URL}${path}`,
    ...rest,
  }));
  for (const post of posts) {
    entries.push({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.date,
      changeFrequency: "yearly",
      priority: 0.6,
    });
  }
  return entries;
}
