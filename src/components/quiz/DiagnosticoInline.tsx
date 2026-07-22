"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QUIZ_TRIAGEM } from "@/data/quiz-triagem";
import { visibleQuestions } from "@/lib/quiz-branching";
import { CAPACITY_QUESTIONS } from "@/lib/capacity";
import type { TriagemQuestion } from "@/lib/quiz-scoring";

type AskableQuestion = {
  id: number;
  text: string;
  type: "radio" | "checkbox";
  options: { text: string }[];
  showIf?: TriagemQuestion["showIf"];
};

interface DiagnosticoInlineProps {
  mode?: "completo" | "capacidade";
  /** Chamado quando o envio é bem-sucedido (após o `router.refresh()`). O
   *  refresh sozinho não desmonta este componente — ele preserva estado de
   *  client components — então quem controla a condição de montagem (ex.:
   *  SeuCaminhoCard com `refazendo`) usa isto para voltar ao estado normal. */
  onDone?: () => void;
}

export default function DiagnosticoInline({ mode = "completo", onDone }: DiagnosticoInlineProps) {
  const router = useRouter();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: number; selectedOptionIndexes: number[] }[]>([]);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bank: AskableQuestion[] = mode === "capacidade"
    ? CAPACITY_QUESTIONS
    : [...QUIZ_TRIAGEM, ...CAPACITY_QUESTIONS];

  const visible = visibleQuestions(bank, answers);
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

    const updatedVisible = visibleQuestions(bank, updatedAnswers);
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
        onDone?.();
        return;
      }
    } catch {
      // cai no erro abaixo
    }
    setSubmitting(false);
    setError("Não foi possível salvar seu diagnóstico agora. Tente novamente.");
  };

  const title = mode === "capacidade"
    ? "Complete seu diagnóstico"
    : "Responda 1 minuto e personalizamos seu feed";
  const subtitle = mode === "capacidade"
    ? "2 perguntas para calibrar as recomendações ao seu equipamento"
    : null;
  const submitLabel = mode === "capacidade" ? "Calibrar recomendações" : "Personalizar meu feed";

  return (
    <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5 dark:border-violet-800 dark:bg-violet-950/40">
      <p className="mb-1 text-sm font-semibold text-violet-700 dark:text-violet-300">Boas-vindas</p>
      <h2 className="mb-3 text-lg font-bold text-zinc-900 dark:text-zinc-100">{title}</h2>
      {subtitle && (
        <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{subtitle}</p>
      )}
      <p className="mb-1 text-sm text-zinc-500 dark:text-zinc-400">
        Pergunta {currentQ + 1} de {visible.length}
      </p>
      <h3 className="mb-3 font-semibold text-zinc-900 dark:text-zinc-100">{question.text}</h3>
      <div className="space-y-2">
        {question.options.map((option, index) => (
          <button
            key={option.text}
            type="button"
            onClick={() => toggleOption(index)}
            className={`w-full rounded-xl border-2 p-3 text-left transition ${
              selectedIndexes.includes(index)
                ? "border-violet-500 bg-white dark:bg-zinc-800 dark:text-zinc-100"
                : "border-zinc-200 bg-white hover:border-violet-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-violet-500"
            }`}
          >
            {option.text}
          </button>
        ))}
      </div>
      {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
      <button
        type="button"
        onClick={handleNext}
        disabled={selectedIndexes.length === 0 || submitting}
        className="mt-4 w-full rounded-xl bg-violet-600 py-3 font-bold text-white transition hover:bg-violet-700 disabled:opacity-50"
      >
        {isLast ? (submitting ? "Salvando..." : submitLabel) : "Próxima"}
      </button>
    </div>
  );
}
