import { describe, it, expect } from "vitest";
import { relativeTime } from "./relative-time";
const now = new Date("2026-07-15T12:00:00Z");
describe("relativeTime", () => {
  it("agora / minutos / horas / dias", () => {
    expect(relativeTime("2026-07-15T11:59:30Z", now)).toBe("agora");
    expect(relativeTime("2026-07-15T11:45:00Z", now)).toBe("há 15 min");
    expect(relativeTime("2026-07-15T09:00:00Z", now)).toBe("há 3 h");
    expect(relativeTime("2026-07-12T12:00:00Z", now)).toBe("há 3 d");
  });
  it("acima de 7 dias vira data curta", () => {
    expect(relativeTime("2026-06-01T12:00:00Z", now)).toMatch(/\d/);
  });
});
