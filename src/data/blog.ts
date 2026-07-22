export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO
  author: string;
  bodyPath: string;
  tags?: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "por-que-ia-local",
    title: "Por que rodar IA localmente (e parar de pagar mensalidade)",
    excerpt: "Privacidade, custo e controle: o caso a favor de rodar modelos de IA no seu próprio computador.",
    date: "2026-07-01",
    author: "Matriz Central",
    bodyPath: "content/blog/por-que-ia-local.md",
    tags: ["ia-local", "privacidade", "custo"],
  },
  {
    slug: "quanto-hardware",
    title: "Quanto de hardware você precisa para rodar IA local",
    excerpt: "De CPU comum a GPU dedicada: o que dá pra rodar em cada faixa de máquina.",
    date: "2026-07-08",
    author: "Matriz Central",
    bodyPath: "content/blog/quanto-hardware.md",
    tags: ["hardware", "ia-local"],
  },
  {
    slug: "privacidade-ia-local",
    title: "Privacidade em IA: o que muda quando os dados não saem da sua máquina",
    excerpt: "LGPD, sigilo profissional e dados sensíveis: por que jurídico, saúde e finanças pedem IA local.",
    date: "2026-07-21",
    author: "Matriz Central",
    bodyPath: "content/blog/privacidade-ia-local.md",
    tags: ["privacidade", "ia-local"],
  },
  {
    slug: "custo-real-assinaturas-ia",
    title: "O custo real de 12 meses de assinatura de IA (e a alternativa do passe único)",
    excerpt: "Assinatura mensal parece barata até você multiplicar por 12. Faça a conta antes de assinar mais uma.",
    date: "2026-07-14",
    author: "Matriz Central",
    bodyPath: "content/blog/custo-real-assinaturas-ia.md",
    tags: ["custo", "ia-local"],
  },
  {
    slug: "casos-de-uso-ia-local",
    title: "5 usos reais de IA local, além do óbvio",
    excerpt: "Produtividade, estudo, pequeno negócio e automação: cinco aplicações práticas de IA rodando localmente.",
    date: "2026-07-07",
    author: "Matriz Central",
    bodyPath: "content/blog/casos-de-uso-ia-local.md",
    tags: ["casos-de-uso", "ia-local"],
  },
];
