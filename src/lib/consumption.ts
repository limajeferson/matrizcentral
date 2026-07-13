import type { AccessLevel } from "./entitlements";

/** Ciclo mensal por aniversário da compra: nº de meses completos desde startsAt. */
export function cycleKeyFor(startsAt: Date, now: Date): string {
  let months =
    (now.getUTCFullYear() - startsAt.getUTCFullYear()) * 12 +
    (now.getUTCMonth() - startsAt.getUTCMonth());
  if (now.getUTCDate() < startsAt.getUTCDate()) months -= 1;
  if (months < 0) months = 0;
  return `cycle-${months}`;
}

export type ConsumeReason =
  | "start-included" | "advanced" | "already-unlocked"
  | "cycle-slot" | "cycle-used" | "gated";

export function canConsume(args: {
  access: AccessLevel;
  startIncluded: boolean;
  unlockedContentIds: string[];
  unlockedCycleKeys: string[];
  contentId: string;
  startsAt: Date | null;
  now: Date;
}): { allowed: boolean; reason: ConsumeReason; willUnlock: boolean } {
  const { access, startIncluded, unlockedContentIds, unlockedCycleKeys, contentId, startsAt, now } = args;
  if (startIncluded) return { allowed: true, reason: "start-included", willUnlock: false };
  if (access === "advanced") return { allowed: true, reason: "advanced", willUnlock: false };
  if (access === "regular") {
    if (unlockedContentIds.includes(contentId)) return { allowed: true, reason: "already-unlocked", willUnlock: false };
    const ck = startsAt ? cycleKeyFor(startsAt, now) : "cycle-0";
    if (!unlockedCycleKeys.includes(ck)) return { allowed: true, reason: "cycle-slot", willUnlock: true };
    return { allowed: false, reason: "cycle-used", willUnlock: false };
  }
  return { allowed: false, reason: "gated", willUnlock: false };
}
