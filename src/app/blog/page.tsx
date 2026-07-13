import { BLOG_POSTS } from "@/data/blog";
import { getSortedPosts } from "@/lib/blog";

export const metadata = { title: "Blog — Matriz Central", description: "Artigos sobre IA local: privacidade, custo, hardware e como sair das mensalidades." };

export default function BlogPage() {
  const posts = getSortedPosts(BLOG_POSTS);
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Blog</h1>
      <ul className="space-y-4">
        {posts.map((p) => (
          <li key={p.slug} className="rounded-xl border border-zinc-200 bg-white p-4">
            <a href={`/blog/${p.slug}`} className="text-lg font-semibold text-zinc-900 hover:text-violet-600">{p.title}</a>
            <p className="mt-1 text-sm text-zinc-600">{p.excerpt}</p>
            <p className="mt-2 text-xs text-zinc-400">{new Date(p.date).toLocaleDateString("pt-BR")} · {p.author}</p>
          </li>
        ))}
        {posts.length === 0 && <p className="text-sm text-zinc-500">Em breve, novos artigos.</p>}
      </ul>
    </div>
  );
}
