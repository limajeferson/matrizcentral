import { CAPACITY_PATHS } from "@/lib/capacity";
import { Reveal } from "./motion-primitives";

/** Ordem de exibição fixa: da mais aspiracional à mais acessível. */
const DISPLAY_ORDER = ["performance", "equilibrio", "essencial"] as const;

export default function MomentSection() {
  return (
    <section className="mc-section" id="momento">
      <div className="mc-container">
        <Reveal>
          <span className="mc-tag">Qual é o seu momento?</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mc-display">
            Um caminho para
            <br />
            cada ponto de partida
          </h2>
        </Reveal>

        <div className="mc-moment-grid">
          {DISPLAY_ORDER.map((tier, index) => {
            const path = CAPACITY_PATHS[tier];
            return (
              <Reveal key={path.tier} delay={0.05 * index}>
                <div className="mc-moment-card">
                  <h3 className="mc-display">{path.publicName}</h3>
                  <p className="mc-moment-tagline">{path.tagline}</p>
                  <p className="mc-moment-setup">{path.setup}</p>
                  <a className="mc-btn mc-btn-accent" href="/oferta">
                    Começar por R$47
                  </a>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
