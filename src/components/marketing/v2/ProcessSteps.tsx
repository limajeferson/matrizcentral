import NetworkField from "./NetworkField";
import { Reveal } from "./motion-primitives";

const STEPS = [
  {
    number: "01",
    title: "Garanta seu acesso",
    description:
      "Pagamento único de R$47. Sem mensalidade, sem fidelidade, acesso imediato.",
  },
  {
    number: "02",
    title: "Descubra sua trilha",
    description:
      "O quiz de perfil mapeia sua stack, nível e objetivos e gera um roadmap de estudo sob medida.",
  },
  {
    number: "03",
    title: "Estude e suba de nível",
    description:
      "Cada capítulo concluído soma XP no dashboard. Valide com o quiz final e emita seu certificado verificável.",
  },
];

export default function ProcessSteps() {
  return (
    <section className="mc-section" id="processo">
      <div className="mc-container">
        <Reveal>
          <span className="mc-tag">Como funciona</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mc-display">Três passos até sua IA própria</h2>
        </Reveal>
      </div>
      <div className="mc-steps">
        {STEPS.map((step, i) => (
          <div className="mc-step" key={step.number} style={{ top: `${72 + i * 20}px` }}>
            <div className="mc-container mc-step-inner">
              <span className="mc-step-number mc-display">{step.number}</span>
              <div className="mc-step-body">
                <p className="mc-mono mc-step-label">Passo {step.number}</p>
                <h3 className="mc-display">{step.title}</h3>
                <p className="mc-step-desc">{step.description}</p>
              </div>
              <div className="mc-step-motif" aria-hidden="true">
                <NetworkField />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
