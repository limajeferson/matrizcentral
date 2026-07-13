export default function Markdown({ source }: { source: string }) {
  return (
    <div>
      {source.split("\n").map((line, index) => {
        if (line.startsWith("# ")) return <h1 key={index} className="mt-6 text-2xl font-bold text-zinc-900">{line.slice(2)}</h1>;
        if (line.startsWith("## ")) return <h2 key={index} className="mt-5 text-xl font-bold text-zinc-900">{line.slice(3)}</h2>;
        if (line.startsWith("### ")) return <h3 key={index} className="mt-4 text-lg font-semibold text-zinc-900">{line.slice(4)}</h3>;
        if (line.startsWith("- ")) return <li key={index} className="ml-5 list-disc text-zinc-700">{line.slice(2)}</li>;
        if (line.trim() === "") return null;
        return <p key={index} className="mt-2 text-zinc-700">{line}</p>;
      })}
    </div>
  );
}
