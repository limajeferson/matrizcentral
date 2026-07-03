export default function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-100 bg-white px-6 py-9">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-zinc-500 sm:flex-row">
        <span className="text-base font-bold tracking-tight text-zinc-900">
          Matriz<span className="text-violet-500">/</span>Central
        </span>
        <nav className="flex gap-6">
          <a href="#features" className="text-zinc-600 transition hover:text-zinc-900">
            Features
          </a>
          <a href="#preco" className="text-zinc-600 transition hover:text-zinc-900">
            Preço
          </a>
        </nav>
        <span>
          © {new Date().getFullYear()} Matriz Central. Todos os direitos
          reservados.
        </span>
      </div>
    </footer>
  );
}
