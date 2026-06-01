import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Artwork } from '@/stores/artworkStore';
import { useArtistStore } from '@/stores/artistStore';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Artwork>) => void;
  initial?: Artwork | null;
  exhibitionId: number;
}

export default function ArtworkForm({ open, onClose, onSubmit, initial, exhibitionId }: Props) {
  const { artists, fetchByExhibition } = useArtistStore();
  const [form, setForm] = useState({
    title: '',
    artistId: 0,
    image: '',
    medium: '',
    dimensions: '',
    year: '',
    notes: '',
  });

  useEffect(() => {
    fetchByExhibition(exhibitionId);
  }, [exhibitionId, fetchByExhibition]);

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title || '',
        artistId: initial.artistId || 0,
        image: initial.image || '',
        medium: initial.medium || '',
        dimensions: initial.dimensions || '',
        year: initial.year?.toString() || '',
        notes: initial.notes || '',
      });
    } else {
      setForm({ title: '', artistId: 0, image: '', medium: '', dimensions: '', year: '', notes: '' });
    }
  }, [initial, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title: form.title,
      artistId: form.artistId,
      image: form.image || undefined,
      medium: form.medium || undefined,
      dimensions: form.dimensions || undefined,
      year: form.year ? parseInt(form.year, 10) : undefined,
      notes: form.notes || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-charcoal-light border border-charcoal-border rounded-xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-xl text-cream">{initial ? '编辑作品' : '添加作品'}</h2>
          <button onClick={onClose} className="text-cream-muted hover:text-cream transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-cream-muted mb-1">作品名称 *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-charcoal-lighter border border-charcoal-border rounded-lg px-3 py-2 text-cream placeholder:text-cream-muted/50 focus:outline-none focus:border-gold transition-colors"
              placeholder="作品名称"
            />
          </div>

          <div>
            <label className="block text-sm text-cream-muted mb-1">艺术家 *</label>
            <select
              required
              value={form.artistId}
              onChange={(e) => setForm({ ...form, artistId: parseInt(e.target.value, 10) })}
              className="w-full bg-charcoal-lighter border border-charcoal-border rounded-lg px-3 py-2 text-cream focus:outline-none focus:border-gold transition-colors"
            >
              <option value={0} className="bg-charcoal-lighter">选择艺术家</option>
              {artists.map((a) => (
                <option key={a.id} value={a.id} className="bg-charcoal-lighter">
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-cream-muted mb-1">图片 URL</label>
            <input
              type="text"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="w-full bg-charcoal-lighter border border-charcoal-border rounded-lg px-3 py-2 text-cream placeholder:text-cream-muted/50 focus:outline-none focus:border-gold transition-colors"
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-cream-muted mb-1">媒介</label>
              <input
                type="text"
                value={form.medium}
                onChange={(e) => setForm({ ...form, medium: e.target.value })}
                className="w-full bg-charcoal-lighter border border-charcoal-border rounded-lg px-3 py-2 text-cream placeholder:text-cream-muted/50 focus:outline-none focus:border-gold transition-colors"
                placeholder="油画 / 装置 / 摄影..."
              />
            </div>
            <div>
              <label className="block text-sm text-cream-muted mb-1">尺寸</label>
              <input
                type="text"
                value={form.dimensions}
                onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
                className="w-full bg-charcoal-lighter border border-charcoal-border rounded-lg px-3 py-2 text-cream placeholder:text-cream-muted/50 focus:outline-none focus:border-gold transition-colors"
                placeholder="100×80cm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-cream-muted mb-1">年份</label>
            <input
              type="number"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              className="w-full bg-charcoal-lighter border border-charcoal-border rounded-lg px-3 py-2 text-cream placeholder:text-cream-muted/50 focus:outline-none focus:border-gold transition-colors"
              placeholder="2024"
            />
          </div>

          <div>
            <label className="block text-sm text-cream-muted mb-1">备注</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full bg-charcoal-lighter border border-charcoal-border rounded-lg px-3 py-2 text-cream placeholder:text-cream-muted/50 focus:outline-none focus:border-gold transition-colors resize-none"
              placeholder="作品说明"
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
              className="px-6 py-2 bg-gold text-charcoal font-medium rounded-lg hover:bg-gold-light transition-colors"
            >
              {initial ? '保存' : '添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
