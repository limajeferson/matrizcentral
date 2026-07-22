import type { ContentItem, ContentType } from "@/data/content-hub";
import type { CapacityTier } from "@/lib/capacity";

export type FeedCard = {
  id: string; title: string; description: string; type: ContentType;
  href: string; emBreve: boolean;
  /** Metadados para os cards (duração e recompensa) — enriquecem o feed. */
  durationMinutes: number; xpReward: number;
};

function isEmBreve(item: ContentItem): boolean {
  return item.embedUrl === null && item.type !== "relatorio" && item.type !== "pesquisa";
}

/** Rota de acesso a um conteúdo: com token vai para o dashboard da compra;
 *  sem token cai em /oferta (proxy de "gated"). Fonte única reusada pelas
 *  histórias (`buildStories`) para o CTA respeitar o mesmo gating. */
export function contentHref(id: string, token?: string): string {
  return token ? `/dashboard/${token}/conteudo/${id}` : "/oferta";
}

/** Ordena por afinidade de capacidade — NUNCA filtra. Itens cujo `capacityFit`
 *  inclui o tier do usuário sobem para o topo; os demais mantêm a ordem
 *  original entre si (sort estável via dois filters concatenados). */
export function buildContentFeed(items: ContentItem[], token?: string, tier?: CapacityTier): FeedCard[] {
  const cards = items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    type: item.type,
    emBreve: isEmBreve(item),
    href: contentHref(item.id, token),
    durationMinutes: item.durationMinutes,
    xpReward: item.xpReward,
  }));
  if (!tier) return cards;
  const fits = (id: string) => items.find((i) => i.id === id)?.capacityFit?.includes(tier) ?? false;
  return [...cards.filter((c) => fits(c.id)), ...cards.filter((c) => !fits(c.id))];
}

export type ActivityRow = { display_name: string | null; badge_id: string; earned_at: string };
export type ActivityItem = { text: string; at: string };

export function formatActivity(rows: ActivityRow[], badgeLabel: (id: string) => string): ActivityItem[] {
  return rows
    .filter((r) => r.display_name)
    .map((r) => ({ text: `${r.display_name} conquistou o selo "${badgeLabel(r.badge_id)}"`, at: r.earned_at }))
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}
