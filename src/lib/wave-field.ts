/** Uma camada senoidal do fundo de ondas. */
export interface WaveLayer {
  /** Altura do pico em px. */
  amplitude: number;
  /** Comprimento de onda em px (distância entre picos). */
  wavelength: number;
  /** Fator de avanço da fase por unidade de tempo. */
  speed: number;
  /** Deslocamento de fase inicial em radianos. */
  phase: number;
  /** Linha base como fração da altura (0 = topo, 1 = base). */
  yOffset: number;
}

/**
 * Posição vertical (px) da camada `layer` na coluna `x`, no instante `time`.
 * A linha base fica em `yOffset * height`; o seno oscila ±`amplitude` ao redor dela.
 */
export function waveY(
  layer: WaveLayer,
  x: number,
  time: number,
  height: number,
): number {
  const k = (Math.PI * 2) / layer.wavelength;
  const offset = Math.sin(x * k + time * layer.speed + layer.phase) * layer.amplitude;
  return layer.yOffset * height + offset;
}
