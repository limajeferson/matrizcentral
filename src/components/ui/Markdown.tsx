import { parseMarkdown, parseInline, type MdBlock } from "@/lib/markdown";

/** Renderiza texto com `**negrito**` como spans reais — todo texto de bloco
 *  (parágrafo, item de lista, célula de tabela) passa por aqui. */
function Inline({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((seg, i) =>
        seg.bold ? <strong key={i}>{seg.text}</strong> : <span key={i}>{seg.text}</span>
      )}
    </>
  );
}

/**
 * Aceita `source` (markdown bruto, re-parseado aqui — uso histórico do blog e
 * do dashboard) OU `blocks` já cortados (uso do leitor protegido, que nunca
 * deve ter o markdown completo das outras seções disponível para re-parse no
 * cliente — só os blocos da seção corrente chegam até aqui).
 *
 * `surface` controla a paleta de texto:
 * - "themed" (padrão): usa os tokens `--foreground` do tema (dark por padrão
 *   no site). Certo para conteúdo que fica direto sobre o fundo da página
 *   (leitor protegido, corpo do blog).
 * - "light": texto fixo `zinc-900`/`zinc-700`, independente do tema. Use
 *   quando o Markdown é renderizado dentro de uma superfície clara fixa
 *   (ex.: um card com `bg-white` forçado via `force-light`, não o
 *   `<GlassCard>` padrão — que hoje é `bg-card/70` e já acompanha o tema) —
 *   texto dark-aware ficaria quase branco sobre um card branco.
 */
export type MarkdownProps = ({ source: string } | { blocks: MdBlock[] }) & {
  surface?: "themed" | "light";
};

export default function Markdown(props: MarkdownProps) {
  const blocks = "source" in props ? parseMarkdown(props.source) : props.blocks;
  const surface = props.surface ?? "themed";
  const heading = surface === "light" ? "text-zinc-900" : "text-foreground";
  const body = surface === "light" ? "text-zinc-700" : "text-foreground/90";
  return (
    <div>
      {blocks.map((block, index) => {
        if (block.kind === "heading") {
          if (block.level === 1)
            return (
              <h1 key={index} id={block.id} className={`mt-6 scroll-mt-24 text-2xl font-bold ${heading}`}>
                {block.text}
              </h1>
            );
          if (block.level === 2)
            return (
              <h2 key={index} id={block.id} className={`mt-5 scroll-mt-24 text-xl font-bold ${heading}`}>
                {block.text}
              </h2>
            );
          if (block.level === 3)
            return (
              <h3 key={index} id={block.id} className={`mt-4 scroll-mt-24 text-lg font-semibold ${heading}`}>
                {block.text}
              </h3>
            );
          return (
            <h4 key={index} id={block.id} className={`mt-4 scroll-mt-24 text-base font-semibold ${heading}`}>
              {block.text}
            </h4>
          );
        }
        if (block.kind === "list") {
          const ListTag = block.ordered ? "ol" : "ul";
          return (
            <ListTag
              key={index}
              className={`${block.ordered ? "list-decimal" : "list-disc"} pl-5 space-y-1`}
            >
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex} className={body}>
                  <Inline text={item} />
                </li>
              ))}
            </ListTag>
          );
        }
        if (block.kind === "table")
          return (
            <div key={index} className="overflow-x-auto">
              <table className="mt-4 w-full border-collapse border border-border text-sm">
                <thead>
                  <tr className="bg-card font-semibold">
                    {block.header.map((cell, cellIndex) => (
                      <th key={cellIndex} className="px-3 py-2 border border-border text-left">
                        <Inline text={cell} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="px-3 py-2 border border-border">
                          <Inline text={cell} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        return (
          <p key={index} className={`mt-2 ${body}`}>
            <Inline text={block.text} />
          </p>
        );
      })}
    </div>
  );
}
