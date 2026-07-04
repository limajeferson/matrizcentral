export default function NetworkMotif({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 600 400"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1" fill="none">
        <line x1="60" y1="80" x2="180" y2="40" />
        <line x1="180" y1="40" x2="300" y2="90" />
        <line x1="300" y1="90" x2="420" y2="50" />
        <line x1="420" y1="50" x2="540" y2="110" />
        <line x1="180" y1="40" x2="220" y2="160" />
        <line x1="300" y1="90" x2="340" y2="200" />
        <line x1="420" y1="50" x2="460" y2="180" />
        <line x1="220" y1="160" x2="340" y2="200" />
        <line x1="340" y1="200" x2="460" y2="180" />
        <line x1="60" y1="80" x2="220" y2="160" />
      </g>
      <g fill="currentColor">
        <circle cx="60" cy="80" r="5" />
        <circle cx="180" cy="40" r="4" />
        <circle cx="300" cy="90" r="6" />
        <circle cx="420" cy="50" r="4" />
        <circle cx="540" cy="110" r="5" />
        <circle cx="220" cy="160" r="4" />
        <circle cx="340" cy="200" r="6" />
        <circle cx="460" cy="180" r="4" />
      </g>
    </svg>
  );
}
