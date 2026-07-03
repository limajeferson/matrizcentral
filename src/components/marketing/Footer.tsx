export default function Footer() {
  return (
    <footer className="bg-zinc-900 px-6 py-12 text-zinc-400">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-2 text-lg font-bold text-white">Matriz Central</p>
          <p className="max-w-md text-sm">
            Conteúdo técnico sobre IA e DevTools, sem enrolação. Roadmap
            personalizado para devs, DevOps, gestores e founders brasileiros.
          </p>
        </div>
        <nav className="flex gap-6 text-sm">
          <a href="#features" className="transition hover:text-white">
            Features
          </a>
          <a href="#preco" className="transition hover:text-white">
            Preço
          </a>
        </nav>
      </div>
      <p className="mx-auto mt-8 max-w-6xl text-xs text-zinc-500">
        © {new Date().getFullYear()} Matriz Central. Todos os direitos
        reservados.
      </p>
    </footer>
  );
}
