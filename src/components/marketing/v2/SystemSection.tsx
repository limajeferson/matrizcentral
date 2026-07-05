import { Reveal, Stagger, StaggerItem } from "./motion-primitives";

const ITEMS = [
  {
    tag: "CONTEÚDO",
    title: "Ebook completo",
    description:
      "9 capítulos do zero ao avançado para rodar LLMs localmente — com trilha sem código para quem não programa.",
    accent: false,
    bars: [36, 52, 44, 68, 84],
  },
  {
    tag: "TRIAGEM + APRENDIZADO",
    title: "Trilha sob medida",
    description:
      "Quiz de perfil mapeia sua stack, nível e objetivos; o roadmap evita que você estude o que já domina.",
    accent: true,
    bars: [28, 44, 60, 72, 90],
  },
  {
    tag: "PROGRESSO",
    title: "Dashboard com XP",
    description:
      "Cada ebook concluído e cada quiz aprovado somam XP. Progresso visível a cada etapa.",
    accent: false,
    bars: [20, 36, 48, 66, 80],
  },
  {
    tag: "RECONHECIMENTO",
    title: "Certificado verificável",
    description:
      "Quiz de validação com 15 questões; 70% de acerto libera certificado com QR code verificável publicamente.",
    accent: true,
    bars: [40, 55, 65, 78, 96],
  },
];

function CardVisual({ bars, accent }: { bars: number[]; accent: boolean }) {
  const fill = accent ? "rgba(255,255,255,0.85)" : "#7c5cff";
  const dim = accent ? "rgba(255,255,255,0.3)" : "rgba(124,92,255,0.3)";
  return (
    <svg viewBox="0 0 160 110" width="100%" aria-hidden="true">
      {bars.map((h, i) => (
        <rect
          key={i}
          x={16 + i * 28}
          y={100 - h}
          width="18"
          height={h}
          rx="4"
          fill={i === bars.length - 1 ? fill : dim}
        />
      ))}
    </svg>
  );
}

export default function SystemSection() {
  return (
    <section className="mc-section" id="sistema">
      <div className="mc-container">
        <Reveal>
          <span className="mc-tag">O sistema</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mc-display mc-system-heading">
            Um sistema,
            <br />
            não um ebook solto
          </h2>
        </Reveal>
        <Stagger className="mc-system-grid">
          {ITEMS.map((item) => (
            <StaggerItem
              key={item.title}
              className={`mc-system-card${item.accent ? " is-accent" : ""}`}
            >
              <span className="mc-tag">{item.tag}</span>
              <h3 className="mc-display">{item.title}</h3>
              <p>{item.description}</p>
              <div className="mc-system-visual">
                <CardVisual bars={item.bars} accent={item.accent} />
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
