import type { SurveyOption } from "@/data/content-hub";

interface Props {
  options: SurveyOption[];
  counts: Record<string, number>;
}

export default function PesquisaResults({ options, counts }: Props) {
  const total = options.reduce((sum, option) => sum + (counts[option.id] ?? 0), 0);

  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-500">
        {total} {total === 1 ? "resposta" : "respostas"} da comunidade
      </p>
      {options.map((option) => {
        const count = counts[option.id] ?? 0;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return (
          <div key={option.id}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-zinc-700">{option.label}</span>
              <span className="font-semibold text-zinc-900">{pct}%</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-zinc-100">
              <div
                className="h-2.5 rounded-full bg-violet-600"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
