import type { ContentItem, ContentType } from "@/data/content-hub";
import { contentHref } from "@/lib/feed";

/** Janela (em dias) em que um conteúdo publicado aparece nas histórias. */
export const STORY_WINDOW_DAYS = 7;
/** Duração de cada slide antes do auto-avanço (ms). */
export const STORY_DURATION_MS = 15_000;

export type StorySlide = {
  contentId: string;
  type: ContentType;
  title: string;
  /** Gancho atrativo do conteúdo (chamada/descrição). */
  hook: string;
  /** CTA — respeita o gating existente (mesma rota de buildContentFeed). */
  href: string;
  ctaLabel: string;
  embedUrl: string | null;
  emBreve: boolean;
};

export type StoryGroup = {
  type: ContentType;
  label: string;
  slides: StorySlide[];
};

const GROUP_ORDER: ContentType[] = ["relatorio", "podcast", "video", "pesquisa"];

const GROUP_LABEL: Record<ContentType, string> = {
  relatorio: "Relatórios",
  podcast: "Podcasts",
  video: "Vídeos",
  pesquisa: "Pesquisas",
};

const CTA_LABEL: Record<ContentType, string> = {
  relatorio: "Ler agora",
  podcast: "Ouvir",
  video: "Assistir",
  pesquisa: "Responder",
};

function withinWindow(publishedAt: string | undefined, now: Date, days: number): boolean {
  if (!publishedAt) return false;
  const t = new Date(publishedAt).getTime();
  if (Number.isNaN(t)) return false;
  const diff = now.getTime() - t;
  return diff >= 0 && diff <= days * 86_400_000;
}

function isEmBreve(item: ContentItem): boolean {
  return item.embedUrl === null && item.type !== "relatorio" && item.type !== "pesquisa";
}

/**
 * Deriva as histórias do feed a partir do conteúdo publicado nos últimos
 * STORY_WINDOW_DAYS dias, agrupado por categoria. `now` é injetado para manter
 * a função pura/determinística (o server component passa `new Date()`).
 */
export function buildStories(items: ContentItem[], now: Date, token?: string): StoryGroup[] {
  const fresh = items.filter((i) => withinWindow(i.publishedAt, now, STORY_WINDOW_DAYS));
  return GROUP_ORDER.map((type) => {
    const slides: StorySlide[] = fresh
      .filter((i) => i.type === type)
      .sort((a, b) => new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime())
      .map((i) => ({
        contentId: i.id,
        type: i.type,
        title: i.title,
        hook: i.description,
        href: contentHref(i.id, token),
        ctaLabel: CTA_LABEL[i.type],
        embedUrl: i.embedUrl,
        emBreve: isEmBreve(i),
      }));
    return { type, label: GROUP_LABEL[type], slides };
  }).filter((g) => g.slides.length > 0);
}
