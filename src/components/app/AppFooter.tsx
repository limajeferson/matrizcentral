import Link from "next/link";
import { IconMail } from "@/components/ui/icons";

type FooterLink = { label: string; href: string };
type FooterColumn = { title: string; links: FooterLink[] };

const COLUMNS: FooterColumn[] = [
  {
    title: "Plataforma",
    links: [
      { label: "Feed", href: "/feed" },
      { label: "Conteúdos", href: "/feed#conteudos" },
      { label: "Fórum", href: "/forum" },
    ],
  },
  {
    title: "Conta",
    links: [
      { label: "Minha conta", href: "/conta" },
      { label: "Suporte", href: "/suporte" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Sobre", href: "/sobre" },
      { label: "Privacidade", href: "/legal/privacidade" },
      { label: "Termos", href: "/legal/termos" },
    ],
  },
];

/**
 * Rodapé multi-coluna da área logada. Estático (server component): marca +
 * colunas de links + contato por e-mail + barra de copyright.
 */
export function AppFooter() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto max-w-[1400px] px-4 py-10 lg:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-lg font-semibold text-foreground">
              Matriz <span className="text-violet-600">Central</span>
            </p>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Sua central de IA local — relatórios, podcasts, vídeos e comunidade.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="text-xs uppercase text-muted-foreground">{column.title}</p>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
          <IconMail size={16} />
          <a href="mailto:contato@matrizcentral.com.br" className="hover:text-foreground">
            contato@matrizcentral.com.br
          </a>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-xs text-muted-foreground">
          © 2026 Matriz Central. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}

export default AppFooter;
