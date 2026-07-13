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
];
