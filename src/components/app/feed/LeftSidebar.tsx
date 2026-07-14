import Link from "next/link";
import type { ComponentType } from "react";
import { IconAccount, IconContent, IconFeed, IconForum, IconSupport, type IconProps } from "@/components/ui/icons";
import { CONTENT_ICON } from "@/lib/content-icons";
import type { ContentType } from "@/data/content-hub";

type NavItem = { href: string; label: string; icon: ComponentType<IconProps> };

// Rotas reais do app. Não há uma página dedicada "/conteudos" — aponta para
// o rail/lista de conteúdo dentro do próprio /feed (id="conteudos").
const NAV_ITEMS: NavItem[] = [
  { href: "/feed", label: "Feed", icon: IconFeed },
  { href: "/feed#conteudos", label: "Conteúdos", icon: IconContent },
  { href: "/forum", label: "Fórum", icon: IconForum },
  { href: "/conta", label: "Conta", icon: IconAccount },
  { href: "/suporte", label: "Suporte", icon: IconSupport },
];

const FORMAT_ITEMS: { type: ContentType; label: string }[] = [
  { type: "relatorio", label: "Relatórios" },
  { type: "podcast", label: "Podcasts" },
  { type: "video", label: "Vídeos" },
  { type: "pesquisa", label: "Pesquisas" },
];

/** Nav lateral (rotas reais) + bloco "Explorar por formato" (tipos do content-hub). */
export function LeftSidebar() {
  return (
    <div className="space-y-6">
      <nav
        aria-label="Navegação principal"
        className="space-y-1 rounded-2xl border border-border bg-card p-3 shadow-sm"
      >
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground"
          >
            <Icon size={18} className="text-muted-foreground" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Explorar por formato
        </h2>
        <div className="space-y-1">
          {FORMAT_ITEMS.map(({ type, label }) => {
            const Icon = CONTENT_ICON[type];
            return (
              <Link
                key={type}
                href="/feed#conteudos"
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground transition hover:bg-accent hover:text-accent-foreground"
              >
                <Icon size={16} className="text-violet-600" />
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default LeftSidebar;
