import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  artistName: string;
}

export default function WithdrawDialog({ open, onClose, onConfirm, artistName }: Props) {
  const [reason, setReason] = useState('');

  if (!open) return null;

  const handleSubmit = () => {
    if (!reason.trim()) return;
    onConfirm(reason);
    setReason('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-charcoal-light border border-red-900/50 rounded-xl p-6 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-400" />
          </div>
          <div>
            <h2 className="font-heading text-lg text-cream">撤展确认</h2>
            <p className="text-sm text-cream-muted">确认撤展艺术家：{artistName}</p>
          </div>
        </div>

        <div className="bg-red-900/10 border border-red-900/30 rounded-lg p-3 mb-4">
          <p className="text-red-300 text-sm">
            撤展操作将把艺术家状态更改为"已撤展"，此操作需谨慎执行。
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm text-cream-muted mb-1">撤展原因 *</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="w-full bg-charcoal-lighter border border-charcoal-border rounded-lg px-3 py-2 text-cream placeholder:text-cream-muted/50 focus:outline-none focus:border-red-500 transition-colors resize-none"
            placeholder="请输入撤展原因..."
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-cream-muted hover:text-cream border border-charcoal-border rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason.trim()}
            className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            确认撤展
          </button>
        </div>
      </div>
    </div>
  );
}
