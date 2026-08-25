interface Segment {
  label: string;
  value: number;
  color: string;
}

export function DonutChart({ segments, size = 160 }: { segments: Segment[]; size?: number }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const radius = size / 2 - 12;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let cumulativePct = 0;

  return (
    <div className="flex flex-col items-center gap-4 tablet:flex-row tablet:gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#E4E2DB" strokeWidth={20} />
        {total > 0 &&
          segments.map((seg, i) => {
            const pct = seg.value / total;
            if (pct <= 0) return null;
            const dash = pct * circumference;
            const offset = circumference - cumulativePct * circumference;
            cumulativePct += pct;
            return (
              <circle
                key={i}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={20}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={offset}
                transform={`rotate(-90 ${center} ${center})`}
                strokeLinecap="butt"
              />
            );
          })}
        <text x={center} y={center} textAnchor="middle" dominantBaseline="middle" className="font-mono" fontSize={14} fill="#12181F">
          ${total.toFixed(0)}
        </text>
      </svg>
      <ul className="flex flex-col gap-2">
        {segments.map((seg, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-ink-700">
            <span className="inline-block h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: seg.color }} />
            {seg.label}
            <span className="font-mono text-ink-900">${seg.value.toFixed(2)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
