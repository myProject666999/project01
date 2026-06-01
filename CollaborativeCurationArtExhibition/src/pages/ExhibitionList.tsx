import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Image, Plus, Search } from 'lucide-react';
import { useExhibitionStore, type ExhibitionStatus } from '@/stores/exhibitionStore';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import Empty from '@/components/Empty';

const EXHIBITION_STATUS_OPTIONS: { value: ExhibitionStatus; label: string }[] = [
  { value: 'planning', label: '筹备中' },
  { value: 'preparing', label: '准备中' },
  { value: 'installing', label: '布展中' },
  { value: 'open', label: '开放中' },
  { value: 'closed', label: '已闭幕' },
  { value: 'dismantling', label: '撤展中' },
];

export default function ExhibitionList() {
  const { exhibitions, isLoading, fetchExhibitions, createExhibition } = useExhibitionStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showCreate, setShowCreate] = useState(false);
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

  useEffect(() => {
    fetchExhibitions();
  }, [fetchExhibitions]);

  const filtered = exhibitions.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      (e.venue || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createExhibition(form);
      setShowCreate(false);
      setForm({
        name: '',
        venue: '',
        address: '',
        startDate: '',
        endDate: '',
        status: 'planning',
        description: '',
        coverImage: '',
      });
      fetchExhibitions();
    } catch {
      // error handled in store
    }
  };

  return (
    <div className="fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image size={24} className="text-gold" />
          <h1 className="font-display text-2xl font-bold text-cream">展览管理</h1>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-charcoal transition-colors hover:bg-gold-light"
        >
          <Plus size={18} />
          新建展览
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索展览名称或场馆..."
            className="w-full rounded-lg border border-charcoal-lighter bg-charcoal-light py-2.5 pl-10 pr-4 text-sm text-cream placeholder-gray-500 outline-none transition-colors focus:border-gold"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-charcoal-lighter bg-charcoal-light px-4 py-2.5 text-sm text-cream outline-none transition-colors focus:border-gold"
        >
          <option value="">全部状态</option>
          {EXHIBITION_STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16 text-gray-400">加载中...</div>
      ) : filtered.length === 0 ? (
        <Empty message="暂无展览数据" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((exhibition) => (
            <Link
              key={exhibition.id}
              to={`/exhibitions/${exhibition.id}`}
              className="card-hover group rounded-xl border border-charcoal-lighter bg-charcoal-light overflow-hidden"
            >
              <div className="h-40 bg-charcoal-lighter flex items-center justify-center">
                {exhibition.coverImage ? (
                  <img
                    src={exhibition.coverImage}
                    alt={exhibition.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Image size={40} className="text-gray-600" />
                )}
              </div>
              <div className="p-4">
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="font-display text-base font-semibold text-cream group-hover:text-gold transition-colors">
                    {exhibition.name}
                  </h3>
                  <StatusBadge status={exhibition.status} />
                </div>
                <p className="text-sm text-gray-400">
                  {exhibition.venue || '未指定场馆'}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {exhibition.startDate} ~ {exhibition.endDate}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="新建展览"
        className="max-w-xl"
      >
        <form onSubmit={handleCreate} className="space-y-4">
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
              onClick={() => setShowCreate(false)}
              className="rounded-lg border border-charcoal-lighter px-4 py-2 text-sm text-gray-300 transition-colors hover:border-gray-500"
            >
              取消
            </button>
            <button
              type="submit"
              className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-charcoal transition-colors hover:bg-gold-light"
            >
              创建
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
