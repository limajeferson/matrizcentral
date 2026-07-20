"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ComponentType } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconAccount, IconChevron, IconContent, IconFeed, IconForum, IconReport, IconSupport, type IconProps } from "@/components/ui/icons";
import { CONTENT_ICON } from "@/lib/content-icons";
import { CONTENT_HUB, type ContentType } from "@/data/content-hub";
import { formatAvailability } from "@/lib/format-availability";
import { READER_DOCS } from "@/data/reader-docs";

type NavItem = { href: string; label: string; icon: ComponentType<IconProps> };

// Slug do ebook no leitor protegido (`/biblioteca/<slug>`) — único ponto de
// entrada logado para o leitor antes desta mudança era nenhum (ver I3 da
// revisão final da frente "leitor protegido"). Busca por `kind` em vez de
// hardcodar o slug: se o registro em `reader-docs.ts` mudar, este link segue.
const readerEbook = READER_DOCS.find((d) => d.kind === "ebook");

// Rotas reais do app. Não há uma página dedicada "/conteudos" — aponta para
// o rail/lista de conteúdo dentro do próprio /feed (id="conteudos").
const NAV_MAIN: NavItem[] = [
  { href: "/feed", label: "Feed", icon: IconFeed },
  { href: "/feed#conteudos", label: "Conteúdos", icon: IconContent },
  { href: "/forum", label: "Fórum", icon: IconForum },
  ...(readerEbook ? [{ href: `/biblioteca/${readerEbook.slug}`, label: "Ler o guia", icon: IconReport }] : []),
];

const NAV_ACCOUNT: NavItem[] = [
  { href: "/conta", label: "Conta", icon: IconAccount },
  { href: "/suporte", label: "Suporte", icon: IconSupport },
];

const FORMAT_ITEMS: { type: ContentType; label: string }[] = [
  { type: "relatorio", label: "Relatórios" },
  { type: "podcast", label: "Podcasts" },
  { type: "video", label: "Vídeos" },
  { type: "pesquisa", label: "Pesquisas" },
];

/** Item é "página atual" só em match exato de path. Âncoras (`/feed#conteudos`)
 *  nunca são ativas por pathname — senão colidiriam com o item raiz `/feed`
 *  (dois `aria-current` + dois indicadores ativos na mesma rota). */
function isActiveHref(pathname: string, href: string): boolean {
  if (href.includes("#")) return false;
  return pathname === href;
}

function NavSection({ label, items, pathname }: { label: string; items: NavItem[]; pathname: string }) {
  return (
    <nav
      aria-label={label}
      className="space-y-1 rounded-2xl border border-border bg-card p-3 shadow-sm"
    >
      <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </h2>
      {items.map(({ href, label: itemLabel, icon: Icon }) => {
        const active = isActiveHref(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              active
                ? "bg-accent text-foreground"
                : "text-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            {active && (
              // Barra estática (não `layoutId`): a LeftSidebar é montada 2x
              // (aside desktop + drawer mobile) e um layoutId compartilhado
              // colidiria entre as instâncias.
              <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-violet-600" />
            )}
            <Icon size={18} className="text-muted-foreground" />
            {itemLabel}
          </Link>
        );
      })}
    </nav>
  );
}

/** Nav lateral em seções (rotas reais) + bloco colapsável "Explorar por formato". */
export function LeftSidebar() {
  const pathname = usePathname();
  const [formatOpen, setFormatOpen] = useState(true);
  const availability = formatAvailability(CONTENT_HUB);

  return (
    <div className="space-y-6">
      <NavSection label="Navegar" items={NAV_MAIN} pathname={pathname} />
      <NavSection label="Sua conta" items={NAV_ACCOUNT} pathname={pathname} />

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <button
          type="button"
          onClick={() => setFormatOpen((v) => !v)}
          aria-expanded={formatOpen}
          className="flex w-full items-center justify-between text-left"
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Explorar por formato
          </span>
          <motion.span
            animate={{ rotate: formatOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <IconChevron size={16} className="text-muted-foreground" />
          </motion.span>
        </button>
        <AnimatePresence initial={false}>
          {formatOpen && (
            <motion.div
              key="format-list"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-1">
                {FORMAT_ITEMS.map(({ type, label }) => {
                  const Icon = CONTENT_ICON[type];
                  const emBreve = availability[type].emBreve;
                  return (
                    <Link
                      key={type}
                      href="/feed#conteudos"
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground transition hover:bg-accent hover:text-accent-foreground"
                    >
                      <Icon size={16} className="text-violet-600" />
                      <span className="flex-1">{label}</span>
                      {emBreve && (
                        <span className="text-[10px] uppercase text-amber-600">Em breve</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default LeftSidebar;
