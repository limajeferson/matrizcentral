/**
 * Relógio de progresso das histórias (lógica pura, testável).
 *
 * O viewer avança o slide sozinho depois de `STORY_DURATION_MS`, contando o
 * tempo por `requestAnimationFrame`. O navegador **congela** o rAF quando a aba
 * vai para segundo plano; ao voltar, o primeiro frame chega com um timestamp
 * muito à frente do último e o intervalo inteiro seria creditado de uma vez —
 * era isso que fazia o slide pular ao voltar de aba.
 *
 * A defesa é dupla:
 * 1. o viewer congela o relógio no `visibilitychange` (aba oculta = mesmo
 *    estado de "pausado" do toque), e ao voltar o relógio retoma de onde parou;
 * 2. mesmo assim, cada frame tem o delta limitado a `MAX_FRAME_MS` — se algum
 *    congelamento escapar do evento (throttling agressivo, sleep da máquina),
 *    o pior caso é um frame contar 250 ms, não 3 minutos.
 */

/** Teto do que um único frame pode creditar ao relógio (ms). */
export const MAX_FRAME_MS = 250;

export type StoryClock = {
  /** Tempo efetivamente decorrido no slide (ms), já descontadas as pausas. */
  elapsed: number;
  /** Timestamp do último frame contado; `null` quando o relógio está parado. */
  last: number | null;
};

/** Relógio zerado, no início de um slide. */
export function createStoryClock(): StoryClock {
  return { elapsed: 0, last: null };
}

/**
 * Avança o relógio para o frame de timestamp `ts`.
 *
 * `frozen` cobre os dois motivos de parada — o usuário segurando o dedo na tela
 * e a aba em segundo plano. Enquanto congelado, o relógio não anda e "esquece"
 * o último timestamp, de forma que o primeiro frame depois de retomar apenas
 * re-ancora o relógio (delta zero) em vez de creditar o buraco.
 */
export function advanceStoryClock(clock: StoryClock, ts: number, frozen: boolean): StoryClock {
  if (frozen) return { elapsed: clock.elapsed, last: null };
  if (clock.last === null) return { elapsed: clock.elapsed, last: ts };
  const raw = ts - clock.last;
  const delta = raw <= 0 ? 0 : Math.min(raw, MAX_FRAME_MS);
  return { elapsed: clock.elapsed + delta, last: ts };
}

/** Fração 0..1 do slide já percorrida. */
export function storyProgress(elapsed: number, durationMs: number): number {
  if (!(durationMs > 0)) return 1;
  if (elapsed <= 0) return 0;
  return Math.min(elapsed / durationMs, 1);
}
