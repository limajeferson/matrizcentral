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
      <h2 className="text-xl font-bold mb-4">Seu Roadmap</h2>
      <div className="space-y-4">
        {Object.entries(roadmap).map(([weekKey, week]) => (
          <div key={weekKey} className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold">{week.title}</h3>
            <ul className="text-sm text-gray-600 mt-2 space-y-1">
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
