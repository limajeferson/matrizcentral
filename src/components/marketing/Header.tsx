export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <span className="text-lg font-bold text-zinc-900">Matriz Central</span>
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
          className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-violet-700"
        >
          Ver preço
        </a>
      </div>
    </header>
  );
}
