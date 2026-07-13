import type { ContentItem, ContentType } from "@/data/content-hub";

export type FeedCard = {
  id: string; title: string; description: string; type: ContentType;
  emoji: string; href: string; emBreve: boolean;
};

const EMOJI: Record<ContentType, string> = {
  relatorio: "📄", podcast: "🎧", video: "🎬", pesquisa: "📊",
};

function isEmBreve(item: ContentItem): boolean {
  return item.embedUrl === null && item.type !== "relatorio" && item.type !== "pesquisa";
}

export function buildContentFeed(items: ContentItem[], token?: string): FeedCard[] {
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    type: item.type,
    emoji: EMOJI[item.type],
    emBreve: isEmBreve(item),
    href: token ? `/dashboard/${token}/conteudo/${item.id}` : "/oferta",
  }));
}

export type ActivityRow = { display_name: string | null; badge_id: string; earned_at: string };
export type ActivityItem = { text: string; at: string };

export function formatActivity(rows: ActivityRow[], badgeLabel: (id: string) => string): ActivityItem[] {
  return rows
    .filter((r) => r.display_name)
    .map((r) => ({ text: `${r.display_name} conquistou o selo "${badgeLabel(r.badge_id)}"`, at: r.earned_at }))
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}
