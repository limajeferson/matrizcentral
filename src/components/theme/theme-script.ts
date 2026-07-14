/**
 * Script anti-flash: roda antes da pintura para aplicar a classe `.dark`
 * no <html> com base na preferência salva (ou "dark" por padrão).
 * Injetado inline (não como módulo) no topo do <body> em `src/app/layout.tsx`.
 */
export const THEME_INIT_SCRIPT = `(function () {
  try {
    var stored = localStorage.getItem("mc-theme");
    var theme = stored === "light" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", theme === "dark");
  } catch (e) {
    document.documentElement.classList.add("dark");
  }
})();`;
