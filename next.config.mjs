/** @type {import('next').NextConfig} */
const nextConfig = {
  // Os corpos em markdown (ebook, relatórios, blog) vivem em content/ e são
  // lidos do disco em RUNTIME (fs.readFile com caminho dinâmico). O tracing da
  // Vercel não detecta leitura dinâmica → sem isto os .md ficam FORA do bundle
  // serverless e as páginas quebram só em produção (biblioteca/relatórios 500,
  // blog perde o corpo em silêncio). Dev nunca reproduz (lê direto do disco).
  experimental: {
    outputFileTracingIncludes: {
      "/biblioteca/[slug]": ["./content/**/*"],
      "/dashboard/[token]/conteudo/[id]": ["./content/**/*"],
      "/blog/[slug]": ["./content/**/*"],
    },
  },
};

export default nextConfig;
