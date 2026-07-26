/** Origem canônica do site. Sem barra no fim. */
export const SITE_URL = "https://www.matrizcentral.com.br";

/**
 * Imagem de compartilhamento padrão (arquivo de convenção em src/app/).
 * É um PNG estático, não uma rota dinâmica — por isso o Next serve com a
 * extensão no caminho (".png"), diferente do antigo opengraph-image.tsx
 * (ImageResponse), que respondia em "/opengraph-image" sem extensão.
 */
export const OG_IMAGE_PATH = "/opengraph-image.png";

/**
 * Monta o fragmento de metadata (openGraph + twitter + canonical) de uma
 * página. Existe porque o Next NÃO faz merge profundo de metadata entre
 * segmentos: quem declara `openGraph`/`twitter` substitui o objeto do pai
 * inteiro (perde og:image, og:site_name, og:locale, og:type, twitter:title
 * da raiz) — então toda página que declara metadata própria precisa repetir
 * o fragmento inteiro, e é melhor repetir por uma função do que por
 * copiar-e-colar.
 *
 * `path` deve ser relativo (ex.: "/oferta", "/"); `metadataBase` (definido
 * no layout raiz) resolve para absoluto.
 */
export function pageMetadata(input: {
  title: string;
  description: string;
  path: string;
}) {
  return {
    alternates: { canonical: input.path },
    openGraph: {
      type: "website" as const,
      siteName: "Matriz Central",
      locale: "pt_BR",
      title: input.title,
      description: input.description,
      url: input.path,
      images: [OG_IMAGE_PATH],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: input.title,
      description: input.description,
      images: [OG_IMAGE_PATH],
    },
  };
}

/** Metadata de rota privada: a URL destas páginas carrega credencial. */
export const NOINDEX_METADATA = { robots: { index: false, follow: false } } as const;

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
