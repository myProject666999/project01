import { useEffect, useState } from 'react';
import { useParams, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Image, MapPin, Calendar, Pencil } from 'lucide-react';
import { useExhibitionStore, type ExhibitionStatus } from '@/stores/exhibitionStore';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import { cn } from '@/lib/utils';

const EXHIBITION_STATUS_OPTIONS: { value: ExhibitionStatus; label: string }[] = [
  { value: 'planning', label: '筹备中' },
  { value: 'preparing', label: '准备中' },
  { value: 'installing', label: '布展中' },
  { value: 'open', label: '开放中' },
  { value: 'closed', label: '已闭幕' },
  { value: 'dismantling', label: '撤展中' },
];

const tabs = [
  { key: 'artists', label: '艺术家', path: 'artists' },
  { key: 'artworks', label: '作品', path: 'artworks' },
  { key: 'floorplan', label: '平面图', path: 'floorplan' },
  { key: 'guests', label: '嘉宾', path: 'guests' },
  { key: 'media', label: '物料', path: 'media' },
];

export default function ExhibitionDetail() {
  const { id } = useParams<{ id: string }>();
  const { currentExhibition, fetchExhibition, updateExhibition, isLoading } = useExhibitionStore();
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({
    name: '',
    venue: '',
    address: '',
    startDate: '',
    endDate: '',
    status: 'planning' as ExhibitionStatus,
    description: '',
    coverImage: '',
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (id) fetchExhibition(Number(id));
  }, [id, fetchExhibition]);

  useEffect(() => {
    if (currentExhibition) {
      setForm({
        name: currentExhibition.name,
        venue: currentExhibition.venue || '',
        address: currentExhibition.address || '',
        startDate: currentExhibition.startDate,
        endDate: currentExhibition.endDate,
        status: currentExhibition.status,
        description: currentExhibition.description || '',
        coverImage: currentExhibition.coverImage || '',
      });
    }
  }, [currentExhibition]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await updateExhibition(Number(id), form);
      setShowEdit(false);
    } catch {
      // error handled in store
    }
  };

  const activeTab = tabs.find((t) => location.pathname.endsWith(t.path))?.key || '';

  if (isLoading && !currentExhibition) {
    return <div className="flex justify-center py-16 text-gray-400">加载中...</div>;
  }

  if (!currentExhibition) {
    return <div className="py-16 text-center text-gray-400">展览未找到</div>;
  }

  return (
    <div className="fade-in space-y-6">
      <div className="rounded-xl border border-charcoal-lighter bg-charcoal-light p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gold/10">
              <Image size={28} className="text-gold" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-display text-2xl font-bold text-cream">
                  {currentExhibition.name}
                </h1>
                <StatusBadge status={currentExhibition.status} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} />
                  {currentExhibition.venue || '未指定场馆'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {currentExhibition.startDate} ~ {currentExhibition.endDate}
                </span>
              </div>
              {currentExhibition.description && (
                <p className="mt-2 text-sm text-gray-400">{currentExhibition.description}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowEdit(true)}
            className="flex items-center gap-2 rounded-lg border border-charcoal-lighter px-3 py-1.5 text-sm text-gray-300 transition-colors hover:border-gold hover:text-gold"
          >
            <Pencil size={14} />
            编辑
          </button>
        </div>
      </div>

      <div className="border-b border-charcoal-lighter">
        <nav className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => navigate(`/exhibitions/${id}/${tab.path}`)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium transition-colors border-b-2',
                activeTab === tab.key
                  ? 'border-gold text-gold'
                  : 'border-transparent text-gray-400 hover:text-cream',
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <Outlet />

      <Modal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        title="编辑展览"
        className="max-w-xl"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">展览名称 *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-charcoal-lighter bg-charcoal px-4 py-2 text-sm text-cream outline-none focus:border-gold"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">场馆 *</label>
              <input
                type="text"
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                className="w-full rounded-lg border border-charcoal-lighter bg-charcoal px-4 py-2 text-sm text-cream outline-none focus:border-gold"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">状态</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as ExhibitionStatus })}
                className="w-full rounded-lg border border-charcoal-lighter bg-charcoal px-4 py-2 text-sm text-cream outline-none focus:border-gold"
              >
                {EXHIBITION_STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">地址</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full rounded-lg border border-charcoal-lighter bg-charcoal px-4 py-2 text-sm text-cream outline-none focus:border-gold"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">开始日期 *</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full rounded-lg border border-charcoal-lighter bg-charcoal px-4 py-2 text-sm text-cream outline-none focus:border-gold"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">结束日期 *</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full rounded-lg border border-charcoal-lighter bg-charcoal px-4 py-2 text-sm text-cream outline-none focus:border-gold"
                required
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">描述</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-charcoal-lighter bg-charcoal px-4 py-2 text-sm text-cream outline-none focus:border-gold resize-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">封面图片 URL</label>
            <input
              type="text"
              value={form.coverImage}
              onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
              className="w-full rounded-lg border border-charcoal-lighter bg-charcoal px-4 py-2 text-sm text-cream outline-none focus:border-gold"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowEdit(false)}
              className="rounded-lg border border-charcoal-lighter px-4 py-2 text-sm text-gray-300 transition-colors hover:border-gray-500"
            >
              取消
            </button>
            <button
              type="submit"
              className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-charcoal transition-colors hover:bg-gold-light"
            >
              保存
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
