import { isPrivatePath } from "./seo";

export const FUNNEL_EVENTS = [
  "landing_view",
  "oferta_view",
  "checkout_start",
  "checkout_success",
  "newsletter_signup",
  "content_open",
] as const;

export type FunnelEvent = (typeof FUNNEL_EVENTS)[number];

export interface TrackPayload {
  event: FunnelEvent;
  path: string | null;
  referrer: string | null;
  meta: Record<string, string | number | boolean> | null;
}

const MAX_LEN = 300;
const MAX_META_KEYS = 10;
const MAX_META_VALUE_LEN = 200;
const META_KEY_RE = /^[a-z0-9_]{1,40}$/;

function isFunnelEvent(value: unknown): value is FunnelEvent {
  return typeof value === "string" && (FUNNEL_EVENTS as readonly string[]).includes(value);
}

/**
 * Canonicaliza um caminho só para efeito da checagem de "é privado?" — o
 * valor gravado no banco continua sendo o original (path sem query, ou
 * origin+pathname no caso do referrer). Cobre as formas não-canônicas que
 * uma checagem literal deixaria passar: barras duplicadas, segmentos "/./",
 * maiúsculas e percent-encoding (`%2F`, `%64` etc.).
 *
 * Falha fechada: `decodeURIComponent` de entrada malformada lança — nesse
 * caso tratamos como privado (null) em vez de deixar passar. Perder uma
 * métrica é barato; vazar um token não é.
 */
function canonicalizeForPrivacyCheck(rawPath: string): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(rawPath);
  } catch {
    return null;
  }
  return decoded
    .replace(/\/{2,}/g, "/")
    .replace(/\/\.\//g, "/")
    .toLowerCase();
}

function isPathPrivateOrMalformed(rawPath: string): boolean {
  const canonical = canonicalizeForPrivacyCheck(rawPath);
  if (canonical === null) return true;
  return isPrivatePath(canonical);
}

/**
 * Normaliza o caminho. Caminho privado vira null: a URL do dashboard CONTÉM o
 * token de acesso — gravá-la seria vazar credencial no banco de métricas.
 */
function normalizePath(value: unknown): string | null {
  if (typeof value !== "string" || !value.startsWith("/")) return null;
  const path = value.slice(0, MAX_LEN);
  const withoutQuery = path.split("?")[0];
  if (isPathPrivateOrMalformed(withoutQuery)) return null;
  return withoutQuery;
}

/**
 * Guarda só origem + caminho do referrer: query string carrega PII e tokens.
 * Quando o pathname é privado (ex.: navegação dura saindo de
 * `/dashboard/<token>/...`), guardamos só o `origin` — preserva o dado útil
 * "veio de dentro do site" sem carregar o token de acesso pro banco.
 */
function normalizeReferrer(value: unknown): string | null {
  if (typeof value !== "string" || !value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (isPathPrivateOrMalformed(url.pathname)) return url.origin.slice(0, MAX_LEN);
    return `${url.origin}${url.pathname}`.slice(0, MAX_LEN);
  } catch {
    return null;
  }
}

function normalizeMeta(value: unknown): Record<string, string | number | boolean> | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "object" || Array.isArray(value)) return null;
  const out: Record<string, string | number | boolean> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (Object.keys(out).length >= MAX_META_KEYS) break;
    if (!META_KEY_RE.test(key)) continue;
    if (typeof raw === "number" || typeof raw === "boolean") out[key] = raw;
    else if (typeof raw === "string") out[key] = raw.slice(0, MAX_META_VALUE_LEN);
  }
  return out;
}

export function validateTrackInput(
  input: unknown
): { ok: true; value: TrackPayload } | { ok: false; error: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, error: "payload inválido" };
  }
  const body = input as Record<string, unknown>;
  if (!isFunnelEvent(body.event)) return { ok: false, error: "evento desconhecido" };
  return {
    ok: true,
    value: {
      event: body.event,
      path: normalizePath(body.path),
      referrer: normalizeReferrer(body.referrer),
      meta: normalizeMeta(body.meta),
    },
  };
}
