import { readFile } from "fs/promises";
import path from "path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BLOG_POSTS } from "@/data/blog";
import { getPostBySlug } from "@/lib/blog";
import Markdown from "@/components/ui/Markdown";

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPostBySlug(BLOG_POSTS, params.slug);
  if (!post) return { title: "Artigo não encontrado — Matriz Central" };
  return { title: `${post.title} — Matriz Central`, description: post.excerpt };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(BLOG_POSTS, params.slug);
  if (!post) notFound();

  let body = "";
  try { body = await readFile(path.join(process.cwd(), post.bodyPath), "utf-8"); } catch { body = post.excerpt; }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <article>
        <h1 className="text-2xl font-bold text-zinc-900">{post.title}</h1>
        <p className="mt-1 text-xs text-zinc-400">{new Date(post.date).toLocaleDateString("pt-BR")} · {post.author}</p>
        <div className="mt-4"><Markdown source={body} /></div>
      </article>
      <div className="rounded-xl border border-violet-200 bg-violet-50 p-5 text-center">
        <p className="font-semibold text-zinc-900">Quer sair das mensalidades de IA?</p>
        <p className="mt-1 text-sm text-zinc-600">Descubra seu roadmap de IA local por R$47 — pagamento único.</p>
        <a href="/oferta" className="mt-3 inline-block rounded-lg bg-violet-600 px-5 py-2 font-semibold text-white">Começar por R$47</a>
      </div>
    </div>
  );
}
