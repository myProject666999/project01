import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Guest, GuestCategory } from '@/stores/guestStore';

const CATEGORIES: { value: GuestCategory; label: string }[] = [
  { value: 'vvip', label: 'VVIP' },
  { value: 'vip', label: 'VIP' },
  { value: 'media', label: '媒体' },
  { value: 'general', label: '普通' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Guest>) => void;
  initial?: Guest | null;
}

export default function GuestForm({ open, onClose, onSubmit, initial }: Props) {
  const [name, setName] = useState(initial?.name || '');
  const [category, setCategory] = useState<GuestCategory>(initial?.category || 'general');
  const [phone, setPhone] = useState(initial?.phone || '');
  const [email, setEmail] = useState(initial?.email || '');
  const [organization, setOrganization] = useState(initial?.organization || '');

  useEffect(() => {
    if (initial) {
      setName(initial.name || '');
      setCategory(initial.category || 'general');
      setPhone(initial.phone || '');
      setEmail(initial.email || '');
      setOrganization(initial.organization || '');
    } else {
      setName('');
      setCategory('general');
      setPhone('');
      setEmail('');
      setOrganization('');
    }
  }, [initial, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, category, phone, email, organization });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-md rounded-lg p-6" style={{ background: '#1e1e38', border: '1px solid #2a2a4e' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'Playfair Display', color: '#c9a96e' }}>
            {initial ? '编辑嘉宾' : '添加嘉宾'}
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10"><X size={18} style={{ color: '#888' }} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[11px] uppercase block mb-1" style={{ color: '#888' }}>姓名 *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full px-3 py-2 rounded text-sm outline-none"
              style={{ background: '#1a1a2e', border: '1px solid #2a2a4e', color: '#f5f0eb' }}
            />
          </div>
          <div>
            <label className="text-[11px] uppercase block mb-1" style={{ color: '#888' }}>类别</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as GuestCategory)}
              className="w-full px-3 py-2 rounded text-sm outline-none"
              style={{ background: '#1a1a2e', border: '1px solid #2a2a4e', color: '#f5f0eb' }}
            >
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] uppercase block mb-1" style={{ color: '#888' }}>电话</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 rounded text-sm outline-none"
              style={{ background: '#1a1a2e', border: '1px solid #2a2a4e', color: '#f5f0eb' }}
            />
          </div>
          <div>
            <label className="text-[11px] uppercase block mb-1" style={{ color: '#888' }}>邮箱</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded text-sm outline-none"
              style={{ background: '#1a1a2e', border: '1px solid #2a2a4e', color: '#f5f0eb' }}
            />
          </div>
          <div>
            <label className="text-[11px] uppercase block mb-1" style={{ color: '#888' }}>机构</label>
            <input value={organization} onChange={(e) => setOrganization(e.target.value)}
              className="w-full px-3 py-2 rounded text-sm outline-none"
              style={{ background: '#1a1a2e', border: '1px solid #2a2a4e', color: '#f5f0eb' }}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded text-sm" style={{ color: '#888' }}>取消</button>
            <button type="submit"
              className="px-4 py-2 rounded text-sm font-medium" style={{ background: '#c9a96e', color: '#1a1a2e' }}>
              {initial ? '更新' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
