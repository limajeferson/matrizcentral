import { isValidEmail } from "@/lib/email-validation";

export type ValidationResult = { ok: true } | { ok: false; error: string };

export function validateContactInput(input: { email?: unknown; message?: unknown }): ValidationResult {
  const email = typeof input.email === "string" ? input.email.trim() : "";
  const message = typeof input.message === "string" ? input.message.trim() : "";
  if (!isValidEmail(email)) return { ok: false, error: "Informe um e-mail válido." };
  if (message.length < 5) return { ok: false, error: "Escreva sua mensagem (mín. 5 caracteres)." };
  if (message.length > 5000) return { ok: false, error: "A mensagem pode ter no máximo 5000 caracteres." };
  return { ok: true };
}
