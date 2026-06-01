import { X, MapPin } from 'lucide-react';
import type { Artwork, TransportStatus } from '@/stores/artworkStore';
import TransportStatusPipeline from './TransportStatusPipeline';

const TRANSPORT_OPTIONS: { value: TransportStatus; label: string }[] = [
  { value: 'shipped', label: '起运' },
  { value: 'in_transit', label: '在途' },
  { value: 'arrived', label: '抵达' },
  { value: 'unpacked', label: '拆箱' },
  { value: 'hung', label: '上墙' },
  { value: 'dismantled', label: '拆展' },
  { value: 'returned', label: '回运' },
];

interface Props {
  artwork: Artwork | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (id: number, status: string, remark?: string) => void;
}

export default function ArtworkDetail({ artwork, open, onClose, onStatusChange }: Props) {
  if (!open || !artwork) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-charcoal-light border border-charcoal-border rounded-xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-xl text-cream">{artwork.title}</h2>
          <button onClick={onClose} className="text-cream-muted hover:text-cream transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="aspect-[4/3] bg-charcoal-lighter rounded-lg border border-charcoal-border flex items-center justify-center overflow-hidden">
            {artwork.image ? (
              <img src={artwork.image} alt={artwork.title} className="w-full h-full object-cover" />
            ) : (
              <div className="text-cream-muted text-sm">暂无图片</div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-cream-muted text-sm">艺术家</span>
              <p className="text-cream font-medium">{artwork.artist?.name || '未知'}</p>
            </div>
            <div>
              <span className="text-cream-muted text-sm">媒介</span>
              <p className="text-cream">{artwork.medium || '-'}</p>
            </div>
            <div>
              <span className="text-cream-muted text-sm">尺寸</span>
              <p className="text-cream">{artwork.dimensions || '-'}</p>
            </div>
            <div>
              <span className="text-cream-muted text-sm">年份</span>
              <p className="text-cream">{artwork.year || '-'}</p>
            </div>
            <div>
              <span className="text-cream-muted text-sm">运输状态</span>
              <p>
                <span className="inline-block px-3 py-0.5 rounded-full text-xs font-medium bg-gold/20 text-gold">
                  {artwork.transportStatus || '未设置'}
                </span>
              </p>
            </div>
            {artwork.notes && (
              <div>
                <span className="text-cream-muted text-sm">备注</span>
                <p className="text-cream text-sm mt-1">{artwork.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-charcoal-border">
          <h3 className="font-heading text-lg text-cream mb-4">运输状态</h3>
          <TransportStatusPipeline currentStatus={artwork.transportStatus} />

          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm text-cream-muted">更新状态：</span>
            <select
              className="bg-charcoal-lighter border border-charcoal-border rounded-lg px-3 py-1.5 text-cream text-sm focus:outline-none focus:border-gold"
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  onStatusChange(artwork.id, e.target.value);
                }
              }}
            >
              <option value="" disabled>选择状态</option>
              {TRANSPORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-charcoal-lighter">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-charcoal-border">
          <div className="flex items-center gap-2 text-cream-muted">
            <MapPin size={16} />
            <span className="text-sm">展位信息</span>
          </div>
          <p className="text-cream text-sm mt-1">尚未分配展位</p>
        </div>
      </div>
    </div>
  );
}
