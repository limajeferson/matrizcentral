import type { ContentItem, ContentType } from "@/data/content-hub";

const TYPES: ContentType[] = ["relatorio", "podcast", "video", "pesquisa"];

/** Uma categoria está "em breve" quando NÃO tem nenhum item publicado.
 *  Relatório/pesquisa são sempre publicados (não dependem de embed). */
export function formatAvailability(
  items: ContentItem[],
): Record<ContentType, { emBreve: boolean }> {
  const out = {} as Record<ContentType, { emBreve: boolean }>;
  for (const type of TYPES) {
    if (type === "relatorio" || type === "pesquisa") {
      out[type] = { emBreve: false };
      continue;
    }
    const anyPublished = items.some((i) => i.type === type && i.embedUrl !== null);
    out[type] = { emBreve: !anyPublished };
  }
  return out;
}
