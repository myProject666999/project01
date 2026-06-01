interface TastingChartProps {
  data: { date: string; score: number }[];
}

export default function TastingChart({ data }: TastingChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500 font-body text-sm">
        No tasting data available
      </div>
    );
  }

  const w = 500;
  const h = 200;
  const padX = 40;
  const padY = 30;
  const chartW = w - padX * 2;
  const chartH = h - padY * 2;

  const maxScore = 100;
  const minScore = 0;

  const points = data.map((d, i) => {
    const x = padX + (i / Math.max(data.length - 1, 1)) * chartW;
    const y = padY + chartH - ((d.score - minScore) / (maxScore - minScore)) * chartH;
    return { x, y, ...d };
  });

  const linePath = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ');

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padY + chartH} L ${points[0].x} ${padY + chartH} Z`;

  const yTicks = [0, 25, 50, 75, 100];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
      <defs>
        <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C5A55A" stopOpacity={0.3} />
          <stop offset="100%" stopColor="#C5A55A" stopOpacity={0.02} />
        </linearGradient>
      </defs>

      {yTicks.map((tick) => {
        const y = padY + chartH - ((tick - minScore) / (maxScore - minScore)) * chartH;
        return (
          <g key={tick}>
            <line
              x1={padX}
              y1={y}
              x2={w - padX}
              y2={y}
              stroke="rgba(197,165,90,0.1)"
              strokeWidth={1}
            />
            <text
              x={padX - 8}
              y={y + 4}
              fill="#6b7280"
              fontSize={10}
              textAnchor="end"
              fontFamily="Noto Sans SC, sans-serif"
            >
              {tick}
            </text>
          </g>
        );
      })}

      <path d={areaPath} fill="url(#scoreGrad)" />
      <path
        d={linePath}
        fill="none"
        stroke="#C5A55A"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={5} fill="#1A1A2E" stroke="#C5A55A" strokeWidth={2} />
          <text
            x={p.x}
            y={p.y - 12}
            fill="#C5A55A"
            fontSize={9}
            textAnchor="middle"
            fontFamily="Playfair Display, serif"
            fontWeight="600"
          >
            {p.score}
          </text>
          <text
            x={p.x}
            y={padY + chartH + 16}
            fill="#6b7280"
            fontSize={8}
            textAnchor="middle"
            fontFamily="Noto Sans SC, sans-serif"
          >
            {new Date(p.date).toLocaleDateString('en', { month: 'short', year: '2-digit' })}
          </text>
        </g>
      ))}
    </svg>
  );
}
