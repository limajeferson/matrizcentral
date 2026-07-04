import DemoWidget from "@/components/marketing/DemoWidget";
import NetworkMotif from "@/components/marketing/NetworkMotif";

export default function Hero() {
  return (
    <div className="container hero" id="hero">
      <NetworkMotif className="hero-motif" />
      <span className="badge mono">
        <i>✦</i> Para quem quer dominar IA — programando ou não
      </span>
      <h1>Construa Seu Próprio ChatGPT Particular em Menos de uma Hora</h1>
      <p>
        Cansado de pagar mensalidade em ChatGPT Plus ou Claude Pro pra um
        serviço que pode mudar de preço ou sair do ar? Este ebook mostra como
        rodar sua própria IA local — sem mensalidade, sem depender da nuvem
        e sem precisar ser especialista.
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
        Pare de Pagar por IA — Monte sua própria IA Local, sem depender de
        mensalidade ou nuvem.
      </p>

      <DemoWidget />
    </div>
  );
}
