import { describe, it, expect } from "vitest";
import { createRateLimiter } from "./rate-limit";

describe("createRateLimiter", () => {
  it("permite o 1º; bloqueia dentro da janela; libera depois", () => {
    const rl = createRateLimiter(1000);
    expect(rl.check("a@x.com", 0)).toBe(true);
    expect(rl.check("a@x.com", 500)).toBe(false);
    expect(rl.check("a@x.com", 1000)).toBe(true);
  });
  it("chaves independentes", () => {
    const rl = createRateLimiter(1000);
    expect(rl.check("a", 0)).toBe(true);
    expect(rl.check("b", 100)).toBe(true);
  });
});
