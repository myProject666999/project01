import { useEffect, useState } from 'react';
import { UserCheck, ScanLine, Smile, User } from 'lucide-react';
import type { Guest } from '@/stores/guestStore';

interface CheckinEntry {
  id: number;
  guestName: string;
  time: string;
  method: string;
}

interface Props {
  guests: Guest[];
  onCheckin: (id: number, method: string) => void;
}

export default function CheckinFeed({ guests }: Props) {
  const [entries, setEntries] = useState<CheckinEntry[]>([]);

  useEffect(() => {
    const checkedGuests = guests.filter((g) => g.checkinStatus === 'checked_in' && g.checkinAt);
    const mapped: CheckinEntry[] = checkedGuests.map((g) => ({
      id: g.id,
      guestName: g.name,
      time: g.checkinAt!,
      method: g.checkinMethod || 'manual',
    }));
    mapped.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    setEntries(mapped);
  }, [guests]);

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'qrcode': return <ScanLine size={14} style={{ color: '#c9a96e' }} />;
      case 'face': return <Smile size={14} style={{ color: '#6ea9c9' }} />;
      default: return <UserCheck size={14} style={{ color: '#6ec9a9' }} />;
    }
  };

  const formatTime = (t: string) => {
    const d = new Date(t);
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="rounded-lg p-4" style={{ background: '#1e1e38', border: '1px solid #2a2a4e' }}>
      <h4 className="text-sm font-semibold mb-3" style={{ color: '#c9a96e', fontFamily: 'Playfair Display' }}>实时签到动态</h4>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {entries.length === 0 && (
          <div className="text-xs text-center py-4" style={{ color: '#666' }}>暂无签到记录</div>
        )}
        {entries.map((entry) => (
          <div key={entry.id}
            className="flex items-center gap-3 px-3 py-2 rounded"
            style={{ background: '#1a1a2e', animation: 'slideIn 0.3s ease-out' }}
          >
            {getMethodIcon(entry.method)}
            <span className="text-sm flex-1" style={{ color: '#f5f0eb' }}>{entry.guestName}</span>
            <span className="text-[10px]" style={{ color: '#888' }}>{formatTime(entry.time)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
