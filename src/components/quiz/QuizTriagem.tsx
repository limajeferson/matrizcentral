"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QUIZ_TRIAGEM } from "@/data/quiz-triagem";

interface Props {
  token: string;
}

export default function QuizTriagem({ token }: Props) {
  const router = useRouter();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: number; selectedOptionIndexes: number[] }[]>([]);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const question = QUIZ_TRIAGEM[currentQ];
  const isLast = currentQ === QUIZ_TRIAGEM.length - 1;

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

    if (!isLast) {
      setCurrentQ((prev) => prev + 1);
      return;
    }

    setSubmitting(true);
    const response = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, quizType: "triagem", answers: updatedAnswers }),
    });

    if (response.ok) {
      router.push(`/dashboard/${token}`);
      return;
    }

    setSubmitting(false);
    setError("Não foi possível calcular seu perfil agora. Tente novamente.");
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <p className="mb-2 text-sm text-zinc-500">
        Pergunta {currentQ + 1} de {QUIZ_TRIAGEM.length}
      </p>
      <div className="mb-6 h-2 w-full rounded-full bg-zinc-200">
        <div
          className="h-2 rounded-full bg-violet-600 transition-all"
          style={{ width: `${((currentQ + 1) / QUIZ_TRIAGEM.length) * 100}%` }}
        />
      </div>

      <h2 className="mb-4 text-lg font-semibold text-zinc-900">{question.text}</h2>

      <div className="space-y-3">
        {question.options.map((option, index) => (
          <button
            key={option.text}
            type="button"
            onClick={() => toggleOption(index)}
            className={`w-full rounded-lg border-2 p-3 text-left transition ${
              selectedIndexes.includes(index)
                ? "border-violet-500 bg-violet-50"
                : "border-zinc-300 hover:border-violet-300"
            }`}
          >
            {option.text}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={handleNext}
        disabled={selectedIndexes.length === 0 || submitting}
        className="mt-6 w-full rounded-lg bg-violet-600 py-3 font-bold text-white transition hover:bg-violet-700 disabled:opacity-50"
      >
        {isLast ? (submitting ? "Calculando seu perfil..." : "Ver meu perfil") : "Próxima"}
      </button>
    </div>
  );
}
