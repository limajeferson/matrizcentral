// Mesmo regex já usado em OfferPricing.tsx, centralizado para reuso.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** True se `value` é um e-mail sintaticamente válido (sem espaços, com @ e TLD). */
export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim()) && value === value.trim();
}
