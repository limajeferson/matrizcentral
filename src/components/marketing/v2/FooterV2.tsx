import Link from "next/link";
import { FOOTER_COLUMNS, type FooterLink } from "./footer-nav";
import FooterNewsletter from "./FooterNewsletter";
import {
  IconFlag, IconClock, IconCpu,
  IconGithub, IconLinkedin, IconYoutube, IconInstagram, IconX, IconDiscord,
} from "./icons";

const HIGHLIGHTS = [
  { Icon: IconFlag, label: "Plataforma Brasileira" },
  { Icon: IconClock, label: "Atuando desde 2025" },
  { Icon: IconCpu, label: "Especializada em IA Local" },
];

const SOCIALS = [
  { Icon: IconGithub, label: "GitHub" },
  { Icon: IconLinkedin, label: "LinkedIn" },
  { Icon: IconYoutube, label: "YouTube" },
  { Icon: IconInstagram, label: "Instagram" },
  { Icon: IconX, label: "X" },
  { Icon: IconDiscord, label: "Discord" },
];

function FooterNavLink({ link }: { link: FooterLink }) {
  if (!link.href || link.soon) {
    return (
      <span className="mc-footer-link is-soon">
        {link.label}
        <span className="mc-footer-soon mc-mono">breve</span>
      </span>
    );
  }
  return (
    <Link className="mc-footer-link" href={link.href}>
      {link.label}
    </Link>
  );
}

export default function FooterV2() {
  return (
    <footer className="mc-footer" id="mc-footer">
      <div className="mc-container">
        <div className="mc-footer-highlights" aria-label="Sobre a plataforma">
          {HIGHLIGHTS.map(({ Icon, label }) => (
            <span className="mc-footer-highlight mc-mono" key={label}>
              <Icon className="mc-footer-highlight-icon" />
              {label}
            </span>
          ))}
        </div>

        <div className="mc-footer-main">
          <div className="mc-footer-brand">
            <span className="mc-logo mc-display">
              Matriz<span className="mc-accent-text">/</span>Central
            </span>
            <p className="mc-footer-slogan">Menos assinatura. Mais autonomia.</p>
            <p className="mc-footer-desc">
              Plataforma brasileira dedicada à autonomia em Inteligência
              Artificial. Conteúdo, ferramentas e aprendizado para usar IA com
              mais controle, privacidade e independência.
            </p>
            <p className="mc-footer-since mc-mono">Atuando desde 2025.</p>
            <div className="mc-footer-social" aria-label="Redes sociais (em breve)">
              {SOCIALS.map(({ Icon, label }) => (
                <span
                  key={label}
                  className="mc-footer-social-item"
                  title={`${label} — em breve`}
                  aria-label={`${label} — em breve`}
                >
                  <Icon className="mc-footer-social-icon" />
                </span>
              ))}
            </div>
          </div>

          <div className="mc-footer-columns">
            {FOOTER_COLUMNS.map((col) => (
              <nav className="mc-footer-col" key={col.title} aria-label={col.title}>
                <span className="mc-footer-col-title mc-mono">{col.title}</span>
                {col.links.map((link) => (
                  <FooterNavLink key={link.label} link={link} />
                ))}
              </nav>
            ))}
          </div>
        </div>

        <FooterNewsletter />

        <div className="mc-footer-bottom">
          <span>
            © {new Date().getFullYear()} Matriz Central. Todos os direitos
            reservados. · Desenvolvido no Brasil · Atuando desde 2025.
          </span>
        </div>
      </div>
    </footer>
  );
}
