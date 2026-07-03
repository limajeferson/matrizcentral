"use client";

import { useState } from "react";

const TABS = [
  { id: "quiz", label: "Quiz de Perfil" },
  { id: "roadmap", label: "Roadmap" },
  { id: "ebook", label: "Ebook" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function DemoWidget() {
  const [active, setActive] = useState<TabId>("quiz");

  return (
    <div className="mx-auto mt-11 max-w-2xl rounded-[20px] border border-zinc-200 bg-zinc-50 p-5 text-left shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="mb-4 flex flex-wrap gap-2 font-marketing-mono">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={`rounded-full px-4 py-2 text-[11px] font-medium uppercase tracking-wide transition ${
              active === tab.id
                ? "border border-zinc-900 bg-zinc-900 text-white"
                : "border border-zinc-200 bg-white text-zinc-500 hover:border-zinc-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        {active === "quiz" && (
          <div>
            <p className="mb-1 font-marketing-mono text-[11px] font-medium uppercase tracking-wide text-zinc-400">
              Questão 3 de 20
            </p>
            <div className="mb-4 h-1.5 w-full rounded-full bg-zinc-100">
              <div className="h-1.5 w-[15%] rounded-full bg-violet-600" />
            </div>
            <p className="mb-4 font-semibold text-zinc-900">
              Qual é sua principal linguagem de programação?
            </p>
            <div className="space-y-2">
              {["Python", "JavaScript/TypeScript", "Go/Rust", "Não programo"].map(
                (option) => (
                  <div
                    key={option}
                    className="rounded-xl border border-zinc-200 px-4 py-2 text-sm text-zinc-600"
                  >
                    {option}
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {active === "roadmap" && (
          <div className="space-y-4">
            <p className="font-marketing-mono text-[11px] font-medium uppercase tracking-wide text-zinc-400">
              Seu roadmap — semana 1
            </p>
            <div className="rounded-xl border-l-4 border-violet-400 bg-violet-50 p-4">
              <p className="font-semibold text-zinc-900">Fundação: Setup Local</p>
              <p className="text-sm text-zinc-600">
                Leia cap. 1-2, instale o Ollama e teste seus próprios prompts.
              </p>
            </div>
            <div className="rounded-xl border-l-4 border-zinc-200 p-4">
              <p className="font-semibold text-zinc-400">Semana 2 — bloqueada</p>
              <p className="text-sm text-zinc-400">
                Libera após concluir a semana 1.
              </p>
            </div>
          </div>
        )}

        {active === "ebook" && (
          <div>
            <p className="mb-2 font-marketing-mono text-[11px] font-medium uppercase tracking-wide text-zinc-400">
              Construa Seu Próprio ChatGPT Particular
            </p>
            <p className="mb-4 text-sm text-zinc-600">
              9 capítulos: da escolha do modelo ao troubleshooting real de
              hardware. Sem enrolação.
            </p>
            <div className="flex items-center gap-2 text-sm font-semibold text-violet-700">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100">
                ✓
              </span>
              120+ páginas de conteúdo técnico
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
