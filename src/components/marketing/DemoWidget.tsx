"use client";

import { useState } from "react";
import { IconFire } from "./v2/icons";

const TABS = [
  { id: "quiz", label: "Diagnóstico" },
  { id: "roadmap", label: "Roadmap" },
  { id: "ebook", label: "Ebook" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function XpRing() {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const progress = 0.62;
  const offset = circumference * (1 - progress);

  return (
    <div className="xp-ring">
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#ede9fe" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#7c3aed"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="xp-value">
        <b>340</b>
        <span className="mono">XP</span>
      </div>
    </div>
  );
}

export default function DemoWidget() {
  const [active, setActive] = useState<TabId>("quiz");

  return (
    <div className="demo">
      <div className="demo-tabs mono">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`tab${active === tab.id ? " active" : ""}`}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="demo-body">
        <div>
          {active === "quiz" && (
            <div>
              <span className="create-label mono">Diagnóstico inicial · 2 de 7</span>
              <div className="quiz-progress">
                <span style={{ width: "29%" }} />
              </div>
              <p className="quiz-question">
                Qual sua principal ferramenta de IA?
              </p>
              <div className="quiz-options">
                {["ChatGPT-5.6 Sol", "Gemini 3.1 Pro", "Claude Opus 4.8", "Outro modelo"].map((option) => (
                  <div key={option} className="quiz-option">
                    {option}
                  </div>
                ))}
              </div>
            </div>
          )}

          {active === "roadmap" && (
            <div>
              <span className="create-label mono">Seu roadmap — semana 1</span>
              <div className="roadmap-step active">
                <b>Fundação: Setup Local</b>
                <p>Leia cap. 1-2, instale o Ollama e teste seus próprios prompts.</p>
              </div>
              <div className="roadmap-step locked">
                <b>Semana 2 — bloqueada</b>
                <p>Libera após concluir a semana 1.</p>
              </div>
            </div>
          )}

          {active === "ebook" && (
            <div>
              <span className="create-label mono">
                Construa Seu Próprio ChatGPT Particular
              </span>
              <p style={{ marginBottom: 16, fontSize: 14, color: "var(--ink-soft)" }}>
                9 capítulos: da escolha do modelo ao troubleshooting real de
                hardware. Sem enrolação.
              </p>
              <div className="ebook-check">
                <span>✓</span>
                120+ páginas de conteúdo técnico
              </div>
            </div>
          )}
        </div>

        <div className="voice-side">
          <XpRing />
          <span className="streak mono">
            <IconFire className="streak-icon" /> 5 dias seguidos
          </span>
        </div>
      </div>
    </div>
  );
}
