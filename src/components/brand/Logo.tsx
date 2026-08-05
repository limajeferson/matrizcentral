import type { CSSProperties, ReactNode } from "react";

/**
 * Marca da Matriz Central — fonte ÚNICA do cubo isométrico.
 *
 * Geometria e cores espelham `public/brand/logo-cubo.svg` (topo `#a78bfa`,
 * esquerda `#7c5cff` = `--mc-accent`, direita `#7c3aed`). Se o SVG do
 * `public/brand/` mudar, mudar AQUI também — e em nenhum outro lugar: nenhuma
 * superfície deve reescrever o `<polygon>`.
 *
 * O SVG é inline (não `<img src="/brand/logo-cubo.svg">`) para herdar o
 * tamanho por prop, não gerar request extra e funcionar igual nos dois temas —
 * as cores da marca são fixas, não dependem de token de tema.
 */

const VIEW_BOX = "-120 -120 240 240";

export type LogoMarkProps = {
  /** Lado do quadrado do SVG em px. Default 24. */
  size?: number;
  className?: string;
  /** Quando não há wordmark ao lado, o mark carrega o nome acessível. */
  label?: string;
  /** Força o mark a ser decorativo (o texto ao lado já anuncia a marca). */
  decorative?: boolean;
};

/** Só o cubo, sem wordmark. Use quando o espaço não comporta o nome. */
export function LogoMark({
  size = 24,
  className,
  label = "Matriz Central",
  decorative = false,
}: LogoMarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={VIEW_BOX}
      width={size}
      height={size}
      className={className}
      focusable="false"
      style={{ display: "block", flexShrink: 0 }}
      {...(decorative
        ? { "aria-hidden": true as const }
        : { role: "img", "aria-label": label })}
    >
      {!decorative && <title>{label}</title>}
      <polygon points="-103.92,-60 0,-120 103.92,-60 0,0" fill="#a78bfa" />
      <polygon points="-103.92,-60 0,0 0,120 -103.92,60" fill="#7c5cff" />
      <polygon points="0,0 103.92,-60 103.92,60 0,120" fill="#7c3aed" />
    </svg>
  );
}

export type LogoProps = LogoMarkProps & {
  /**
   * Wordmark. Cada superfície passa o SEU markup (a landing usa `ScrambleText`,
   * o header logado usa `Matriz <span class="text-violet-600">Central</span>`,
   * etc.) — assim o logo entra sem mudar a tipografia já ajustada de cada tema.
   * Sem `children`, renderiza só o cubo.
   */
  children?: ReactNode;
  /** Espaço entre cubo e wordmark, em px. Default 8. */
  gap?: number;
  /** Classe do wrapper — é aqui que vão `.mc-logo`, `.logo`, etc. */
  className?: string;
  /** Classe aplicada só no SVG. */
  markClassName?: string;
  style?: CSSProperties;
};

/**
 * Cubo + wordmark, alinhados. O wrapper usa `inline-flex` por estilo inline de
 * propósito: os escopos de CSS (`.mcv2`, `.lp-guide`, `.mc-checkout`, área
 * logada) são separados e nenhum deles deve ganhar regra nova por causa do logo.
 */
export default function Logo({
  size = 24,
  gap = 8,
  className,
  markClassName,
  style,
  label = "Matriz Central",
  children,
  decorative,
}: LogoProps) {
  const hasWordmark = children != null;
  return (
    <span
      className={className}
      style={{ display: "inline-flex", alignItems: "center", gap, ...style }}
    >
      <LogoMark
        size={size}
        className={markClassName}
        label={label}
        decorative={decorative ?? hasWordmark}
      />
      {children}
    </span>
  );
}
