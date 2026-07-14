"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QUIZ_TRIAGEM } from "@/data/quiz-triagem";
import { visibleQuestions } from "@/lib/quiz-branching";

export default function DiagnosticoInline() {
  const router = useRouter();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: number; selectedOptionIndexes: number[] }[]>([]);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visible = visibleQuestions(QUIZ_TRIAGEM, answers);
  const question = visible[currentQ];
  const isLast = currentQ === visible.length - 1;

  const toggleOption = (index: number) => {
    if (question.type === "radio") {
      setSelectedIndexes([index]);
    } else {
      setSelectedIndexes((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    }
  };

  const handleNext = async () => {
    const updatedAnswers = [...answers, { questionId: question.id, selectedOptionIndexes: selectedIndexes }];
    setAnswers(updatedAnswers);
    setSelectedIndexes([]);
    setError(null);

    const updatedVisible = visibleQuestions(QUIZ_TRIAGEM, updatedAnswers);
    if (currentQ + 1 < updatedVisible.length) {
      setCurrentQ((prev) => prev + 1);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/diagnostico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: updatedAnswers }),
      });
      if (res.ok) {
        router.refresh(); // o feed re-renderiza sem o bloco de boas-vindas
        return;
      }
    } catch {
      // cai no erro abaixo
    }
    setSubmitting(false);
    setError("Não foi possível salvar seu diagnóstico agora. Tente novamente.");
  };

  return (
    <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5">
      <p className="mb-1 text-sm font-semibold text-violet-700">Boas-vindas</p>
      <h2 className="mb-3 text-lg font-bold text-zinc-900">
        Responda 1 minuto e personalizamos seu feed
      </h2>
      <p className="mb-1 text-sm text-zinc-500">
        Pergunta {currentQ + 1} de {visible.length}
      </p>
      <h3 className="mb-3 font-semibold text-zinc-900">{question.text}</h3>
      <div className="space-y-2">
        {question.options.map((option, index) => (
          <button
            key={option.text}
            type="button"
            onClick={() => toggleOption(index)}
            className={`w-full rounded-xl border-2 p-3 text-left transition ${
              selectedIndexes.includes(index)
                ? "border-violet-500 bg-white"
                : "border-zinc-200 bg-white hover:border-violet-300"
            }`}
          >
            {option.text}
          </button>
        ))}
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <button
        type="button"
        onClick={handleNext}
        disabled={selectedIndexes.length === 0 || submitting}
        className="mt-4 w-full rounded-xl bg-violet-600 py-3 font-bold text-white transition hover:bg-violet-700 disabled:opacity-50"
      >
        {isLast ? (submitting ? "Salvando..." : "Personalizar meu feed") : "Próxima"}
      </button>
    </div>
  );
}
