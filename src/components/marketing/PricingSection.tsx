import Eyebrow from "@/components/marketing/Eyebrow";

const FEATURES: string[] = [
  "Ebook completo (9 capítulos) sobre rodar LLMs localmente",
  "Triagem de perfil personalizada",
  "Roadmap de estudo sob medida para o seu perfil",
  "Um segundo ebook grátis, escolhido pelo seu perfil",
  "Quiz de validação com certificado de conclusão",
];

export default function PricingSection() {
  return (
    <section id="preco" className="mx-auto max-w-2xl border-t border-zinc-100 px-6 py-16">
      <div className="mb-8 text-center">
        <Eyebrow className="mb-4">Preço</Eyebrow>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Simples, transparente</h2>
      </div>
      <div className="relative rounded-[20px] bg-gradient-to-br from-violet-600 to-violet-700 p-8 text-white shadow-lg">
        <span className="absolute right-6 top-6 rounded-full bg-white/15 px-3 py-1 font-marketing-mono text-[10px] uppercase tracking-wide">
          Pagamento único
        </span>
        <p className="text-5xl font-bold tracking-tight">R$47</p>
        <p className="mb-6 text-violet-200">sem mensalidade, acesso vitalício</p>
        <ul className="mb-8 space-y-3">
          {FEATURES.map((feature) => (
            <li key={feature} className="flex items-center gap-3">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-xs">
                ✓
              </span>
              <span className="text-sm text-white">{feature}</span>
            </li>
          ))}
        </ul>
        <a
          href="#hero"
          className="block rounded-full bg-white py-3 text-center font-semibold text-violet-700 transition hover:bg-violet-50"
        >
          Comprar agora
        </a>
      </div>
      <p className="mt-4 text-center text-sm text-zinc-500">
        Pagamento único via PIX, cartão ou boleto
      </p>
    </section>
  );
}
