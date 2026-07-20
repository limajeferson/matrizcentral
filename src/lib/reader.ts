import { slugify, type MdBlock } from "./markdown";

export type ReaderSection = { index: number; slug: string; title: string; blocks: MdBlock[] };

/** Corta os blocos em seções por heading de nível 2. Conteúdo antes do primeiro
 *  `##` vira a seção de abertura (índice 0). Slugs repetidos são desambiguados. */
export function splitIntoSections(blocks: MdBlock[]): ReaderSection[] {
  const sections: ReaderSection[] = [];
  const used = new Map<string, number>();

  const push = (title: string, initial: MdBlock[]) => {
    const base = slugify(title) || `secao-${sections.length + 1}`;
    const n = (used.get(base) ?? 0) + 1;
    used.set(base, n);
    sections.push({
      index: sections.length,
      slug: n === 1 ? base : `${base}-${n}`,
      title,
      blocks: initial,
    });
  };

  for (const b of blocks) {
    if (b.kind === "heading" && b.level === 2) {
      push(b.text, [b]);
      continue;
    }
    if (sections.length === 0) {
      const title = b.kind === "heading" ? b.text : "Início";
      push(title, [b]);
      continue;
    }
    sections[sections.length - 1].blocks.push(b);
  }
  return sections;
}

/** Resolve a seção pedida. Slug ausente ou desconhecido → primeira seção
 *  (link antigo nunca vira erro). Lista vazia → null. */
export function findSection(sections: ReaderSection[], slug?: string): ReaderSection | null {
  if (sections.length === 0) return null;
  if (!slug) return sections[0];
  return sections.find((s) => s.slug === slug) ?? sections[0];
}
