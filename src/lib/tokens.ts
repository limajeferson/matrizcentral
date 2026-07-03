import { customAlphabet } from "nanoid";

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DAY_MS = 24 * 60 * 60 * 1000;

const generateRawToken = customAlphabet(ALPHABET, 10);

export function generateToken(): string {
  return generateRawToken();
}

export function tokenAccessExpiry(from: Date = new Date()): Date {
  return new Date(from.getTime() + 365 * DAY_MS);
}

export function refundWindowExpiry(from: Date = new Date()): Date {
  return new Date(from.getTime() + 30 * DAY_MS);
}

export function isTokenExpired(validUntil: string | Date): boolean {
  const expiry = typeof validUntil === "string" ? new Date(validUntil) : validUntil;
  return expiry.getTime() < Date.now();
}
