export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <span className="text-lg font-bold tracking-tight text-zinc-900">
          Matriz<span className="text-violet-500">/</span>Central
        </span>
        <nav className="hidden items-center gap-8 text-sm font-medium text-zinc-600 sm:flex">
          <a href="#features" className="transition hover:text-zinc-900">
            Features
          </a>
          <a href="#preco" className="transition hover:text-zinc-900">
            Preço
          </a>
        </nav>
        <a
          href="#preco"
          className="rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
        >
          Ver preço
        </a>
      </div>
    </header>
  );
}
