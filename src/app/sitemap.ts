import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/data/blog";
import { buildSitemapEntries } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemapEntries(
    BLOG_POSTS.map((post) => ({ slug: post.slug, date: post.date }))
  );
}
