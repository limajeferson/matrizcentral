import type { AccessLevel } from "@/lib/entitlements";

export function isSubscriber(access: AccessLevel): boolean {
  return access === "regular" || access === "advanced";
}

export type ValidationResult = { ok: true } | { ok: false; error: string };

export function validateTopicInput(input: { title?: unknown; body?: unknown }): ValidationResult {
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const body = typeof input.body === "string" ? input.body.trim() : "";
  if (title.length < 3) return { ok: false, error: "O título precisa ter ao menos 3 caracteres." };
  if (title.length > 120) return { ok: false, error: "O título pode ter no máximo 120 caracteres." };
  if (body.length < 1) return { ok: false, error: "Escreva o conteúdo do tópico." };
  if (body.length > 5000) return { ok: false, error: "O conteúdo pode ter no máximo 5000 caracteres." };
  return { ok: true };
}

export function validateReplyInput(input: { body?: unknown; parentReplyId?: unknown }): ValidationResult {
  const body = typeof input.body === "string" ? input.body.trim() : "";
  if (body.length < 1) return { ok: false, error: "Escreva sua resposta." };
  if (body.length > 5000) return { ok: false, error: "A resposta pode ter no máximo 5000 caracteres." };
  if (input.parentReplyId !== undefined && input.parentReplyId !== null) {
    const parentReplyId = typeof input.parentReplyId === "string" ? input.parentReplyId.trim() : "";
    if (parentReplyId.length < 1) return { ok: false, error: "Resposta de origem inválida." };
  }
  return { ok: true };
}
