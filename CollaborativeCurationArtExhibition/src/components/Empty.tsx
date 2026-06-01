import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyProps {
  message?: string;
  className?: string;
}

export default function Empty({ message = '暂无数据', className }: EmptyProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-gray-400', className)}>
      <Inbox size={48} strokeWidth={1.5} className="mb-3" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
