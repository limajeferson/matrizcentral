import { describe, expect, it } from "vitest";
import { resolveScramble, totalScrambleFrames } from "@/lib/scramble";

const HASH = () => "#";

describe("resolveScramble", () => {
  it("no frame 0 tudo (exceto espaço e barra) está em ciclo", () => {
    const out = resolveScramble("AB/C", 0, 3, HASH);
    expect(out.map((c) => c.char)).toEqual(["#", "#", "/", "#"]);
    expect(out.map((c) => c.settled)).toEqual([false, false, true, false]);
  });

  it("resolve da esquerda para a direita conforme os frames avançam", () => {
    // framesPerChar=3 => após 3 frames o 1º char assenta
    const out = resolveScramble("AB", 3, 3, HASH);
    expect(out[0]).toEqual({ char: "A", settled: true });
    expect(out[1]).toEqual({ char: "#", settled: false });
  });

  it("espaço e barra ficam sempre assentados no valor final", () => {
    const out = resolveScramble("A B/C", 0, 3, HASH);
    expect(out[1]).toEqual({ char: " ", settled: true });
    expect(out[3]).toEqual({ char: "/", settled: true });
  });

  it("com frames suficientes tudo assenta no alvo", () => {
    const out = resolveScramble("Matriz", 999, 3, HASH);
    expect(out.map((c) => c.char).join("")).toBe("Matriz");
    expect(out.every((c) => c.settled)).toBe(true);
  });
});

describe("totalScrambleFrames", () => {
  it("é comprimento * framesPerChar", () => {
    expect(totalScrambleFrames("Matriz/Central", 3)).toBe(14 * 3);
  });
});
