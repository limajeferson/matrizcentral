const FEATURES: string[] = [
  "Ebook completo (9 capítulos) sobre rodar LLMs localmente",
  "Triagem de perfil personalizada",
  "Roadmap de estudo sob medida para o seu perfil",
  "Um segundo ebook grátis, escolhido pelo seu perfil",
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
            <h2>Pague uma vez, acesse pra sempre</h2>
          </div>
          <div className="aside">
            Sem mensalidade, sem pegadinha — um pagamento único dá acesso
            vitalício a tudo: ebook, roadmap, quiz e certificado.
          </div>
        </div>

        <div className="plan-single">
          <div className="plan">
            <span className="plan-tag mono">Pagamento único</span>
            <h3>Acesso Completo</h3>
            <div className="price">
              <b>R$47</b>
              <small>
                sem mensalidade
                <br />
                acesso vitalício
              </small>
            </div>
            <a className="btn btn-dark" href="#hero">
              Comprar agora
            </a>
            <ul>
              {FEATURES.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <span className="foot">Pagamento único via PIX, cartão ou boleto</span>
          </div>
        </div>
      </div>
    </section>
  );
}
