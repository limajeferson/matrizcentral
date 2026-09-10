export type MdHeading = { level: 1 | 2 | 3 | 4; text: string; id: string };
export type MdBlock =
  | ({ kind: "heading" } & MdHeading)
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[]; ordered?: boolean }
  | { kind: "table"; header: string[]; rows: string[][] };

/** Trecho de texto inline: `bold` marca `**negrito**`. Usado por quem
 *  renderiza `MdBlock.text`/`items`/`rows` (ver `parseInline`). */
export type MdInlineSegment = { text: string; bold?: boolean };

/** Parseia `**negrito**` dentro de um texto já desescapado. Único inline
 *  suportado de propósito — o resto do conteúdo publicado não usa itálico,
 *  links ou código inline, e cada um a mais é mais superfície pra divergir
 *  do que o parser realmente entende. */
export function parseInline(text: string): MdInlineSegment[] {
  const segments: MdInlineSegment[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) {
    if (match.index > last) segments.push({ text: text.slice(last, match.index) });
    segments.push({ text: match[1], bold: true });
    last = match.index + match[0].length;
  }
  if (last < text.length) segments.push({ text: text.slice(last) });
  return segments.length > 0 ? segments : [{ text }];
}

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove diacríticos combinantes
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Desescapa `\.` e `\\` (usados nos relatórios publicados). */
function unescapeMd(text: string): string {
  return text.replace(/\\([.\\])/g, "$1");
}

function splitRow(line: string): string[] {
  return line.replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
}

const SEPARATOR_ROW = /^[\s|:-]+$/;

export function parseMarkdown(source: string): MdBlock[] {
  const blocks: MdBlock[] = [];
  const slugCount = new Map<string, number>();
  let list: string[] | null = null;
  let listOrdered = false;
  let table: { header: string[]; rows: string[][] } | null = null;

  const flush = () => {
    if (list) blocks.push({ kind: "list", items: list, ...(listOrdered ? { ordered: true } : {}) });
    if (table) blocks.push({ kind: "table", ...table });
    list = null;
    listOrdered = false;
    table = null;
  };

  for (const raw of source.split("\n")) {
    const line = raw.trimEnd();
    const heading = line.match(/^(#{1,4}) (.+)$/);
    if (heading) {
      flush();
      const text = unescapeMd(heading[2].trim());
      const base = slugify(text);
      const n = (slugCount.get(base) ?? 0) + 1;
      slugCount.set(base, n);
      blocks.push({
        kind: "heading",
        level: heading[1].length as 1 | 2 | 3 | 4,
        text,
        id: n === 1 ? base : `${base}-${n}`,
      });
      continue;
    }
    if (line.startsWith("- ")) {
      if (table || listOrdered) flush();
      (list ??= []).push(unescapeMd(line.slice(2)));
      continue;
    }
    const ordered = line.match(/^\d+\.\s+(.+)$/);
    if (ordered) {
      if (table || (list && !listOrdered)) flush();
      listOrdered = true;
      (list ??= []).push(unescapeMd(ordered[1]));
      continue;
    }
    if (line.startsWith("|")) {
      if (list) flush();
      if (SEPARATOR_ROW.test(line)) continue;
      const cells = splitRow(line).map(unescapeMd);
      if (!table) table = { header: cells, rows: [] };
      else table.rows.push(cells);
      continue;
    }
    flush();
    if (line.trim() !== "") blocks.push({ kind: "paragraph", text: unescapeMd(line) });
  }
  flush();
  return blocks;
}

export function extractHeadings(blocks: MdBlock[], maxLevel = 4): MdHeading[] {
  return blocks.flatMap((b) =>
    b.kind === "heading" && b.level <= maxLevel
      ? [{ level: b.level, text: b.text, id: b.id }]
      : [],
  );
}
