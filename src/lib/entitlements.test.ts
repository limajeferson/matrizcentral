import { describe, it, expect } from "vitest";
import { resolveAccess } from "./entitlements";

const future = "2027-01-01T00:00:00.000Z";
const past = "2025-01-01T00:00:00.000Z";
const now = new Date("2026-06-01T00:00:00.000Z");

describe("resolveAccess", () => {
  it("sem entitlements → view", () => {
    expect(resolveAccess([], now)).toBe("view");
  });
  it("só expirados → view", () => {
    expect(resolveAccess([{ plan: "advanced", expires_at: past }], now)).toBe("view");
  });
  it("regular vigente → regular", () => {
    expect(resolveAccess([{ plan: "regular", expires_at: future }], now)).toBe("regular");
  });
  it("advanced vence regular", () => {
    expect(resolveAccess([{ plan: "regular", expires_at: future }, { plan: "advanced", expires_at: future }], now)).toBe("advanced");
  });
  it("advanced expirado + regular vigente → regular", () => {
    expect(resolveAccess([{ plan: "advanced", expires_at: past }, { plan: "regular", expires_at: future }], now)).toBe("regular");
  });
});
