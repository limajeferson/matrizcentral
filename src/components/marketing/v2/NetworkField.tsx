const NODES: [number, number, number][] = [
  [60, 80, 5], [180, 40, 4], [300, 90, 6], [420, 50, 4], [540, 110, 5],
  [220, 160, 4], [340, 200, 6], [460, 180, 4], [120, 240, 5], [520, 260, 4],
  [260, 300, 5], [400, 320, 4], [80, 340, 4], [560, 350, 5],
];

const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [1, 5], [2, 6], [3, 7], [5, 6], [6, 7],
  [0, 5], [5, 8], [6, 10], [7, 9], [8, 12], [10, 11], [9, 13], [11, 13], [8, 10],
];

export default function NetworkField({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 600 400"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5">
        {EDGES.map(([a, b]) => (
          <line
            key={`${a}-${b}`}
            x1={NODES[a][0]} y1={NODES[a][1]}
            x2={NODES[b][0]} y2={NODES[b][1]}
          />
        ))}
      </g>
      <g fill="currentColor">
        {NODES.map(([x, y, r], i) => (
          <circle
            key={i}
            cx={x} cy={y} r={r}
            className="mc-node"
            style={{ animationDelay: `${(i % 7) * 0.6}s` }}
          />
        ))}
      </g>
    </svg>
  );
}
