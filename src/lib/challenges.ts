import { CHALLENGES, type ChallengeDefinition } from "@/data/challenges";

export function getIsoWeekKey(date: Date): string {
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNumber = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNumber + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const weekNumber =
    1 +
    Math.round(
      ((target.getTime() - firstThursday.getTime()) / 86400000 -
        3 +
        ((firstThursday.getUTCDay() + 6) % 7)) /
        7
    );
  return `${target.getUTCFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

export function getCurrentChallenge(date: Date): ChallengeDefinition {
  const weekKey = getIsoWeekKey(date);
  const weekNumber = parseInt(weekKey.split("-W")[1], 10);
  return CHALLENGES[weekNumber % CHALLENGES.length];
}
