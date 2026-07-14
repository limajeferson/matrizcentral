"use client";

import { IconLock } from "@/components/ui/icons";

export default function ContentGate({
  title,
  nextPath,
  reason,
}: {
  title?: string;
  nextPath?: string;
  reason?: string;
}) {
  const entrarHref = nextPath ? `/entrar?next=${encodeURIComponent(nextPath)}` : "/entrar";
  const cycleUsed = reason === "cycle-used";

  return (
    <div className="mx-auto max-w-sm rounded-2xl border border-white/10 bg-black/40 p-6 text-center backdrop-blur">
      <div className="mb-3 flex justify-center text-white/70" aria-hidden>
        <IconLock size={28} />
      </div>
      {title && <p className="mb-1 font-semibold text-white">{title}</p>}
      {cycleUsed ? (
        <>
          <p className="mb-5 text-sm text-white/70">
            Você já usou seu conteúdo deste mês. Volte no próximo ciclo, ou passe para o Advanced e consuma sem limite.
          </p>
          <div className="flex flex-col gap-2">
            <a href="/oferta" className="rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white">
              Fazer upgrade para o Advanced
            </a>
          </div>
        </>
      ) : (
        <>
          <p className="mb-5 text-sm text-white/70">
            Para assistir, entre na sua conta ou adquira o acesso.
          </p>
          <div className="flex flex-col gap-2">
            <a href="/oferta" className="rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white">
              Adquirir acesso
            </a>
            <a href={entrarHref} className="text-sm text-white/70 underline">
              Já sou aluno? Entrar
            </a>
          </div>
        </>
      )}
    </div>
  );
}
