export const SCRAMBLE_GLYPHS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ/abcdefghijklmnopqrstuvwxyz0123456789";

export interface ScrambleChar {
  char: string;
  /** true quando o caractere já assentou no valor final. */
  settled: boolean;
}

/**
 * Estado dos caracteres de `target` após `frame` frames de scramble.
 * Resolve da esquerda para a direita: cada `framesPerChar` frames assenta mais
 * um caractere. Espaços e "/" permanecem sempre no valor final. Os caracteres
 * ainda em ciclo recebem um glifo aleatório fornecido por `glyphAt(index)`.
 */
export function resolveScramble(
  target: string,
  frame: number,
  framesPerChar: number,
  glyphAt: (index: number) => string,
): ScrambleChar[] {
  const resolvedCount = Math.floor(frame / framesPerChar);
  return target.split("").map((char, index) => {
    if (char === " " || char === "/") return { char, settled: true };
    if (index < resolvedCount) return { char, settled: true };
    return { char: glyphAt(index), settled: false };
  });
}

/** Total de frames até todos os caracteres assentarem. */
export function totalScrambleFrames(target: string, framesPerChar: number): number {
  return target.length * framesPerChar;
}
