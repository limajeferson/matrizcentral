export default function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="rounded-3xl bg-zinc-900 px-10 py-14 text-center text-white">
        <h2 className="mb-3 text-3xl font-bold sm:text-4xl">
          Comece Sua Trilha de Estudo Hoje
        </h2>
        <p className="mx-auto mb-8 max-w-md text-sm text-zinc-400">
          Descubra seu perfil, siga um roadmap sob medida e valide o que
          aprendeu com um certificado verificável.
        </p>
        <a
          href="#hero"
          className="inline-block rounded-xl bg-violet-600 px-8 py-3 font-bold text-white transition hover:bg-violet-700"
        >
          Quero por R$47
        </a>
      </div>
    </section>
  );
}
