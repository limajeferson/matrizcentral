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
      // A rota de progresso de leitura revalida seção contra o .md do disco —
      // sem o tracing, o POST cai no catch e o livro-razão reading_events para
      // de gravar EM SILÊNCIO (achado da review final da Trilha E).
      "/api/leitura": ["./content/**/*"],
    },
  },
};

export default nextConfig;
