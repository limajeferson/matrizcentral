export default function FooterV2() {
  return (
    <footer className="mc-footer" id="mc-footer">
      <div className="mc-container mc-footer-grid">
        <div>
          <span className="mc-logo mc-display">
            Matriz<span className="mc-accent-text">/</span>Central
          </span>
          <p className="mc-footer-desc">
            Sistema de estudo para dominar IA local — ebook, trilha
            personalizada, XP e certificado verificável.
          </p>
        </div>
        <nav className="mc-footer-nav" aria-label="Links do rodapé">
          <a href="#sistema">O Sistema</a>
          <a href="#processo">Como Funciona</a>
          <a href="#preco">Preço</a>
          <a href="#faq">FAQ</a>
          <a href="/oferta">Oferta</a>
        </nav>
      </div>
      <div className="mc-container mc-footer-bottom">
        <span>
          © {new Date().getFullYear()} Matriz Central. Todos os direitos
          reservados.
        </span>
      </div>
    </footer>
  );
}
