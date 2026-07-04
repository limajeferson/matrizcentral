"use client";

import { useState } from "react";

const PILLS = [
  { id: "xp", label: "Sua curva de XP" },
  { id: "semana", label: "Por semana" },
] as const;

type PillId = (typeof PILLS)[number]["id"];

export default function AdvantagesSection() {
  const [active, setActive] = useState<PillId>("xp");

  return (
    <section className="advantages">
      <div className="container">
        <div className="sec-head">
          <div>
            <span className="sec-tag mono">
              <i>✦</i> Seus resultados
            </span>
            <h2>Seu XP cresce a cada semana de estudo real</h2>
          </div>
          <div className="aside">
            Cada ebook concluído e cada quiz aprovado somam XP. O roadmap
            personalizado evita que você estude o que já domina — foco só no
            que ainda falta.
          </div>
        </div>

        <div className="chart-card">
          <div className="pill-row">
            {PILLS.map((pill) => (
              <button
                key={pill.id}
                type="button"
                className={`pill${active === pill.id ? " active" : ""}`}
                onClick={() => setActive(pill.id)}
              >
                {pill.label}
              </button>
            ))}
          </div>
          <div className="chart-wrap">
            <svg viewBox="0 0 800 220" width="100%" preserveAspectRatio="none" style={{ display: "block" }}>
              <defs>
                <linearGradient id="xpFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <path
                d="M0 200 C120 195 180 170 260 150 C360 125 420 80 520 55 C620 32 700 22 800 15 L800 220 L0 220 Z"
                fill="url(#xpFill)"
              />
              <path
                d="M0 200 C120 195 180 170 260 150 C360 125 420 80 520 55 C620 32 700 22 800 15"
                fill="none"
                stroke="#7c3aed"
                strokeWidth="3"
              />
            </svg>
          </div>
          <div className="chart-weeks mono">
            <span>Sem 1</span>
            <span>Sem 2</span>
            <span>Sem 3</span>
            <span>Sem 4</span>
            <span>Sem 5</span>
            <span>Sem 6</span>
          </div>
          <div className="chart-feats">
            <div className="feat">
              <h4>
                <i>✦</i> Roadmap sob medida
              </h4>
              <p>Sequência definida pelo seu perfil, sem revisitar o que já sabe.</p>
            </div>
            <div className="feat">
              <h4>
                <i>◍</i> Validação real
              </h4>
              <p>Quiz de 15 questões com 70% mínimo libera o certificado.</p>
            </div>
            <div className="feat">
              <h4>
                <i>◔</i> Progresso visível
              </h4>
              <p>XP acumulado no dashboard a cada etapa concluída.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
