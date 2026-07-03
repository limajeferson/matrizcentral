"use client";

import { useState, useEffect } from "react";
import { QUIZ_LLM_LOCAL, QUIZ_CONFIG } from "@/data/quiz-llm-local";
import { CheckCircle, XCircle, Lightbulb, Trophy, RotateCcw, ChevronRight } from "lucide-react";

type AnswerState = "unanswered" | "correct" | "incorrect";

interface UserAnswer {
  questionId: number;
  selected: "A" | "B" | "C" | "D";
  isCorrect: boolean;
}

interface QuizProps {
  token: string;
  onComplete: (score: number, passed: boolean) => void;
}

export default function QuizValidacao({ token, onComplete }: QuizProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [selected, setSelected] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>("unanswered");
  const [showResult, setShowResult] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  const question = QUIZ_LLM_LOCAL[currentQ];
  const progress = ((currentQ) / QUIZ_LLM_LOCAL.length) * 100;
  const totalQuestions = QUIZ_LLM_LOCAL.length;

  const handleSelect = (option: "A" | "B" | "C" | "D") => {
    if (answerState !== "unanswered") return;
    setSelected(option);
  };

  const handleConfirm = () => {
    if (!selected) return;

    const isCorrect = selected === question.correctAnswer;
    const newAnswer: UserAnswer = {
      questionId: question.id,
      selected,
      isCorrect,
    };

    setAnswers((prev) => [...prev, newAnswer]);
    setAnswerState(isCorrect ? "correct" : "incorrect");
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentQ < totalQuestions - 1) {
      setCurrentQ((prev) => prev + 1);
      setSelected(null);
      setAnswerState("unanswered");
      setShowResult(false);
    } else {
      setQuizFinished(true);
    }
  };

  const score = answers.filter((a) => a.isCorrect).length;
  const scorePercent = Math.round((score / totalQuestions) * 100);
  const passed = scorePercent >= QUIZ_CONFIG.passingScore;

  useEffect(() => {
    if (quizFinished) {
      onComplete(scorePercent, passed);
    }
  }, [quizFinished]);

  // Tela de Resultado Final
  if (quizFinished) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div
          className={`rounded-2xl p-8 text-center ${
            passed
              ? "bg-gradient-to-br from-green-900 to-emerald-800"
              : "bg-gradient-to-br from-gray-900 to-gray-800"
          }`}
        >
          {passed ? (
            <>
              <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">
                Parabéns! 🎉
              </h2>
              <p className="text-green-300 text-lg mb-6">
                Você passou no quiz de validação!
              </p>
            </>
          ) : (
            <>
              <RotateCcw className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">
                Quase lá!
              </h2>
              <p className="text-gray-300 text-lg mb-6">
                Revise o ebook e tente novamente.
              </p>
            </>
          )}

          {/* Score */}
          <div className="bg-black/30 rounded-xl p-6 mb-6">
            <div className="text-6xl font-bold text-white mb-1">
              {scorePercent}%
            </div>
            <div className="text-gray-300">
              {score} de {totalQuestions} questões corretas
            </div>
            <div className="mt-4 w-full bg-gray-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  passed ? "bg-green-400" : "bg-yellow-500"
                }`}
                style={{ width: `${scorePercent}%` }}
              />
            </div>
            <div className="text-sm text-gray-400 mt-2">
              Mínimo para aprovação: {QUIZ_CONFIG.passingScore}%
            </div>
          </div>

          {/* Rewards (se passou) */}
          {passed && (
            <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-xl p-4 mb-6">
              <p className="text-yellow-300 font-semibold mb-2">
                Você ganhou:
              </p>
              <div className="flex justify-center gap-4 text-sm">
                <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full">
                  +{QUIZ_CONFIG.xpReward} XP
                </span>
                <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">
                  Badge: Validador ✅
                </span>
                <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">
                  Certificado 🎓
                </span>
              </div>
            </div>
          )}

          {/* Erros detalhados */}
          <div className="text-left mb-6">
            <p className="text-gray-400 text-sm font-semibold mb-3">
              REVISÃO ({answers.filter((a) => !a.isCorrect).length} erros):
            </p>
            {answers
              .filter((a) => !a.isCorrect)
              .map((ans) => {
                const q = QUIZ_LLM_LOCAL.find((q) => q.id === ans.questionId)!;
                return (
                  <div
                    key={ans.questionId}
                    className="bg-red-900/20 border border-red-500/20 rounded-lg p-3 mb-2"
                  >
                    <p className="text-white text-sm font-medium mb-1">
                      Q{ans.questionId}: {q.question.substring(0, 80)}...
                    </p>
                    <p className="text-red-300 text-xs">
                      Sua resposta:{" "}
                      {q.options.find((o) => o.id === ans.selected)?.text}
                    </p>
                    <p className="text-green-300 text-xs">
                      Correta:{" "}
                      {
                        q.options.find((o) => o.id === q.correctAnswer)?.text
                      }
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      💡 {q.explanation}
                    </p>
                  </div>
                );
              })}
          </div>

          {/* Botões */}
          {passed ? (
            <button
              onClick={() => window.location.href = `/dashboard/${token}`}
              className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-3 rounded-xl transition"
            >
              Ver Meu Certificado →
            </button>
          ) : (
            <button
              onClick={() => {
                setCurrentQ(0);
                setAnswers([]);
                setSelected(null);
                setAnswerState("unanswered");
                setShowResult(false);
                setQuizFinished(false);
              }}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition"
            >
              Tentar Novamente
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">
              {QUIZ_CONFIG.title}
            </p>
            <p className="text-sm text-gray-300">
              Questão {currentQ + 1} de {totalQuestions}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-400">
              {question.topic}
            </span>
            <br />
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                question.difficulty === "easy"
                  ? "bg-green-900 text-green-300"
                  : question.difficulty === "medium"
                  ? "bg-yellow-900 text-yellow-300"
                  : "bg-red-900 text-red-300"
              }`}
            >
              {question.difficulty === "easy"
                ? "Fácil"
                : question.difficulty === "medium"
                ? "Médio"
                : "Difícil"}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Score em tempo real */}
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>
            ✅ {answers.filter((a) => a.isCorrect).length} corretas
          </span>
          <span>
            ❌ {answers.filter((a) => !a.isCorrect).length} erros
          </span>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 mb-4">
        <h2 className="text-white text-lg font-semibold leading-relaxed mb-6">
          {question.question}
        </h2>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option) => {
            let optionStyle =
              "border-gray-700 bg-gray-800 hover:border-blue-500 hover:bg-gray-700 cursor-pointer";

            if (showResult) {
              if (option.id === question.correctAnswer) {
                optionStyle = "border-green-500 bg-green-900/30 cursor-default";
              } else if (option.id === selected && !answerState) {
                optionStyle = "border-gray-700 bg-gray-800 cursor-default";
              } else if (option.id === selected) {
                optionStyle = "border-red-500 bg-red-900/30 cursor-default";
              } else {
                optionStyle = "border-gray-800 bg-gray-800/50 opacity-50 cursor-default";
              }
            } else if (selected === option.id) {
              optionStyle = "border-blue-500 bg-blue-900/30 cursor-pointer";
            }

            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                disabled={showResult}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${optionStyle}`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                      showResult && option.id === question.correctAnswer
                        ? "bg-green-500 text-white"
                        : showResult && option.id === selected && option.id !== question.correctAnswer
                        ? "bg-red-500 text-white"
                        : selected === option.id
                        ? "bg-blue-500 text-white"
                        : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {option.id}
                  </span>
                  <span className="text-gray-200 text-sm leading-relaxed">
                    {option.text}
                  </span>
                  {showResult && option.id === question.correctAnswer && (
                    <CheckCircle className="flex-shrink-0 w-5 h-5 text-green-400 ml-auto" />
                  )}
                  {showResult &&
                    option.id === selected &&
                    option.id !== question.correctAnswer && (
                      <XCircle className="flex-shrink-0 w-5 h-5 text-red-400 ml-auto" />
                    )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dica (sempre visível) */}
      <div className="bg-gray-800/50 border border-yellow-500/20 rounded-xl p-4 mb-4">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-yellow-200/80 text-sm">{question.hint}</p>
        </div>
      </div>

      {/* Explicação (após responder) */}
      {showResult && (
        <div
          className={`rounded-xl p-4 mb-4 ${
            answerState === "correct"
              ? "bg-green-900/30 border border-green-500/30"
              : "bg-red-900/30 border border-red-500/30"
          }`}
        >
          <p
            className={`font-semibold text-sm mb-1 ${
              answerState === "correct" ? "text-green-300" : "text-red-300"
            }`}
          >
            {answerState === "correct" ? "✅ Correto!" : "❌ Incorreto"}
          </p>
          <p className="text-gray-300 text-sm">{question.explanation}</p>
        </div>
      )}

      {/* Botões */}
      <div className="flex gap-3">
        {!showResult ? (
          <button
            onClick={handleConfirm}
            disabled={!selected}
            className={`flex-1 py-3 rounded-xl font-bold transition ${
              selected
                ? "bg-blue-600 hover:bg-blue-500 text-white"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
            }`}
          >
            Confirmar Resposta
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2"
          >
            {currentQ < totalQuestions - 1 ? (
              <>
                Próxima <ChevronRight className="w-4 h-4" />
              </>
            ) : (
              "Ver Resultado Final 🏆"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
