export default function Footer() {
  return (
    <footer>
      <div className="container foot-row">
        <span className="logo" style={{ fontSize: 16 }}>
          Matriz<span>/</span>Central
        </span>
        <nav>
          <a href="#features">Features</a>
          <a href="#preco">Preço</a>
        </nav>
        <span>
          © {new Date().getFullYear()} Matriz Central. Todos os direitos
          reservados.
        </span>
      </div>
    </footer>
  );
}
