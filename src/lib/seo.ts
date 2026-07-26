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
 * Monta o openGraph de uma página. Existe porque o Next NÃO faz merge profundo
 * de openGraph entre segmentos: quem declara o campo substitui o objeto do pai
 * inteiro e perde o og:image da convenção — então toda página precisa repetir a
 * imagem, e é melhor repetir por uma função do que por copiar-e-colar.
 */
export function pageOpenGraph(input: {
  title: string;
  description: string;
  path: string;
}) {
  return {
    title: input.title,
    description: input.description,
    url: input.path,
    images: [OG_IMAGE_PATH],
  };
}

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
