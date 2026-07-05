import { CONTENT_HUB, type ContentItem, type ContentType } from "@/data/content-hub";

export interface FormatStat {
  type: ContentType | "apresentacao";
  label: string;
  icon: string;
  count: number;
}

/** Apresentações existem como assets (.pptx/.png) mas ainda não estão no CONTENT_HUB. */
const APRESENTACOES_COUNT = 3;

const FORMAT_ORDER: { type: ContentType | "apresentacao"; label: string; icon: string }[] = [
  { type: "relatorio", label: "Relatórios", icon: "📄" },
  { type: "podcast", label: "Podcasts", icon: "🎙️" },
  { type: "video", label: "Vídeos", icon: "🎬" },
  { type: "apresentacao", label: "Apresentações", icon: "🖥️" },
  { type: "pesquisa", label: "Pesquisas", icon: "📊" },
];

/** Contagem de itens por formato, na ordem de exibição. */
export function formatCounts(items: ContentItem[] = CONTENT_HUB): FormatStat[] {
  return FORMAT_ORDER.map((f) => ({
    ...f,
    count:
      f.type === "apresentacao"
        ? APRESENTACOES_COUNT
        : items.filter((i) => i.type === f.type).length,
  }));
}
