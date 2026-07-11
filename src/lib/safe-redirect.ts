/**
 * Valida o parâmetro `next` (destino pós-login) contra open redirect.
 * Só aceita caminhos internos absolutos ("/algo"); rejeita URLs externas e
 * protocol-relative ("//host", "/\\host").
 */
export function safeNextPath(
  raw: string | null | undefined,
  fallback = "/conta"
): string {
  if (!raw) return fallback;
  if (!raw.startsWith("/")) return fallback;
  if (raw.startsWith("//")) return fallback;
  if (raw.startsWith("/\\")) return fallback;
  return raw;
}
