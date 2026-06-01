import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import type { MediaItem, MediaType } from '@/stores/mediaStore';

const TYPE_OPTIONS: { value: MediaType; label: string }[] = [
  { value: 'poster', label: '海报' },
  { value: 'press_release', label: '通稿' },
  { value: 'other', label: '其他' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<MediaItem>, file?: File) => void;
}

export default function MediaForm({ open, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<MediaType>('poster');
  const [file, setFile] = useState<File | null>(null);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, type }, file || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-md rounded-lg p-6" style={{ background: '#1e1e38', border: '1px solid #2a2a4e' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'Playfair Display', color: '#c9a96e' }}>上传物料</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10"><X size={18} style={{ color: '#888' }} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[11px] uppercase block mb-1" style={{ color: '#888' }}>标题 *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required
              className="w-full px-3 py-2 rounded text-sm outline-none"
              style={{ background: '#1a1a2e', border: '1px solid #2a2a4e', color: '#f5f0eb' }}
            />
          </div>
          <div>
            <label className="text-[11px] uppercase block mb-1" style={{ color: '#888' }}>类型</label>
            <select value={type} onChange={(e) => setType(e.target.value as MediaType)}
              className="w-full px-3 py-2 rounded text-sm outline-none"
              style={{ background: '#1a1a2e', border: '1px solid #2a2a4e', color: '#f5f0eb' }}
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] uppercase block mb-1" style={{ color: '#888' }}>文件</label>
            <label className="flex items-center gap-2 px-3 py-2 rounded cursor-pointer hover:bg-white/5"
              style={{ border: '1px dashed #2a2a4e' }}>
              <Upload size={14} style={{ color: '#888' }} />
              <span className="text-sm" style={{ color: file ? '#f5f0eb' : '#666' }}>{file?.name || '选择文件...'}</span>
              <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded text-sm" style={{ color: '#888' }}>取消</button>
            <button type="submit" className="px-4 py-2 rounded text-sm font-medium" style={{ background: '#c9a96e', color: '#1a1a2e' }}>上传</button>
          </div>
        </form>
      </div>
    </div>
  );
}
