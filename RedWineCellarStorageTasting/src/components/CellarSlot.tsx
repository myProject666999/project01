import { useState } from 'react';

interface CellarSlotProps {
  rack: number;
  layer: number;
  position: number;
  status: 'empty' | 'occupied' | 'approaching' | 'overdue';
  wine?: {
    chateau: string;
    vintage: number;
    region: string;
  };
  selected?: boolean;
  onClick?: () => void;
}

const statusColors: Record<string, string> = {
  empty: '#374151',
  occupied: '#722F37',
  approaching: '#D97706',
  overdue: '#DC2626',
};

export default function CellarSlot({
  layer,
  position,
  status,
  wine,
  selected,
  onClick,
}: CellarSlotProps) {
  const [hovered, setHovered] = useState(false);

  const slotW = 48;
  const slotH = 28;
  const depth = 8;
  const x = position * (slotW + 4);
  const y = layer * (slotH + 6);

  const color = selected ? '#C5A55A' : statusColors[status];

  return (
    <g
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'pointer' }}
    >
      <rect
        x={x}
        y={y}
        width={slotW}
        height={slotH}
        rx={3}
        fill={color}
        stroke={hovered ? '#C5A55A' : 'rgba(197,165,90,0.2)'}
        strokeWidth={hovered ? 2 : 1}
        opacity={hovered ? 1 : 0.85}
      />
      <rect
        x={x}
        y={y - depth}
        width={slotW}
        height={depth}
        rx={1}
        fill={color}
        opacity={0.6}
        stroke="rgba(197,165,90,0.15)"
        strokeWidth={0.5}
      />
      <polygon
        points={`${x},${y} ${x},${y - depth} ${x + depth},${y - depth - depth / 2} ${x + depth},${y - depth / 2}`}
        fill={color}
        opacity={0.5}
      />
      <polygon
        points={`${x + slotW},${y} ${x + slotW},${y - depth} ${x + slotW + depth},${y - depth - depth / 2} ${x + slotW + depth},${y - depth / 2}`}
        fill={color}
        opacity={0.4}
      />

      {hovered && wine && (
        <g>
          <rect
            x={x}
            y={y - 56}
            width={slotW + 60}
            height={44}
            rx={4}
            fill="rgba(26,26,46,0.95)"
            stroke="#C5A55A"
            strokeWidth={1}
          />
          <text
            x={x + 6}
            y={y - 40}
            fill="#C5A55A"
            fontSize={9}
            fontFamily="Playfair Display, serif"
            fontWeight="600"
          >
            {wine.chateau}
          </text>
          <text
            x={x + 6}
            y={y - 26}
            fill="#d1d5db"
            fontSize={8}
            fontFamily="Noto Sans SC, sans-serif"
          >
            {wine.vintage} · {wine.region}
          </text>
        </g>
      )}
    </g>
  );
}
