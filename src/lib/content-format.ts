import type { ContentType } from "@/data/content-hub";

/** Fonte única dos 4 formatos navegáveis (usada pela LeftSidebar e pelo /feed). */
export const FORMAT_ITEMS: { type: ContentType; label: string }[] = [
  { type: "relatorio", label: "Relatórios" },
  { type: "podcast", label: "Podcasts" },
  { type: "video", label: "Vídeos" },
  { type: "pesquisa", label: "Pesquisas" },
];

const VALID_TYPES = FORMAT_ITEMS.map((f) => f.type);

/** Valida o `?formato=` da query string contra o union fechado de `ContentType`. */
export function toContentType(value: string | string[] | undefined): ContentType | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return VALID_TYPES.find((t) => t === v);
}

export function formatLabel(type: ContentType): string {
  return FORMAT_ITEMS.find((f) => f.type === type)?.label ?? type;
}
