"use client";

import QuizValidacao from "./QuizValidacao";

interface Props {
  token: string;
}

export default function QuizValidacaoContainer({ token }: Props) {
  const handleComplete = async (score: number, passed: boolean) => {
    await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, quizType: "validacao", score, passed }),
    });
  };

  return <QuizValidacao token={token} onComplete={handleComplete} />;
}
