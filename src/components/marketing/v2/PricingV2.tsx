import { Reveal } from "./motion-primitives";

const INCLUDED = [
  "Ebook completo (9 capítulos) sobre rodar LLMs localmente",
  "Triagem de perfil personalizada",
  "Roadmap de estudo sob medida para o seu perfil",
  "Quiz de validação com certificado de conclusão",
];

export default function PricingV2() {
  return (
    <section className="mc-section" id="preco">
      <div className="mc-container">
        <Reveal>
          <span className="mc-tag">Preço simples</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mc-display">
            R$47. Sem mensalidade.
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mc-price-card">
            <div className="mc-price-main">
              <span className="mc-tag">A partir de</span>
              <p className="mc-price-value mc-display">
                R$47<span className="mc-price-note">pagamento único</span>
              </p>
              <a className="mc-btn mc-btn-accent" href="/oferta">
                Ver todos os planos
              </a>
            </div>
            <ul className="mc-price-list">
              {INCLUDED.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal delay={0.3}>
          <p className="mc-price-foot mc-mono">
            Planos mensal e anual (em breve) com mais ebooks — lista de espera em /oferta
          </p>
        </Reveal>
      </div>
    </section>
  );
}
