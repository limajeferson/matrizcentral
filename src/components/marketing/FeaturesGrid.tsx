import type { ReactNode } from "react";
import GlassCard from "@/components/ui/glass-card";
import CategoryBadge from "@/components/ui/category-badge";
import Eyebrow from "@/components/marketing/Eyebrow";

function QuizVisual() {
  return (
    <svg viewBox="0 0 160 120" className="h-full w-full">
      <rect x="20" y="24" width="120" height="8" rx="4" fill="#ede9fe" />
      <rect x="20" y="24" width="48" height="8" rx="4" fill="#7c3aed" />
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x="20"
          y={48 + i * 18}
          width="120"
          height="14"
          rx="7"
          fill={i === 1 ? "#7c3aed" : "#ffffff"}
          stroke={i === 1 ? "none" : "#e4e4e7"}
        />
      ))}
    </svg>
  );
}

function RoadmapVisual() {
  return (
    <svg viewBox="0 0 160 120" className="h-full w-full">
      <line x1="34" y1="30" x2="34" y2="90" stroke="#e4e4e7" strokeWidth="3" />
      <line x1="34" y1="30" x2="34" y2="62" stroke="#7c3aed" strokeWidth="3" />
      <circle cx="34" cy="30" r="8" fill="#7c3aed" />
      <circle cx="34" cy="62" r="8" fill="#7c3aed" />
      <circle cx="34" cy="90" r="8" fill="#fff" stroke="#d4d4d8" strokeWidth="2" />
      <rect x="54" y="23" width="86" height="14" rx="7" fill="#ede9fe" />
      <rect x="54" y="55" width="86" height="14" rx="7" fill="#ede9fe" />
      <rect x="54" y="83" width="86" height="14" rx="7" fill="#f4f4f5" />
    </svg>
  );
}

function XpVisual() {
  const bars = [28, 44, 36, 60, 78];
  return (
    <svg viewBox="0 0 160 120" className="h-full w-full">
      {bars.map((h, i) => (
        <rect
          key={i}
          x={24 + i * 24}
          y={98 - h}
          width="14"
          height={h}
          rx="4"
          fill={i === bars.length - 1 ? "#7c3aed" : "#ddd6fe"}
        />
      ))}
      <circle cx="128" cy="26" r="14" fill="#7c3aed" />
      <path
        d="M128 19l2.3 4.7 5.2.7-3.8 3.6.9 5.2-4.6-2.4-4.6 2.4.9-5.2-3.8-3.6 5.2-.7z"
        fill="#fff"
      />
    </svg>
  );
}

function EbookVisual() {
  return (
    <svg viewBox="0 0 160 120" className="h-full w-full">
      <rect x="28" y="30" width="72" height="66" rx="6" fill="#ede9fe" transform="rotate(-6 64 63)" />
      <rect x="40" y="24" width="80" height="72" rx="6" fill="#fff" stroke="#e4e4e7" strokeWidth="2" />
      <line x1="52" y1="42" x2="108" y2="42" stroke="#c4b5fd" strokeWidth="3" />
      <line x1="52" y1="54" x2="108" y2="54" stroke="#e4e4e7" strokeWidth="3" />
      <line x1="52" y1="66" x2="92" y2="66" stroke="#e4e4e7" strokeWidth="3" />
      <line x1="52" y1="78" x2="100" y2="78" stroke="#e4e4e7" strokeWidth="3" />
    </svg>
  );
}

function ValidacaoVisual() {
  return (
    <svg viewBox="0 0 160 120" className="h-full w-full">
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x="30" y={26 + i * 24} width="20" height="14" rx="5" fill={i < 2 ? "#7c3aed" : "#f4f4f5"} />
          {i < 2 && (
            <path
              d={`M34 ${33 + i * 24}l3 3 6-6`}
              stroke="#fff"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          <rect x="58" y={26 + i * 24} width="72" height="14" rx="5" fill="#ede9fe" opacity={i < 2 ? 1 : 0.5} />
        </g>
      ))}
    </svg>
  );
}

function CertificadoVisual() {
  return (
    <svg viewBox="0 0 160 120" className="h-full w-full">
      <circle cx="80" cy="46" r="30" fill="#ede9fe" stroke="#c4b5fd" strokeWidth="2" />
      <circle cx="80" cy="46" r="18" fill="#7c3aed" />
      <path d="M72 46l5 5 11-11" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M66 70l-8 24 12-4 6 10 8-26" fill="#ddd6fe" />
      <path d="M94 70l8 24-12-4-6 10-8-26" fill="#ddd6fe" />
    </svg>
  );
}

const FEATURES: {
  title: string;
  category: string;
  description: string;
  variant: "ebook" | "quiz" | "roadmap" | "xp";
  visual: ReactNode;
}[] = [
  {
    title: "Quiz de Perfil",
    category: "Triagem",
    description:
      "Poucos minutos para mapear sua stack, nível e objetivos. Sem generalização — seu ponto de partida real.",
    variant: "roadmap",
    visual: <QuizVisual />,
  },
  {
    title: "Roadmap Personalizado",
    category: "Aprendizado",
    description:
      "Sequência de estudo pensada para o seu perfil. Sem revisitar o que já domina, sem pular o que ainda falta.",
    variant: "roadmap",
    visual: <RoadmapVisual />,
  },
  {
    title: "Sistema de XP",
    category: "Progresso",
    description:
      "Ganhe XP a cada ebook concluído e a cada validação de conhecimento aprovada.",
    variant: "xp",
    visual: <XpVisual />,
  },
  {
    title: "Ebook Completo",
    category: "Conteúdo",
    description:
      "Do zero ao avançado para ter sua própria IA no computador — com trilha sem código para quem não programa.",
    variant: "ebook",
    visual: <EbookVisual />,
  },
  {
    title: "Quiz de Validação",
    category: "Avaliação",
    description:
      "15 perguntas com dica sempre visível. Aprovação a partir de 70% libera seu certificado.",
    variant: "quiz",
    visual: <ValidacaoVisual />,
  },
  {
    title: "Certificado Verificável",
    category: "Reconhecimento",
    description:
      "Certificado com QR code, verificável publicamente em matrizcentral.com.br/verify.",
    variant: "xp",
    visual: <CertificadoVisual />,
  },
];

export default function FeaturesGrid() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-12 text-center">
        <Eyebrow className="mb-4">Plataforma</Eyebrow>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          Um sistema, não um ebook solto.
        </h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <GlassCard key={feature.title} className="overflow-hidden p-4">
            <div className="mb-4 flex h-32 items-center justify-center rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
              {feature.visual}
            </div>
            <div className="px-2 pb-2">
              <CategoryBadge variant={feature.variant} className="mb-3">
                {feature.category}
              </CategoryBadge>
              <h3 className="mb-1.5 font-semibold text-zinc-900">{feature.title}</h3>
              <p className="text-sm text-zinc-600">{feature.description}</p>
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
