import type { ReactNode } from "react";

export type IconProps = {
  size?: number;
  className?: string;
  title?: string;
};

type IconFactoryProps = IconProps & { children: ReactNode; viewBox?: string };

/** Base SVG wrapper: viewBox 24, currentColor stroke, sem preenchimento. */
function IconBase({ size, className, title, children, viewBox = "0 0 24 24" }: IconFactoryProps) {
  const decorative = !title;
  return (
    <svg
      viewBox={viewBox}
      width={size ?? 20}
      height={size ?? 20}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={decorative ? true : undefined}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}
      {children}
    </svg>
  );
}

function makeIcon(paths: ReactNode, viewBox?: string) {
  return function Icon(props: IconProps) {
    return (
      <IconBase {...props} viewBox={viewBox}>
        {paths}
      </IconBase>
    );
  };
}

export const IconSearch = makeIcon(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </>
);

export const IconBell = makeIcon(
  <>
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.7 21a2 2 0 0 1-3.4 0" />
  </>
);

export const IconChat = makeIcon(
  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
);

export const IconFeed = makeIcon(
  <>
    <path d="M4 11a9 9 0 0 1 9 9" />
    <path d="M4 4a16 16 0 0 1 16 16" />
    <circle cx="5" cy="19" r="1.5" />
  </>
);

export const IconContent = makeIcon(
  <>
    <path d="M4 4h11l5 5v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" />
    <path d="M15 4v5h5" />
    <path d="M8 13h8M8 17h8" />
  </>
);

export const IconForum = makeIcon(
  <>
    <path d="M8 12h.01M12 12h.01M16 12h.01" />
    <path d="M21 12a8.5 8.5 0 0 1-8.5 8.5 8.4 8.4 0 0 1-3.9-.9L3 21l1.4-4.2A8.4 8.4 0 0 1 3.5 12 8.5 8.5 0 0 1 12 3.5 8.5 8.5 0 0 1 21 12z" />
  </>
);

export const IconAccount = makeIcon(
  <>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </>
);

export const IconSupport = makeIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.5a2.5 2.5 0 0 1 4.9.8c0 1.7-2.4 2-2.4 3.7" />
    <path d="M12 17.5h.01" />
  </>
);

export const IconReport = makeIcon(
  <>
    <path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
    <path d="M15 3v5h5" />
    <path d="M9 13h6M9 17h6M9 9h2" />
  </>
);

export const IconPodcast = makeIcon(
  <>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0" />
    <path d="M12 18v3" />
    <path d="M9 21h6" />
  </>
);

export const IconVideo = makeIcon(
  <>
    <rect x="3" y="6" width="13" height="12" rx="2" />
    <path d="M16 10.5l5-3v9l-5-3z" />
  </>
);

export const IconSurvey = makeIcon(
  <>
    <path d="M4 20V11M10 20V6M16 20v-8" />
    <path d="M3 20h18" />
  </>
);

export const IconBadge = makeIcon(
  <>
    <circle cx="12" cy="9" r="6" />
    <path d="M9 14.5L7 22l5-3 5 3-2-7.5" />
  </>
);

export const IconArrow = makeIcon(<path d="M5 12h14M13 6l6 6-6 6" />);

export const IconCheck = makeIcon(<path d="M5 12.5l4.5 4.5L19 7" />);

export const IconSun = makeIcon(
  <>
    <circle cx="12" cy="12" r="4.5" />
    <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4l1.4-1.4M18 6l1.4-1.4" />
  </>
);

export const IconMoon = makeIcon(<path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z" />);

export const IconChevron = makeIcon(<path d="M6 9l6 6 6-6" />);

export const IconClose = makeIcon(<path d="M6 6l12 12M18 6L6 18" />);

export const IconMenu = makeIcon(<path d="M4 7h16M4 12h16M4 17h16" />);

export const IconMail = makeIcon(
  <>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </>
);

export const IconLock = makeIcon(
  <>
    <rect x="4" y="11" width="16" height="9" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </>
);

// Ícones de conquista (badges) — usados por src/data/badges.ts + BadgeShelf
export const IconCompass = makeIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M15 9l-2 6-6 2 2-6 6-2z" />
  </>
);

export const IconHeadphones = makeIcon(
  <>
    <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
    <rect x="2" y="14" width="5" height="7" rx="2" />
    <rect x="17" y="14" width="5" height="7" rx="2" />
  </>
);

export const IconStar = makeIcon(
  <path d="M12 3l2.7 5.9 6.3.6-4.8 4.3 1.4 6.2L12 16.9 6.4 20l1.4-6.2-4.8-4.3 6.3-.6z" />
);

export const IconFlag = makeIcon(
  <>
    <path d="M5 21V4" />
    <path d="M5 4h13l-3 4.5L18 13H5" />
  </>
);

export const IconFlame = makeIcon(
  <path d="M12 2s-6 5.5-6 11a6 6 0 0 0 12 0c0-1.7-.7-2.9-1.4-4-.3 1.4-1 2-1.6 2.2.4-2.4-.6-4.5-3-7.2 0 2-.7 3-1.6 3.7C9.7 6.9 10 4.3 12 2z" />
);

// Ícones de ações do post-card (feed) — curtir/comentar/compartilhar.
export const IconHeart = makeIcon(
  <path d="M12 21s-7.5-4.6-10-9.3C.4 8.2 2 4.5 5.6 4a4.9 4.9 0 0 1 6.4 2.2A4.9 4.9 0 0 1 18.4 4c3.6.5 5.2 4.2 3.6 7.7C19.5 16.4 12 21 12 21z" />
);

export const IconComment = makeIcon(
  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
);

export const IconShare = makeIcon(
  <>
    <circle cx="18" cy="5" r="2.5" />
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="18" cy="19" r="2.5" />
    <path d="M8.2 10.8l7.6-4.6M8.2 13.2l7.6 4.6" />
  </>
);

// Ícones de compartilhamento social — silhuetas próprias, monocromáticas (não são o
// logotipo oficial da marca).
export const IconWhatsApp = makeIcon(
  <>
    <path d="M12 4a8 8 0 0 0-6.9 12l-1.1 4 4.2-1.1A8 8 0 1 0 12 4z" />
    <path d="M9 9c0 3.5 2.5 6 6 6" />
    <circle cx="9" cy="9" r="1" />
    <circle cx="15" cy="15" r="1" />
  </>
);

export const IconXTwitter = makeIcon(<path d="M4 4l16 16M20 4L4 20" />);

export const IconLinkedIn = makeIcon(
  <>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="M7.5 10.5v6M7.5 7.8v.01" />
    <path d="M11.5 17v-5a2.2 2.2 0 0 1 4.4 0v5" />
  </>
);

// Ícones do ícone-mapa de conteúdo — alias explícito por tipo, útil para testes/documentação.
export const CONTENT_TYPE_ICONS = {
  report: IconReport,
  podcast: IconPodcast,
  video: IconVideo,
  survey: IconSurvey,
} as const;

// Ícones do mapa de badges — usados por BadgeShelf a partir do id string em BadgeDefinition.icon.
export const BADGE_ICONS = {
  compass: IconCompass,
  report: IconReport,
  headphones: IconHeadphones,
  star: IconStar,
  flag: IconFlag,
  check: IconCheck,
  flame: IconFlame,
} as const;

export type BadgeIconId = keyof typeof BADGE_ICONS;
