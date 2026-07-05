import NetworkField from "./NetworkField";
import { Reveal } from "./motion-primitives";

export default function FinalCtaV2() {
  return (
    <section className="mc-section mc-final">
      <div className="mc-final-motif" aria-hidden="true">
        <NetworkField />
      </div>
      <div className="mc-container mc-final-content">
        <Reveal>
          <h2 className="mc-display">
            Sua IA.
            <br />
            Sua <span className="mc-accent-text">máquina</span>.
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mc-final-sub">
            Descubra seu perfil, siga um roadmap sob medida e valide o que
            aprendeu com um certificado verificável.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <a className="mc-btn mc-btn-accent" href="/oferta">
            Quero por R$47
          </a>
        </Reveal>
      </div>
    </section>
  );
}
