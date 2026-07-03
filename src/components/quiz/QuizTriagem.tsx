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
    <div className="max-w-2xl mx-auto p-6">
      <p className="text-sm text-gray-500 mb-2">
        Pergunta {currentQ + 1} de {QUIZ_TRIAGEM.length}
      </p>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: `${((currentQ + 1) / QUIZ_TRIAGEM.length) * 100}%` }}
        />
      </div>

      <h2 className="text-lg font-semibold mb-4">{question.text}</h2>

      <div className="space-y-3">
        {question.options.map((option, index) => (
          <button
            key={option.text}
            type="button"
            onClick={() => toggleOption(index)}
            className={`w-full text-left p-3 border-2 rounded-lg transition ${
              selectedIndexes.includes(index)
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-blue-300"
            }`}
          >
            {option.text}
          </button>
        ))}
      </div>

      {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

      <button
        type="button"
        onClick={handleNext}
        disabled={selectedIndexes.length === 0 || submitting}
        className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-bold disabled:opacity-50"
      >
        {isLast ? (submitting ? "Calculando seu perfil..." : "Ver meu perfil") : "Próxima"}
      </button>
    </div>
  );
}
