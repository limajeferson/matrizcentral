"use client";

import { useState } from "react";
import { QUIZ_TRIAGEM } from "@/data/quiz-triagem";
import { Reveal } from "./motion-primitives";

// Preview (isca de valor): 3 perguntas REAIS da triagem, sem pontuação nem
// backend — só para o visitante sentir a personalização antes de comprar.
const PREVIEW_IDS = [1, 2, 7];
const PREVIEW = PREVIEW_IDS.map(
  (id) => QUIZ_TRIAGEM.find((q) => q.id === id)!,
);

export default function TriagemPreview() {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const done = step >= PREVIEW.length;
  const question = done ? null : PREVIEW[step];

  const next = () => {
    setStep((s) => s + 1);
    setPicked(null);
  };

  const restart = () => {
    setStep(0);
    setPicked(null);
  };

  return (
    <section className="mc-section" id="diagnostico">
      <div className="mc-container">
        <Reveal>
          <span className="mc-tag">Diagnóstico inicial</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mc-display mc-triagem-heading">
            Um diagnóstico,
            <br />
            não um teste
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mc-triagem-sub">
            Responda 3 perguntas rápidas e veja como a Matriz Central monta uma
            trilha sob medida para o seu contexto — sem precisar saber programar.
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mc-triagem-card">
            {!done && question ? (
              <>
                <div className="mc-triagem-progress mc-mono">
                  Pergunta {step + 1} de {PREVIEW.length}
                </div>
                <h3 className="mc-triagem-q">{question.text}</h3>
                <div className="mc-triagem-options">
                  {question.options.map((opt, i) => (
                    <button
                      key={opt.text}
                      type="button"
                      className={`mc-triagem-option${picked === i ? " is-picked" : ""}`}
                      onClick={() => setPicked(i)}
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="mc-btn mc-btn-accent mc-triagem-next"
                  disabled={picked === null}
                  onClick={next}
                >
                  {step === PREVIEW.length - 1 ? "Ver minha trilha" : "Próxima"}
                </button>
              </>
            ) : (
              <div className="mc-triagem-result">
                <span className="mc-triagem-check" aria-hidden="true">✦</span>
                <h3 className="mc-display">Sua trilha está pronta para começar</h3>
                <p>
                  Com base nas suas respostas, montamos um ponto de partida, um
                  roadmap e o tempo estimado — tudo personalizado. O diagnóstico
                  completo e a trilha são liberados assim que você entra.
                </p>
                <a className="mc-btn mc-btn-accent" href="/oferta">
                  Quero minha trilha por R$47
                </a>
                <button type="button" className="mc-triagem-restart mc-mono" onClick={restart}>
                  Refazer
                </button>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
