import type { ComponentType } from "react";
import type { ContentType } from "@/data/content-hub";
import { IconReport, IconPodcast, IconVideo, IconSurvey, type IconProps } from "@/components/ui/icons";

const ICON_NAME: Record<ContentType, "report" | "podcast" | "video" | "survey"> = {
  relatorio: "report",
  podcast: "podcast",
  video: "video",
  pesquisa: "survey",
};

export function contentIconName(type: ContentType): "report" | "podcast" | "video" | "survey" {
  return ICON_NAME[type];
}

export const CONTENT_ICON: Record<ContentType, ComponentType<IconProps>> = {
  relatorio: IconReport,
  podcast: IconPodcast,
  video: IconVideo,
  pesquisa: IconSurvey,
};
