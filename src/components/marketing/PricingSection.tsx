import GlassCard from "@/components/ui/glass-card";
import CategoryBadge from "@/components/ui/category-badge";

const FEATURES: { label: string; variant: "ebook" | "quiz" | "roadmap" }[] = [
  { label: "Ebook completo (9 capítulos) sobre rodar LLMs localmente", variant: "ebook" },
  { label: "Triagem de perfil personalizada", variant: "roadmap" },
  { label: "Roadmap de estudo sob medida para o seu perfil", variant: "roadmap" },
  { label: "Um segundo ebook grátis, escolhido pelo seu perfil", variant: "ebook" },
  { label: "Quiz de validação com certificado de conclusão", variant: "quiz" },
];

export default function PricingSection() {
  return (
    <section className="mx-auto max-w-2xl border-t border-zinc-100 px-6 py-16">
      <h2 className="mb-8 text-center text-3xl font-bold text-zinc-900">
        O que você recebe
      </h2>
      <GlassCard className="p-8">
        <ul className="space-y-4">
          {FEATURES.map((feature) => (
            <li key={feature.label} className="flex items-center gap-3">
              <CategoryBadge variant={feature.variant}>✓</CategoryBadge>
              <span className="text-zinc-700">{feature.label}</span>
            </li>
          ))}
        </ul>
      </GlassCard>
      <p className="mt-8 text-center text-4xl font-bold text-zinc-900">R$47</p>
      <p className="text-center text-sm text-zinc-500">
        Pagamento único via PIX, cartão ou boleto
      </p>
    </section>
  );
}
