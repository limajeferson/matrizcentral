import { describe, it, expect } from "vitest";
import { monthStartIso, aggregateMonthlyXp, rankLeaderboard } from "./leaderboard";

describe("monthStartIso", () => {
  it("1º dia do mês corrente (UTC)", () => {
    expect(monthStartIso(new Date("2026-07-15T12:00:00Z"))).toBe("2026-07-01T00:00:00.000Z");
  });
});
describe("aggregateMonthlyXp", () => {
  const ms = "2026-07-01T00:00:00.000Z";
  it("soma xp por user só no mês", () => {
    const m = aggregateMonthlyXp([
      { user_id: "a", xp_amount: 10, created_at: "2026-07-10T00:00:00Z" },
      { user_id: "a", xp_amount: 5, created_at: "2026-07-12T00:00:00Z" },
      { user_id: "b", xp_amount: 20, created_at: "2026-07-11T00:00:00Z" },
      { user_id: "a", xp_amount: 99, created_at: "2026-06-30T00:00:00Z" }, // fora do mês
    ], ms);
    expect(m.get("a")).toBe(15);
    expect(m.get("b")).toBe(20);
  });
});
describe("rankLeaderboard", () => {
  it("ordena desc, atribui rank, corta no limite", () => {
    const r = rankLeaderboard([
      { userId: "a", name: "Ana", xp: 15 },
      { userId: "b", name: "Bia", xp: 20 },
      { userId: "c", name: "Cid", xp: 5 },
    ], 2);
    expect(r).toEqual([
      { rank: 1, name: "Bia", xp: 20 },
      { rank: 2, name: "Ana", xp: 15 },
    ]);
  });
});
