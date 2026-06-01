import { useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';
import type { Artist } from '@/stores/artistStore';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: Record<string, string>) => void;
  originalArtist: Artist | null;
}

export default function ReplaceDialog({ open, onClose, onConfirm, originalArtist }: Props) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    bio: '',
    reason: '',
  });

  if (!open || !originalArtist) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onConfirm(form);
    setForm({ name: '', phone: '', email: '', bio: '', reason: '' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-charcoal-light border border-charcoal-border rounded-xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
            <ArrowRightLeft size={20} className="text-gold" />
          </div>
          <h2 className="font-heading text-xl text-cream">替换艺术家</h2>
        </div>

        <div className="bg-charcoal-lighter border border-charcoal-border rounded-lg p-4 mb-6">
          <p className="text-xs text-cream-muted mb-2">原艺术家</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-charcoal-border flex items-center justify-center text-cream font-medium text-sm">
              {originalArtist.name.charAt(0)}
            </div>
            <div>
              <p className="text-cream font-medium">{originalArtist.name}</p>
              <p className="text-cream-muted text-sm">{originalArtist.email || originalArtist.phone || '-'}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-cream-muted mb-1">替换艺术家姓名 *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-charcoal-lighter border border-charcoal-border rounded-lg px-3 py-2 text-cream placeholder:text-cream-muted/50 focus:outline-none focus:border-gold transition-colors"
              placeholder="新艺术家姓名"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-cream-muted mb-1">电话</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-charcoal-lighter border border-charcoal-border rounded-lg px-3 py-2 text-cream placeholder:text-cream-muted/50 focus:outline-none focus:border-gold transition-colors"
                placeholder="电话号码"
              />
            </div>
            <div>
              <label className="block text-sm text-cream-muted mb-1">邮箱</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-charcoal-lighter border border-charcoal-border rounded-lg px-3 py-2 text-cream placeholder:text-cream-muted/50 focus:outline-none focus:border-gold transition-colors"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-cream-muted mb-1">简介</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={2}
              className="w-full bg-charcoal-lighter border border-charcoal-border rounded-lg px-3 py-2 text-cream placeholder:text-cream-muted/50 focus:outline-none focus:border-gold transition-colors resize-none"
              placeholder="新艺术家简介"
            />
          </div>

          <div>
            <label className="block text-sm text-cream-muted mb-1">替换原因</label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              rows={2}
              className="w-full bg-charcoal-lighter border border-charcoal-border rounded-lg px-3 py-2 text-cream placeholder:text-cream-muted/50 focus:outline-none focus:border-gold transition-colors resize-none"
              placeholder="替换原因"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-cream-muted hover:text-cream border border-charcoal-border rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gold text-charcoal font-medium rounded-lg hover:bg-gold-light transition-colors disabled:opacity-50"
              disabled={!form.name.trim()}
            >
              确认替换
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
