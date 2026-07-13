import { describe, it, expect } from "vitest";
import { computeDueEmails } from "./email-cycle";

const mkEnt = (o: Partial<{ user_id: string; plan: "regular" | "advanced"; starts_at: string; expires_at: string }>) => ({
  user_id: "u1", plan: "regular" as const, starts_at: "2026-01-05T00:00:00.000Z", expires_at: "2027-01-05T00:00:00.000Z", ...o,
});

describe("computeDueEmails", () => {
  it("ignora entitlements expirados", () => {
    const now = new Date("2026-06-05T12:00:00.000Z");
    const ents = [mkEnt({ expires_at: "2026-01-01T00:00:00.000Z" })];
    expect(computeDueEmails(ents, [], now)).toEqual([]);
  });

  it("Regular: novo ciclo no dia do aniversário mensal", () => {
    const now = new Date("2026-02-05T12:00:00.000Z"); // cruza o dia 5 (cycle-0 -> cycle-1)
    const due = computeDueEmails([mkEnt({})], [], now);
    expect(due).toContainEqual({ user_id: "u1", email_type: "novo_ciclo", reference: "cycle-1" });
  });

  it("Regular: não redispara o novo ciclo já enviado", () => {
    const now = new Date("2026-02-05T12:00:00.000Z");
    const sent = [{ user_id: "u1", email_type: "novo_ciclo", reference: "cycle-1" }];
    const due = computeDueEmails([mkEnt({})], sent, now);
    expect(due.find((d) => d.email_type === "novo_ciclo")).toBeUndefined();
  });

  it("Regular: fora do dia de aniversário, sem novo ciclo", () => {
    const now = new Date("2026-02-10T12:00:00.000Z");
    const due = computeDueEmails([mkEnt({})], [], now);
    expect(due.find((d) => d.email_type === "novo_ciclo")).toBeUndefined();
  });

  it("expiração: dispara 7 dias antes (uma vez)", () => {
    const now = new Date("2026-12-29T12:00:00.000Z"); // expira 2027-01-05 -> ~7 dias
    const due = computeDueEmails([mkEnt({})], [], now);
    expect(due).toContainEqual({ user_id: "u1", email_type: "expiracao", reference: "expiry-7d" });
  });

  it("expiração: não redispara expiry-7d já enviado", () => {
    const now = new Date("2026-12-30T12:00:00.000Z");
    const sent = [{ user_id: "u1", email_type: "expiracao", reference: "expiry-7d" }];
    const due = computeDueEmails([mkEnt({})], sent, now);
    expect(due.find((d) => d.reference === "expiry-7d")).toBeUndefined();
  });
});
