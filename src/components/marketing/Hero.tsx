import DemoWidget from "@/components/marketing/DemoWidget";

export default function Hero() {
  return (
    <div className="container hero" id="hero">
      <span className="badge mono">
        <i>✦</i> Para quem quer dominar IA — programando ou não
      </span>
      <h1>Construa Seu Próprio ChatGPT Particular em Poucos Minutos</h1>
      <p>
        O guia definitivo para ter sua própria IA rodando no seu computador —
        sem pagar mensalidade, sem depender da nuvem e sem precisar ser
        especialista.
      </p>

      <div className="hero-cta">
        <a className="btn btn-accent" href="/oferta">
          Quero por R$47
        </a>
        <a className="btn btn-ghost" href="#features">
          Ver o que você recebe
        </a>
      </div>

      <p className="hero-note">
        Pare de Pagar por IA — Monte sua própria IA Local em menos de uma hora.
      </p>

      <DemoWidget />
    </div>
  );
}
