import { describe, it, expect } from "vitest";
import { parseMarkdown, extractHeadings, slugify } from "./markdown";

describe("slugify", () => {
  it("minúsculas, sem acento, hífens", () => {
    expect(slugify("1. Introdução às LLMs Locais")).toBe("1-introducao-as-llms-locais");
  });
});

describe("parseMarkdown", () => {
  it("headings 1-4 com id; dedupe com sufixo", () => {
    const blocks = parseMarkdown("# Título\n#### Seção\n#### Seção");
    expect(blocks).toEqual([
      { kind: "heading", level: 1, text: "Título", id: "titulo" },
      { kind: "heading", level: 4, text: "Seção", id: "secao" },
      { kind: "heading", level: 4, text: "Seção", id: "secao-2" },
    ]);
  });
  it("desescapa \\. em texto de heading e parágrafo", () => {
    const blocks = parseMarkdown("#### 1\\. Intro\ntexto 2\\. aqui");
    expect(blocks[0]).toMatchObject({ text: "1. Intro", id: "1-intro" });
    expect(blocks[1]).toEqual({ kind: "paragraph", text: "texto 2. aqui" });
  });
  it("agrupa lista e parseia tabela pipe (ignora separador)", () => {
    const blocks = parseMarkdown(
      "- a\n- b\n\n| Col1 | Col2 |\n|---|---|\n| x | y |",
    );
    expect(blocks).toEqual([
      { kind: "list", items: ["a", "b"] },
      { kind: "table", header: ["Col1", "Col2"], rows: [["x", "y"]] },
    ]);
  });
});

describe("extractHeadings", () => {
  it("filtra por nível máximo", () => {
    const blocks = parseMarkdown("# A\n#### B\nparágrafo");
    expect(extractHeadings(blocks)).toHaveLength(2);
    expect(extractHeadings(blocks, 3)).toEqual([
      { level: 1, text: "A", id: "a" },
    ]);
  });
});
