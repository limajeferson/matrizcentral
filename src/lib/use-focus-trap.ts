"use client";

import { useEffect, type RefObject } from "react";

/**
 * Helpers de foco por teclado para popovers/painéis da área logada.
 *
 * A lógica pura (cálculo do próximo índice numa lista circular) fica separada
 * dos hooks porque o Vitest deste repo roda em `environment: "node"` — só dá
 * para testar função pura, não hook que toca no DOM.
 */

/** Seletor dos elementos que podem receber foco dentro de um container. */
export const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * Próximo índice focável numa lista **circular**.
 *
 * - `current < 0` (nada focado ainda) entra pela ponta correspondente à direção:
 *   primeiro item indo para frente, último item indo para trás.
 * - Passar do fim volta ao começo, e vice-versa.
 * - Lista vazia devolve `-1`.
 */
export function nextFocusIndex(current: number, total: number, direction: 1 | -1): number {
  if (total <= 0) return -1;
  if (current < 0 || current >= total) return direction === 1 ? 0 : total - 1;
  return (current + direction + total) % total;
}

/** Elementos focáveis dentro do container, na ordem do DOM. */
export function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement,
  );
}

export type UseFocusTrapOptions = {
  /** Só age quando `true` (painel aberto). */
  active: boolean;
  /** Container do painel. */
  containerRef: RefObject<HTMLElement>;
  /** Chamado no `Escape` — deve fechar o painel. */
  onClose: () => void;
  /** Elemento que abriu o painel; recebe o foco de volta ao fechar. */
  returnFocusRef?: RefObject<HTMLElement>;
  /** Move o foco para o primeiro elemento focável ao abrir. Default: `true`. */
  autoFocus?: boolean;
  /** Setas ↑/↓ circulam entre os focáveis (padrão de `role="menu"`). Default: `false`. */
  arrowNavigation?: boolean;
  /** Tab/Shift+Tab ficam presos dentro do container (padrão modal). Default: `false`. */
  trapTab?: boolean;
};

/**
 * Instala o teclado de um painel aberto: `Escape` fecha e devolve o foco ao
 * gatilho; opcionalmente setas circulam entre os itens e o Tab fica preso.
 */
export function useFocusTrap({
  active,
  containerRef,
  onClose,
  returnFocusRef,
  autoFocus = true,
  arrowNavigation = false,
  trapTab = false,
}: UseFocusTrapOptions) {
  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const previouslyFocused = (document.activeElement as HTMLElement | null) ?? null;

    if (autoFocus) {
      const [first] = getFocusableElements(container);
      first?.focus();
    }

    function moveFocus(direction: 1 | -1) {
      const items = getFocusableElements(containerRef.current);
      if (items.length === 0) return;
      const current = items.indexOf(document.activeElement as HTMLElement);
      const target = items[nextFocusIndex(current, items.length, direction)];
      target?.focus();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        const back = returnFocusRef?.current ?? previouslyFocused;
        back?.focus();
        return;
      }
      if (arrowNavigation && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
        event.preventDefault();
        moveFocus(event.key === "ArrowDown" ? 1 : -1);
        return;
      }
      if (trapTab && event.key === "Tab") {
        const items = getFocusableElements(containerRef.current);
        if (items.length === 0) return;
        event.preventDefault();
        moveFocus(event.shiftKey ? -1 : 1);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, arrowNavigation, autoFocus, containerRef, onClose, returnFocusRef, trapTab]);
}

export default useFocusTrap;
