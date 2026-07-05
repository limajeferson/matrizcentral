import NetworkField from "./NetworkField";
import { Reveal } from "./motion-primitives";

export default function ClosingSection() {
  return (
    <section className="mc-section mc-closing">
      <div className="mc-closing-motif" aria-hidden="true">
        <NetworkField />
      </div>
      <div className="mc-container mc-closing-content">
        <Reveal>
          <h2 className="mc-display">
            Pare de pagar aluguel
            <br />
            para usar <span className="mc-accent-text">IA</span>.
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mc-closing-sub">
            Comece a construir algo que é seu. Aprenda a rodar modelos de IA
            localmente com um sistema organizado que acompanha sua evolução
            do primeiro passo até a certificação.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="mc-closing-cta">
            <a className="mc-btn mc-btn-accent" href="/oferta">
              Quero por R$47
            </a>
            <p className="mc-closing-cta-note">
              Pagamento único. Acesso imediato. Sem mensalidade.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
