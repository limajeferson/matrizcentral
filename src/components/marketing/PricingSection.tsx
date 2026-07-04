const FEATURES: string[] = [
  "Ebook completo (9 capítulos) sobre rodar LLMs localmente",
  "Triagem de perfil personalizada",
  "Roadmap de estudo sob medida para o seu perfil",
  "Quiz de validação com certificado de conclusão",
];

export default function PricingSection() {
  return (
    <section className="pricing" id="preco">
      <div className="container">
        <div className="sec-head">
          <div>
            <span className="sec-tag mono">
              <i>✦</i> Preço simples
            </span>
            <h2>A partir de R$47, sem mensalidade</h2>
          </div>
          <div className="aside">
            Comece com o ebook avulso ou veja os planos com mais ebooks e
            acesso completo ao hub de conteúdo.
          </div>
        </div>

        <div className="plan-single">
          <div className="plan gradient">
            <span className="plan-tag mono">A partir de</span>
            <h3>Ebook Avulso</h3>
            <div className="price">
              <b>R$47</b>
              <small>
                pagamento único
                <br />
                1 ebook completo
              </small>
            </div>
            <a className="btn btn-dark" href="/oferta">
              Ver todos os planos
            </a>
            <ul>
              {FEATURES.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <span className="foot" style={{ color: "#4c1d95" }}>
              Planos mensal e anual com mais ebooks disponíveis em /oferta
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
