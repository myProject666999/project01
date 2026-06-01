import type { TransportStatus } from '@/stores/artworkStore';

const STAGES: { key: TransportStatus; label: string }[] = [
  { key: 'shipped', label: '起运' },
  { key: 'in_transit', label: '在途' },
  { key: 'arrived', label: '抵达' },
  { key: 'unpacked', label: '拆箱' },
  { key: 'hung', label: '上墙' },
  { key: 'dismantled', label: '拆展' },
  { key: 'returned', label: '回运' },
];

interface Props {
  currentStatus?: TransportStatus;
}

export default function TransportStatusPipeline({ currentStatus }: Props) {
  const currentIndex = currentStatus
    ? STAGES.findIndex((s) => s.key === currentStatus)
    : -1;

  return (
    <div className="flex items-center gap-1 w-full overflow-x-auto py-2">
      {STAGES.map((stage, index) => {
        const isCompleted = currentIndex >= 0 && index < currentIndex;
        const isCurrent = currentIndex >= 0 && index === currentIndex;

        return (
          <div key={stage.key} className="flex items-center shrink-0">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-all ${
                  isCompleted
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : isCurrent
                      ? 'bg-gold border-gold text-charcoal'
                      : 'bg-transparent border-charcoal-border text-cream-muted'
                }`}
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              <span
                className={`text-[10px] whitespace-nowrap ${
                  isCompleted
                    ? 'text-emerald-400'
                    : isCurrent
                      ? 'text-gold font-medium'
                      : 'text-cream-muted'
                }`}
              >
                {stage.label}
              </span>
            </div>
            {index < STAGES.length - 1 && (
              <div
                className={`w-5 h-0.5 mx-0.5 mb-4 ${
                  isCompleted ? 'bg-emerald-500' : 'bg-charcoal-border'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
