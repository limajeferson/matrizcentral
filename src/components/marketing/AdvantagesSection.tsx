import Eyebrow from "@/components/marketing/Eyebrow";

export default function AdvantagesSection() {
  return (
    <section className="border-y border-zinc-100 bg-zinc-50 py-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <Eyebrow className="mb-4">Seus resultados</Eyebrow>
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-4xl">
            Seu XP cresce a cada semana de estudo real
          </h2>
        </div>
        <p className="text-sm text-zinc-600">
          Cada ebook concluído e cada quiz aprovado somam XP. O roadmap
          personalizado evita que você estude o que já domina — foco só no
          que ainda falta.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-6xl px-6">
        <div className="rounded-[20px] border border-zinc-200 bg-white p-6">
          <div className="mb-6 flex gap-2 font-marketing-mono text-[11px] uppercase tracking-wide">
            <span className="rounded-full border border-zinc-900 bg-zinc-900 px-4 py-1.5 text-white">
              Sua curva de XP
            </span>
            <span className="rounded-full border border-zinc-200 px-4 py-1.5 text-zinc-500">
              Por semana
            </span>
          </div>
          <svg viewBox="0 0 800 220" width="100%" preserveAspectRatio="none" className="block">
            <defs>
              <linearGradient id="xpFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <path
              d="M0 200 C120 195 180 170 260 150 C360 125 420 80 520 55 C620 32 700 22 800 15 L800 220 L0 220 Z"
              fill="url(#xpFill)"
            />
            <path
              d="M0 200 C120 195 180 170 260 150 C360 125 420 80 520 55 C620 32 700 22 800 15"
              fill="none"
              stroke="#7c3aed"
              strokeWidth="3"
            />
          </svg>

          <div className="mt-6 grid gap-6 border-t border-zinc-100 pt-6 sm:grid-cols-3">
            <div>
              <p className="mb-1 font-semibold text-zinc-900">Roadmap sob medida</p>
              <p className="text-sm text-zinc-600">
                Sequência definida pelo seu perfil, sem revisitar o que já sabe.
              </p>
            </div>
            <div>
              <p className="mb-1 font-semibold text-zinc-900">Validação real</p>
              <p className="text-sm text-zinc-600">
                Quiz de 15 questões com 70% mínimo libera o certificado.
              </p>
            </div>
            <div>
              <p className="mb-1 font-semibold text-zinc-900">Progresso visível</p>
              <p className="text-sm text-zinc-600">
                XP acumulado no dashboard a cada etapa concluída.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
