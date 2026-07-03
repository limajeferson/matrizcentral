export default function Footer() {
  return (
    <footer className="bg-zinc-900 px-6 py-12 text-zinc-400">
      <div className="mx-auto max-w-6xl">
        <p className="mb-2 text-lg font-bold text-white">Matriz Central</p>
        <p className="max-w-md text-sm">
          Conteúdo técnico sobre IA e DevTools, sem enrolação. Roadmap
          personalizado para devs, DevOps, gestores e founders brasileiros.
        </p>
        <p className="mt-8 text-xs text-zinc-500">
          © {new Date().getFullYear()} Matriz Central. Todos os direitos
          reservados.
        </p>
      </div>
    </footer>
  );
}
