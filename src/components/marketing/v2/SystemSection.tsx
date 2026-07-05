import { Reveal, Stagger, StaggerItem } from "./motion-primitives";

const ITEMS = [
  {
    benefit: "Aprenda no seu ritmo",
    feature: "Ebook Técnico",
    description:
      "9 capítulos organizados para levar você do primeiro modelo até uma utilização prática da IA local, mesmo sem experiência prévia.",
    image:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=60",
    accent: false,
  },
  {
    benefit: "Receba uma orientação personalizada",
    feature: "Diagnóstico Inicial",
    description:
      "O sistema identifica seu contexto de uso e recomenda a trilha mais adequada para começar.",
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=60",
    accent: true,
  },
  {
    benefit: "Acompanhe sua evolução",
    feature: "Roadmap Inteligente",
    description:
      "Cada etapa concluída desbloqueia a próxima, permitindo acompanhar claramente sua evolução.",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=60",
    accent: false,
  },
  {
    benefit: "Comprove seu conhecimento",
    feature: "Certificação Verificável",
    description:
      "Após concluir sua trilha e validação, gere um certificado com autenticação pública.",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=60",
    accent: true,
  },
];

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
              key={item.feature}
              className={`mc-system-card${item.accent ? " is-accent" : ""}`}
            >
              <div className="mc-system-image-wrap">
                <img
                  src={item.image}
                  alt=""
                  aria-hidden="true"
                  className="mc-system-image"
                  loading="lazy"
                />
              </div>
              <div className="mc-system-card-body">
                <span className="mc-tag">{item.benefit}</span>
                <h3 className="mc-display">{item.feature}</h3>
                <p>{item.description}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
