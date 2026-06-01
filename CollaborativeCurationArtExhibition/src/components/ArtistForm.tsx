import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Artist } from '@/stores/artistStore';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Artist>) => void;
  initial?: Artist | null;
}

export default function ArtistForm({ open, onClose, onSubmit, initial }: Props) {
  const [form, setForm] = useState({
    name: '',
    bio: '',
    avatar: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || '',
        bio: initial.bio || '',
        avatar: initial.avatar || '',
        email: initial.email || '',
        phone: initial.phone || '',
      });
    } else {
      setForm({ name: '', bio: '', avatar: '', email: '', phone: '' });
    }
  }, [initial, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-charcoal-light border border-charcoal-border rounded-xl p-6 w-full max-w-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-xl text-cream">{initial ? '编辑艺术家' : '邀请艺术家'}</h2>
          <button onClick={onClose} className="text-cream-muted hover:text-cream transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-cream-muted mb-1">姓名 *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-charcoal-lighter border border-charcoal-border rounded-lg px-3 py-2 text-cream placeholder:text-cream-muted/50 focus:outline-none focus:border-gold transition-colors"
              placeholder="艺术家姓名"
            />
          </div>

          <div>
            <label className="block text-sm text-cream-muted mb-1">头像 URL</label>
            <input
              type="text"
              value={form.avatar}
              onChange={(e) => setForm({ ...form, avatar: e.target.value })}
              className="w-full bg-charcoal-lighter border border-charcoal-border rounded-lg px-3 py-2 text-cream placeholder:text-cream-muted/50 focus:outline-none focus:border-gold transition-colors"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm text-cream-muted mb-1">简介</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              className="w-full bg-charcoal-lighter border border-charcoal-border rounded-lg px-3 py-2 text-cream placeholder:text-cream-muted/50 focus:outline-none focus:border-gold transition-colors resize-none"
              placeholder="艺术家简介"
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
              className="px-6 py-2 bg-gold text-charcoal font-medium rounded-lg hover:bg-gold-light transition-colors"
            >
              {initial ? '保存' : '邀请'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
