import { randomBytes, createHash } from "crypto";

const MAGIC_LINK_TTL_MS = 15 * 60 * 1000; // 15 minutos
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias
export const REQUEST_LINK_THROTTLE_MS = 60 * 1000; // 1 pedido/min por usuário

/** Segredo aleatório de 256 bits (base64url, URL-safe). Cartão e carteirinha. */
export function generateAuthSecret(): string {
  return randomBytes(32).toString("base64url");
}

/** SHA-256 hex do segredo. Guardamos SEMPRE o hash, nunca o segredo cru. */
export function hashAuthSecret(secret: string): string {
  return createHash("sha256").update(secret).digest("hex");
}

export function magicLinkExpiry(from: Date = new Date()): Date {
  return new Date(from.getTime() + MAGIC_LINK_TTL_MS);
}

export function sessionExpiry(from: Date = new Date()): Date {
  return new Date(from.getTime() + SESSION_TTL_MS);
}

export function isExpired(at: string | Date, now: Date = new Date()): boolean {
  const t = typeof at === "string" ? new Date(at) : at;
  return t.getTime() < now.getTime();
}
