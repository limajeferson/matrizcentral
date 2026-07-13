export const UPGRADE_COUPON_CENTS = 4700;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/** Elegível ao cupom de upgrade: comprou Start há < 30 dias e ainda não tem passe. */
export function couponEligible(
  ebookPurchaseAt: string | null,
  hasEntitlement: boolean,
  now: Date = new Date()
): boolean {
  if (!ebookPurchaseAt || hasEntitlement) return false;
  return now.getTime() - new Date(ebookPurchaseAt).getTime() < THIRTY_DAYS_MS;
}
