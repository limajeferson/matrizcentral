/**
 * Brilho (alpha) de um quadradinho no instante `time`, oscilando lentamente
 * entre 0 e `amp`. `speed` controla a velocidade e `phase` o deslocamento
 * inicial (para os quadrados não piscarem em sincronia).
 */
export function twinkleAlpha(amp: number, speed: number, phase: number, time: number): number {
  const v = amp * (0.5 + 0.5 * Math.sin(time * speed + phase));
  return v < 0 ? 0 : v;
}
