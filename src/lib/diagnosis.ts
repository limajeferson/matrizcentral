import type { TriagemAnswer } from "@/lib/quiz-scoring";

/**
 * Valida e normaliza o payload de respostas do diagnóstico vindo do cliente.
 * Retorna null se o formato for inválido (o endpoint responde 400) — nunca
 * confia cegamente no corpo da requisição.
 */
export function parseTriagemAnswers(raw: unknown): TriagemAnswer[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const answers: TriagemAnswer[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null) return null;
    const q = (item as Record<string, unknown>).questionId;
    const sel = (item as Record<string, unknown>).selectedOptionIndexes;
    if (typeof q !== "number" || !Number.isInteger(q)) return null;
    if (!Array.isArray(sel)) return null;
    if (sel.some((i) => typeof i !== "number" || !Number.isInteger(i))) return null;
    answers.push({ questionId: q, selectedOptionIndexes: sel as number[] });
  }
  return answers;
}
