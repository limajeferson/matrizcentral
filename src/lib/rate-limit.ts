/**
 * Rate limiter em memória (custo zero). ATENÇÃO: o estado é por instância de
 * servidor — em serverless não é compartilhado entre instâncias; é mitigação de
 * abuso, não garantia distribuída. Suficiente para o MVP.
 */
export function createRateLimiter(windowMs: number): {
  check: (key: string, now: number) => boolean;
} {
  const last = new Map<string, number>();
  return {
    check(key, now) {
      const prev = last.get(key) ?? -Infinity;
      if (now - prev < windowMs) return false;
      last.set(key, now);
      return true;
    },
  };
}
