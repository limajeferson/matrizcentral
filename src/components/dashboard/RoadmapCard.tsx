interface RoadmapWeek {
  title: string;
  items: string[];
}

interface Props {
  roadmap: Record<string, RoadmapWeek>;
}

export default function RoadmapCard({ roadmap }: Props) {
  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-zinc-900">Seu Roadmap</h2>
      <div className="space-y-4">
        {Object.entries(roadmap).map(([weekKey, week]) => (
          <div key={weekKey} className="border-l-4 border-violet-400 pl-4">
            <h3 className="font-semibold text-zinc-900">{week.title}</h3>
            <ul className="mt-2 space-y-1 text-sm text-zinc-600">
              {week.items.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
