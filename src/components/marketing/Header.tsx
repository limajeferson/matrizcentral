export default function Header() {
  return (
    <header>
      <div className="container nav">
        <span className="logo">
          Matriz<span>/</span>Central
        </span>
        <ul className="nav-links">
          <li>
            <a href="#features">Features</a>
          </li>
          <li>
            <a href="#preco">Preço</a>
          </li>
        </ul>
        <a className="btn btn-accent" href="#preco">
          Ver preço
        </a>
      </div>
    </header>
  );
}
