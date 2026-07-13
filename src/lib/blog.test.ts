import { describe, it, expect } from "vitest";
import { getSortedPosts, getPostBySlug } from "./blog";
import type { BlogPost } from "@/data/blog";

const posts: BlogPost[] = [
  { slug: "a", title: "A", excerpt: "", date: "2026-01-01", author: "x", bodyPath: "" },
  { slug: "b", title: "B", excerpt: "", date: "2026-03-01", author: "x", bodyPath: "" },
];

describe("getSortedPosts", () => {
  it("ordena por data desc", () => {
    expect(getSortedPosts(posts).map((p) => p.slug)).toEqual(["b", "a"]);
  });
});
describe("getPostBySlug", () => {
  it("acha", () => expect(getPostBySlug(posts, "a")?.title).toBe("A"));
  it("não acha → undefined", () => expect(getPostBySlug(posts, "z")).toBeUndefined());
});
