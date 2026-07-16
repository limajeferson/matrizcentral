import { parseMarkdown } from "@/lib/markdown";

export default function Markdown({ source }: { source: string }) {
  const blocks = parseMarkdown(source);
  return (
    <div>
      {blocks.map((block, index) => {
        if (block.kind === "heading") {
          if (block.level === 1)
            return (
              <h1 key={index} id={block.id} className="mt-6 scroll-mt-24 text-2xl font-bold text-zinc-900">
                {block.text}
              </h1>
            );
          if (block.level === 2)
            return (
              <h2 key={index} id={block.id} className="mt-5 scroll-mt-24 text-xl font-bold text-zinc-900">
                {block.text}
              </h2>
            );
          if (block.level === 3)
            return (
              <h3 key={index} id={block.id} className="mt-4 scroll-mt-24 text-lg font-semibold text-zinc-900">
                {block.text}
              </h3>
            );
          return (
            <h4 key={index} id={block.id} className="mt-4 scroll-mt-24 text-base font-semibold text-zinc-900">
              {block.text}
            </h4>
          );
        }
        if (block.kind === "list")
          return (
            <ul key={index} className="list-disc pl-5 space-y-1">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex} className="ml-5 list-disc text-zinc-700">
                  {item}
                </li>
              ))}
            </ul>
          );
        if (block.kind === "table")
          return (
            <div key={index} className="overflow-x-auto">
              <table className="mt-4 w-full border-collapse border border-border text-sm">
                <thead>
                  <tr className="bg-card font-semibold">
                    {block.header.map((cell, cellIndex) => (
                      <th key={cellIndex} className="px-3 py-2 border border-border text-left">
                        {cell}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="px-3 py-2 border border-border">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        return (
          <p key={index} className="mt-2 text-zinc-700">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
