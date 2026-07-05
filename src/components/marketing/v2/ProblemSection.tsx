import { annualSpendBRL, formatBRL } from "@/lib/annual-spend";
import { AnimatedCounter, Reveal } from "./motion-primitives";

export default function ProblemSection() {
  return (
    <section className="mc-section">
      <div className="mc-container">
        <div className="mc-block-accent mc-problem">
          <Reveal>
            <span className="mc-tag">O problema</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mc-display">
              Assinatura de IA é aluguel sem escritura
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mc-problem-sub">
              ChatGPT Plus e Claude Pro podem mudar de preço, limitar uso ou
              sair do ar — e o que você paga por mês nunca vira patrimônio.
              Em um ano, duas assinaturas custam cerca de:
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="mc-problem-counter mc-display" aria-label={formatBRL(annualSpendBRL())}>
              <AnimatedCounter value={annualSpendBRL()} format={formatBRL} />
              <span className="mc-problem-per">/ano</span>
            </p>
          </Reveal>
          <Reveal delay={0.4}>
            <p className="mc-problem-vs mc-mono">
              vs R$47 · pagamento único · IA rodando na sua máquina
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
