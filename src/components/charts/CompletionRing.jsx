export default function CompletionRing({ pct, size = 80, stroke = 8 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} stroke="#E5E7EB" strokeWidth={stroke} fill="none" />
      <circle
        cx={size/2} cy={size/2} r={r}
        stroke="#1D9E75" strokeWidth={stroke} fill="none"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  )
}
