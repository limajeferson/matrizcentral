import type { ReactNode } from "react";

function QuizVisual() {
  return (
    <svg viewBox="0 0 160 120" width="100%" height="100%">
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
    <svg viewBox="0 0 160 120" width="100%" height="100%">
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
    <svg viewBox="0 0 160 120" width="100%" height="100%">
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
    <svg viewBox="0 0 160 120" width="100%" height="100%">
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
    <svg viewBox="0 0 160 120" width="100%" height="100%">
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
    <svg viewBox="0 0 160 120" width="100%" height="100%">
      <circle cx="80" cy="46" r="30" fill="#ede9fe" stroke="#c4b5fd" strokeWidth="2" />
      <circle cx="80" cy="46" r="18" fill="#7c3aed" />
      <path d="M72 46l5 5 11-11" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M66 70l-8 24 12-4 6 10 8-26" fill="#ddd6fe" />
      <path d="M94 70l8 24-12-4-6 10-8-26" fill="#ddd6fe" />
    </svg>
  );
}

function RelatorioVisual() {
  return (
    <svg viewBox="0 0 160 120" width="100%" height="100%">
      <rect x="34" y="20" width="92" height="80" rx="8" fill="#fff" stroke="#e4e4e7" strokeWidth="2" />
      <rect x="46" y="34" width="68" height="7" rx="3.5" fill="#7c3aed" />
      <rect x="46" y="48" width="68" height="6" rx="3" fill="#e4e4e7" />
      <rect x="46" y="60" width="50" height="6" rx="3" fill="#e4e4e7" />
      <rect x="46" y="76" width="20" height="20" rx="4" fill="#ede9fe" />
      <rect x="70" y="86" width="20" height="10" rx="4" fill="#ede9fe" />
      <rect x="94" y="80" width="20" height="16" rx="4" fill="#ddd6fe" />
    </svg>
  );
}

function PodcastVisual() {
  return (
    <svg viewBox="0 0 160 120" width="100%" height="100%">
      <circle cx="80" cy="55" r="30" fill="#ede9fe" />
      <circle cx="80" cy="55" r="10" fill="#7c3aed" />
      {[18, 24, 30].map((r, i) => (
        <circle
          key={r}
          cx="80"
          cy="55"
          r={r}
          fill="none"
          stroke="#c4b5fd"
          strokeWidth="2"
          opacity={0.6 - i * 0.15}
        />
      ))}
    </svg>
  );
}

function PesquisaVisual() {
  const bars = [70, 46, 30];
  return (
    <svg viewBox="0 0 160 120" width="100%" height="100%">
      {bars.map((w, i) => (
        <g key={w}>
          <rect x="24" y={30 + i * 24} width="112" height="14" rx="7" fill="#ede9fe" />
          <rect
            x="24"
            y={30 + i * 24}
            width={w}
            height="14"
            rx="7"
            fill={i === 0 ? "#7c3aed" : "#c4b5fd"}
          />
        </g>
      ))}
    </svg>
  );
}

const FEATURES: {
  title: string;
  category: string;
  description: string;
  visual: ReactNode;
  soon?: boolean;
}[] = [
  {
    title: "Quiz de Perfil",
    category: "TRIAGEM",
    description:
      "Poucos minutos para mapear sua stack, nível e objetivos. Sem generalização — seu ponto de partida real.",
    visual: <QuizVisual />,
  },
  {
    title: "Roadmap Personalizado",
    category: "APRENDIZADO",
    description:
      "Sequência de estudo pensada para o seu perfil. Sem revisitar o que já domina, sem pular o que ainda falta.",
    visual: <RoadmapVisual />,
  },
  {
    title: "Ebook Completo",
    category: "CONTEÚDO",
    description:
      "Do zero ao avançado para ter sua própria IA no computador — com trilha sem código para quem não programa.",
    visual: <EbookVisual />,
  },
  {
    title: "Relatórios Estratégicos",
    category: "LEITURA RÁPIDA",
    description:
      "Panoramas e comparativos diretos sobre modelos e hardware, pra decidir rápido sem precisar ler o manual todo.",
    visual: <RelatorioVisual />,
  },
  {
    title: "Podcast",
    category: "ÁUDIO",
    description:
      "Episódios sobre IA local pra ouvir no trajeto, sem precisar estar na tela.",
    visual: <PodcastVisual />,
    soon: true,
  },
  {
    title: "Pesquisa com a Comunidade",
    category: "DADOS REAIS",
    description:
      "Responda em segundos e acompanhe os dados da comunidade crescendo em tempo real.",
    visual: <PesquisaVisual />,
  },
  {
    title: "Sistema de XP",
    category: "PROGRESSO",
    description:
      "Ganhe XP a cada ebook concluído e a cada validação de conhecimento aprovada.",
    visual: <XpVisual />,
  },
  {
    title: "Quiz de Validação",
    category: "AVALIAÇÃO",
    description:
      "15 perguntas com dica sempre visível. Aprovação a partir de 70% libera seu certificado.",
    visual: <ValidacaoVisual />,
  },
  {
    title: "Certificado Verificável",
    category: "RECONHECIMENTO",
    description:
      "Certificado com QR code, verificável publicamente em matrizcentral.com.br/verify.",
    visual: <CertificadoVisual />,
  },
];

export default function FeaturesGrid() {
  return (
    <section id="features">
      <div className="container">
        <div className="sec-head">
          <div>
            <span className="sec-tag mono">
              <i>✦</i> Nossas features
            </span>
            <h2>Um sistema, não um ebook solto.</h2>
          </div>
          <div className="aside">
            Ebook, relatórios, quiz de perfil, roadmap gerado por IA e
            certificado — cada formato existe pra um jeito diferente de
            aprender, sem enrolação.
          </div>
        </div>

        <div className="cards">
          {FEATURES.map((feature) => (
            <div className="card" key={feature.title}>
              <div className="card-visual">
                <span className="card-tag mono">{feature.category}</span>
                {feature.soon && <span className="card-badge-soon mono">Em breve</span>}
                {feature.visual}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
