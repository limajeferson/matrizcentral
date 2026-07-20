import { describe, it, expect } from "vitest";
import { parseMarkdown } from "./markdown";
import { splitIntoSections, findSection } from "./reader";

describe("splitIntoSections", () => {
  it("corta por heading nivel 2 e preserva o titulo", () => {
    const s = splitIntoSections(parseMarkdown("## Um\ntexto a\n\n## Dois\ntexto b"));
    expect(s.map((x) => x.title)).toEqual(["Um", "Dois"]);
    expect(s.map((x) => x.index)).toEqual([0, 1]);
    expect(s[0].slug).toBe("um");
  });

  it("coloca conteudo antes do primeiro ## numa secao de abertura", () => {
    const s = splitIntoSections(parseMarkdown("# Titulo\nintro\n\n## Um\ntexto"));
    expect(s).toHaveLength(2);
    expect(s[0].index).toBe(0);
    expect(s[1].title).toBe("Um");
  });

  it("documento sem ## vira uma unica secao", () => {
    const s = splitIntoSections(parseMarkdown("# So titulo\num paragrafo"));
    expect(s).toHaveLength(1);
    expect(s[0].index).toBe(0);
  });

  it("documento vazio devolve lista vazia", () => {
    expect(splitIntoSections(parseMarkdown(""))).toEqual([]);
  });

  it("desambigua slugs repetidos", () => {
    const s = splitIntoSections(parseMarkdown("## Setup\na\n\n## Setup\nb"));
    expect(s[0].slug).not.toBe(s[1].slug);
    expect(new Set(s.map((x) => x.slug)).size).toBe(2);
  });

  it("h3 e h4 ficam DENTRO da secao, nao criam secao nova", () => {
    const s = splitIntoSections(parseMarkdown("## Um\n### Sub\ntexto\n#### Sub2"));
    expect(s).toHaveLength(1);
    expect(s[0].blocks.length).toBeGreaterThan(1);
  });
});

describe("findSection", () => {
  const sections = splitIntoSections(parseMarkdown("## Um\na\n\n## Dois\nb"));

  it("sem slug devolve a primeira", () => {
    expect(findSection(sections, undefined)?.index).toBe(0);
  });

  it("slug desconhecido devolve a primeira (nao quebra link velho)", () => {
    expect(findSection(sections, "nao-existe")?.index).toBe(0);
  });

  it("acha pelo slug", () => {
    expect(findSection(sections, "dois")?.index).toBe(1);
  });

  it("lista vazia devolve null", () => {
    expect(findSection([], "um")).toBeNull();
  });
});
