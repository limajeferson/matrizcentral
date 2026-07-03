import GlassCard from "@/components/ui/glass-card";
import CategoryBadge from "@/components/ui/category-badge";

const FEATURES: { title: string; description: string; variant: "ebook" | "quiz" | "roadmap" | "xp" }[] = [
  {
    title: "Quiz de Perfil",
    description:
      "Poucos minutos para mapear sua stack, nível e objetivos. Sem generalização — seu ponto de partida real.",
    variant: "roadmap",
  },
  {
    title: "Roadmap Personalizado",
    description:
      "Sequência de estudo pensada para o seu perfil. Sem revisitar o que já domina, sem pular o que ainda falta.",
    variant: "roadmap",
  },
  {
    title: "Sistema de XP",
    description:
      "Ganhe XP a cada ebook concluído e a cada validação de conhecimento aprovada.",
    variant: "xp",
  },
  {
    title: "Ebook Técnico",
    description:
      "Conteúdo direto sobre rodar LLMs localmente — hardware, ferramentas e troubleshooting real.",
    variant: "ebook",
  },
  {
    title: "Quiz de Validação",
    description:
      "15 perguntas com dica sempre visível. Aprovação a partir de 70% libera seu certificado.",
    variant: "quiz",
  },
  {
    title: "Certificado Verificável",
    description:
      "Certificado com QR code, verificável publicamente em matrizcentral.com.br/verify.",
    variant: "xp",
  },
];

export default function FeaturesGrid() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-12 text-center">
        <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-wide text-violet-600">
          Plataforma
        </span>
        <h2 className="text-3xl font-bold text-zinc-900 sm:text-4xl">
          Um sistema, não um ebook solto.
        </h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <GlassCard key={feature.title} className="p-6">
            <CategoryBadge variant={feature.variant} className="mb-3">
              {feature.title}
            </CategoryBadge>
            <p className="text-sm text-zinc-600">{feature.description}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
