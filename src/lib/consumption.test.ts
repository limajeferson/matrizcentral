import { describe, it, expect } from "vitest";
import { cycleKeyFor, canConsume } from "./consumption";

const start = new Date("2026-01-05T00:00:00.000Z");

describe("cycleKeyFor", () => {
  it("mesmo ciclo antes do aniversário", () => {
    expect(cycleKeyFor(start, new Date("2026-01-20T00:00:00.000Z"))).toBe(cycleKeyFor(start, new Date("2026-02-04T00:00:00.000Z")));
  });
  it("novo ciclo ao cruzar o dia do aniversário", () => {
    expect(cycleKeyFor(start, new Date("2026-01-06T00:00:00.000Z"))).not.toBe(cycleKeyFor(start, new Date("2026-02-06T00:00:00.000Z")));
  });
});

const base = { unlockedContentIds: [], unlockedCycleKeys: [], contentId: "x", startsAt: start, now: new Date("2026-01-10T00:00:00.000Z") };

describe("canConsume", () => {
  it("start-included libera em qualquer nível", () => {
    expect(canConsume({ ...base, access: "view", startIncluded: true }).allowed).toBe(true);
  });
  it("view sem start-included → gated", () => {
    const r = canConsume({ ...base, access: "view", startIncluded: false });
    expect(r.allowed).toBe(false); expect(r.reason).toBe("gated");
  });
  it("advanced libera sempre", () => {
    const r = canConsume({ ...base, access: "advanced", startIncluded: false });
    expect(r.allowed).toBe(true); expect(r.reason).toBe("advanced");
  });
  it("regular: já desbloqueado libera", () => {
    const r = canConsume({ ...base, access: "regular", startIncluded: false, unlockedContentIds: ["x"] });
    expect(r.allowed).toBe(true); expect(r.reason).toBe("already-unlocked");
  });
  it("regular: slot livre no ciclo → libera e vai desbloquear", () => {
    const r = canConsume({ ...base, access: "regular", startIncluded: false });
    expect(r.allowed).toBe(true); expect(r.reason).toBe("cycle-slot"); expect(r.willUnlock).toBe(true);
  });
  it("regular: já usou o slot deste ciclo → cycle-used", () => {
    const ck = cycleKeyFor(start, base.now);
    const r = canConsume({ ...base, access: "regular", startIncluded: false, unlockedCycleKeys: [ck] });
    expect(r.allowed).toBe(false); expect(r.reason).toBe("cycle-used");
  });
});
