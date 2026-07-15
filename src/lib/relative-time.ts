export function relativeTime(fromIso: string, now: Date): string {
  const t = new Date(fromIso).getTime();
  if (Number.isNaN(t)) return "";
  const s = Math.floor((now.getTime() - t) / 1000);
  if (s < 60) return "agora";
  const min = Math.floor(s / 60);
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  if (d <= 7) return `há ${d} d`;
  return new Date(fromIso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}
