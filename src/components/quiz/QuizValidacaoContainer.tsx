"use client";

import QuizValidacao from "./QuizValidacao";

interface Props {
  token: string;
}

export default function QuizValidacaoContainer({ token }: Props) {
  const handleComplete = async (
    answers: { questionId: number; selected: "A" | "B" | "C" | "D" }[]
  ) => {
    await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, quizType: "validacao", answers }),
    });
  };

  return <QuizValidacao token={token} onComplete={handleComplete} />;
}
