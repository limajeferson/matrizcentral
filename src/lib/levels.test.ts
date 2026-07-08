import { describe, expect, it } from "vitest";
import { getLevelProgress } from "@/lib/levels";

describe("getLevelProgress", () => {
  it("nível 1 com 0 XP", () => {
    const progress = getLevelProgress(0);
    expect(progress.level).toBe(1);
    expect(progress.name).toBe("Aprendiz");
    expect(progress.xpToNext).toBe(500);
    expect(progress.progressPercent).toBe(0);
  });

  it("nível 2 ao atingir exatamente 500 XP", () => {
    const progress = getLevelProgress(500);
    expect(progress.level).toBe(2);
    expect(progress.name).toBe("Iniciado");
    expect(progress.xpIntoLevel).toBe(0);
  });

  it("progresso parcial dentro do nível", () => {
    const progress = getLevelProgress(750);
    expect(progress.level).toBe(2);
    expect(progress.xpIntoLevel).toBe(250);
    expect(progress.xpToNext).toBe(250);
    expect(progress.progressPercent).toBe(50);
  });

  it("nível máximo não tem próximo nível", () => {
    const progress = getLevelProgress(10000);
    expect(progress.level).toBe(5);
    expect(progress.name).toBe("Mestre");
    expect(progress.xpToNext).toBeNull();
    expect(progress.nextLevelName).toBeNull();
    expect(progress.progressPercent).toBe(100);
  });
});
