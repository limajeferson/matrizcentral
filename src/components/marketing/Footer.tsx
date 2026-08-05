import LegalLinks from "./LegalLinks";
import Logo from "@/components/brand/Logo";

export default function Footer() {
  return (
    <footer>
      <div className="container foot-row">
        {/* Fragment (sem span extra) por causa de `.lp-guide .logo span`. */}
        <Logo size={18} gap={6} className="logo" style={{ fontSize: 16 }}>
          <>
            Matriz<span>/</span>Central
          </>
        </Logo>
        <nav>
          {/* /#features nao existe: os ids reais da landing sao sistema,
              processo, preco, faq, central, momento, estrategia. */}
          <a href="/#sistema">O sistema</a>
          <a href="/#preco">Preço</a>
        </nav>
        <LegalLinks />
        <span>
          © {new Date().getFullYear()} Matriz Central. Todos os direitos
          reservados.
        </span>
      </div>
    </footer>
  );
}
