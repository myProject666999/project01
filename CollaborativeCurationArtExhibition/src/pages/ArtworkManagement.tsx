import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Plus, LayoutGrid, List, CheckSquare, Square } from 'lucide-react';
import { useArtworkStore, type TransportStatus } from '@/stores/artworkStore';
import { useArtistStore } from '@/stores/artistStore';
import ArtworkForm from '@/components/ArtworkForm';
import ArtworkDetail from '@/components/ArtworkDetail';
import TransportStatusPipeline from '@/components/TransportStatusPipeline';
import type { Artwork } from '@/stores/artworkStore';

const TRANSPORT_LABELS: Record<string, string> = {
  shipped: '起运',
  in_transit: '在途',
  arrived: '抵达',
  unpacked: '拆箱',
  hung: '上墙',
  dismantled: '拆展',
  returned: '回运',
};

const TRANSPORT_COLORS: Record<string, string> = {
  shipped: 'bg-blue-500/20 text-blue-400',
  in_transit: 'bg-amber-500/20 text-amber-400',
  arrived: 'bg-emerald-500/20 text-emerald-400',
  unpacked: 'bg-purple-500/20 text-purple-400',
  hung: 'bg-gold/20 text-gold',
  dismantled: 'bg-orange-500/20 text-orange-400',
  returned: 'bg-cream/10 text-cream-muted',
};

const STATUS_OPTIONS: { value: TransportStatus; label: string }[] = [
  { value: 'shipped', label: '起运' },
  { value: 'in_transit', label: '在途' },
  { value: 'arrived', label: '抵达' },
  { value: 'unpacked', label: '拆箱' },
  { value: 'hung', label: '上墙' },
  { value: 'dismantled', label: '拆展' },
  { value: 'returned', label: '回运' },
];

export default function ArtworkManagement() {
  const { exhibitionId } = useParams<{ exhibitionId: string }>();
  const navigate = useNavigate();
  const { artworks, loading, fetchByExhibition, create, update, updateStatus, batchUpdateStatus, setCurrentArtwork, currentArtwork } = useArtworkStore();
  const { artists, fetchByExhibition: fetchArtists } = useArtistStore();

  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [formOpen, setFormOpen] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailArtwork, setDetailArtwork] = useState<Artwork | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [batchStatus, setBatchStatus] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [artistFilter, setArtistFilter] = useState('');

  const exhId = parseInt(exhibitionId || '0', 10);

  const loadData = useCallback(() => {
    if (exhId) {
      fetchByExhibition(exhId);
      fetchArtists(exhId);
    }
  }, [exhId, fetchByExhibition, fetchArtists]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = artworks.filter((a) => {
    const matchSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.artist?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || a.transportStatus === statusFilter;
    const matchArtist = !artistFilter || a.artistId === parseInt(artistFilter, 10);
    return matchSearch && matchStatus && matchArtist;
  });

  const handleCreate = async (data: Partial<Artwork>) => {
    await create(exhId, data);
    setFormOpen(false);
  };

  const handleUpdate = async (data: Partial<Artwork>) => {
    if (editingArtwork) {
      await update(exhId, editingArtwork.id, data);
      setFormOpen(false);
      setEditingArtwork(null);
    }
  };

  const handleStatusChange = async (id: number, status: string, remark?: string) => {
    await updateStatus(exhId, id, status, remark);
    if (detailArtwork?.id === id) {
      setDetailArtwork({ ...detailArtwork, transportStatus: status as TransportStatus });
    }
  };

  const handleBatchStatus = async () => {
    if (!batchStatus || selected.size === 0) return;
    await batchUpdateStatus(exhId, Array.from(selected), batchStatus);
    setSelected(new Set());
    setBatchStatus('');
  };

  const toggleSelect = (id: number) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((a) => a.id)));
    }
  };

  const openDetail = (artwork: Artwork) => {
    setDetailArtwork(artwork);
    setCurrentArtwork(artwork);
    setDetailOpen(true);
  };

  const getArtistName = (artistId: number) => {
    const artist = artists.find((a) => a.id === artistId);
    return artist?.name || '未知';
  };

  const getTransportBadge = (artwork: Artwork) => {
    const status = artwork.transportStatus || '';
    const label = TRANSPORT_LABELS[status] || status || '未设置';
    const cls = TRANSPORT_COLORS[status] || 'bg-charcoal-lighter text-cream-muted';
    return (
      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-charcoal font-body">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl text-cream">作品管理</h1>
            <p className="text-cream-muted text-sm mt-1">共 {artworks.length} 件作品</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/exhibitions/${exhId}/artists`)}
              className="px-4 py-2 text-cream-muted hover:text-cream border border-charcoal-border rounded-lg transition-colors text-sm"
            >
              艺术家管理
            </button>
            <button
              onClick={() => {
                setEditingArtwork(null);
                setCurrentArtwork(null);
                setFormOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gold text-charcoal font-medium rounded-lg hover:bg-gold-light transition-colors"
            >
              <Plus size={18} />
              添加作品
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索作品名称、艺术家..."
              className="w-full pl-10 pr-4 py-2.5 bg-charcoal-light border border-charcoal-border rounded-lg text-cream placeholder:text-cream-muted/50 focus:outline-none focus:border-gold transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-charcoal-light border border-charcoal-border rounded-lg px-3 py-2.5 text-cream text-sm focus:outline-none focus:border-gold"
          >
            <option value="">全部状态</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value} className="bg-charcoal-lighter">{s.label}</option>
            ))}
          </select>
          <select
            value={artistFilter}
            onChange={(e) => setArtistFilter(e.target.value)}
            className="bg-charcoal-light border border-charcoal-border rounded-lg px-3 py-2.5 text-cream text-sm focus:outline-none focus:border-gold"
          >
            <option value="">全部艺术家</option>
            {artists.map((a) => (
              <option key={a.id} value={a.id} className="bg-charcoal-lighter">{a.name}</option>
            ))}
          </select>
          <div className="flex items-center border border-charcoal-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2.5 transition-colors ${viewMode === 'grid' ? 'bg-gold text-charcoal' : 'text-cream-muted hover:text-cream'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2.5 transition-colors ${viewMode === 'list' ? 'bg-gold text-charcoal' : 'text-cream-muted hover:text-cream'}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {selected.size > 0 && (
          <div className="flex items-center gap-4 mb-4 p-3 bg-charcoal-light border border-gold/30 rounded-lg">
            <span className="text-cream text-sm">已选择 {selected.size} 件作品</span>
            <select
              value={batchStatus}
              onChange={(e) => setBatchStatus(e.target.value)}
              className="bg-charcoal-lighter border border-charcoal-border rounded-lg px-3 py-1.5 text-cream text-sm focus:outline-none focus:border-gold"
            >
              <option value="">选择状态</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value} className="bg-charcoal-lighter">{s.label}</option>
              ))}
            </select>
            <button
              onClick={handleBatchStatus}
              disabled={!batchStatus}
              className="px-4 py-1.5 bg-gold text-charcoal text-sm font-medium rounded-lg hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              批量更新
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="text-cream-muted hover:text-cream text-sm transition-colors"
            >
              取消选择
            </button>
          </div>
        )}

        {loading && !artworks.length ? (
          <div className="text-center py-20 text-cream-muted">加载中...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-cream-muted">
            {search || statusFilter || artistFilter ? '未找到匹配的作品' : '暂无作品，点击上方按钮添加'}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((artwork) => (
              <div
                key={artwork.id}
                className={`bg-charcoal-light border rounded-xl overflow-hidden hover:border-gold/30 transition-colors cursor-pointer group relative ${selected.has(artwork.id) ? 'border-gold' : 'border-charcoal-border'}`}
                onClick={() => openDetail(artwork)}
              >
                <div
                  className="absolute top-2 left-2 z-10"
                  onClick={(e) => { e.stopPropagation(); toggleSelect(artwork.id); }}
                >
                  {selected.has(artwork.id) ? (
                    <CheckSquare size={20} className="text-gold" />
                  ) : (
                    <Square size={20} className="text-cream-muted/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
                <div className="aspect-[4/3] bg-charcoal-lighter flex items-center justify-center">
                  {artwork.image ? (
                    <img src={artwork.image} alt={artwork.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-cream-muted text-sm">暂无图片</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-cream font-medium truncate mb-1">{artwork.title}</h3>
                  <p className="text-cream-muted text-sm truncate mb-2">
                    {artwork.artist?.name || getArtistName(artwork.artistId)}
                  </p>
                  <div className="flex items-center justify-between">
                    {getTransportBadge(artwork)}
                    <select
                      className="bg-charcoal-lighter border border-charcoal-border rounded text-xs px-1.5 py-0.5 text-cream-muted focus:outline-none focus:border-gold"
                      onClick={(e) => e.stopPropagation()}
                      defaultValue=""
                      onChange={(e) => {
                        e.stopPropagation();
                        if (e.target.value) handleStatusChange(artwork.id, e.target.value);
                      }}
                    >
                      <option value="" disabled>更新状态</option>
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value} className="bg-charcoal-lighter">{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-charcoal-light border border-charcoal-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-charcoal-border">
                  <th className="text-left px-4 py-3 text-cream-muted text-sm font-medium w-10">
                    <button onClick={toggleAll}>
                      {selected.size === filtered.length && filtered.length > 0 ? (
                        <CheckSquare size={16} className="text-gold" />
                      ) : (
                        <Square size={16} className="text-cream-muted" />
                      )}
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-cream-muted text-sm font-medium">图片</th>
                  <th className="text-left px-4 py-3 text-cream-muted text-sm font-medium">标题</th>
                  <th className="text-left px-4 py-3 text-cream-muted text-sm font-medium">艺术家</th>
                  <th className="text-left px-4 py-3 text-cream-muted text-sm font-medium">媒介</th>
                  <th className="text-left px-4 py-3 text-cream-muted text-sm font-medium">尺寸</th>
                  <th className="text-left px-4 py-3 text-cream-muted text-sm font-medium">运输状态</th>
                  <th className="text-left px-4 py-3 text-cream-muted text-sm font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((artwork) => (
                  <tr
                    key={artwork.id}
                    className={`border-b border-charcoal-border hover:bg-charcoal-lighter/50 cursor-pointer transition-colors ${selected.has(artwork.id) ? 'bg-gold/5' : ''}`}
                    onClick={() => openDetail(artwork)}
                  >
                    <td className="px-4 py-3" onClick={(e) => { e.stopPropagation(); toggleSelect(artwork.id); }}>
                      {selected.has(artwork.id) ? (
                        <CheckSquare size={16} className="text-gold" />
                      ) : (
                        <Square size={16} className="text-cream-muted" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 bg-charcoal-lighter rounded border border-charcoal-border overflow-hidden flex items-center justify-center">
                        {artwork.image ? (
                          <img src={artwork.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-cream-muted text-xs">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-cream text-sm font-medium">{artwork.title}</td>
                    <td className="px-4 py-3 text-cream-muted text-sm">
                      {artwork.artist?.name || getArtistName(artwork.artistId)}
                    </td>
                    <td className="px-4 py-3 text-cream-muted text-sm">{artwork.medium || '-'}</td>
                    <td className="px-4 py-3 text-cream-muted text-sm">{artwork.dimensions || '-'}</td>
                    <td className="px-4 py-3">{getTransportBadge(artwork)}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        className="bg-charcoal-lighter border border-charcoal-border rounded text-xs px-1.5 py-0.5 text-cream-muted focus:outline-none focus:border-gold"
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) handleStatusChange(artwork.id, e.target.value);
                        }}
                      >
                        <option value="" disabled>状态</option>
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value} className="bg-charcoal-lighter">{s.label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="mt-8">
            <h2 className="font-heading text-lg text-cream mb-4">运输进度总览</h2>
            <div className="bg-charcoal-light border border-charcoal-border rounded-xl p-4 space-y-4">
              {filtered.map((artwork) => (
                <div
                  key={artwork.id}
                  className="flex items-center gap-4 py-2 cursor-pointer hover:bg-charcoal-lighter/30 rounded-lg px-2 transition-colors"
                  onClick={() => openDetail(artwork)}
                >
                  <span className="text-cream text-sm w-32 truncate">{artwork.title}</span>
                  <span className="text-cream-muted text-xs w-20 truncate">
                    {artwork.artist?.name || getArtistName(artwork.artistId)}
                  </span>
                  <div className="flex-1">
                    <TransportStatusPipeline currentStatus={artwork.transportStatus} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ArtworkForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingArtwork(null);
          setCurrentArtwork(null);
        }}
        onSubmit={editingArtwork ? handleUpdate : handleCreate}
        initial={editingArtwork || currentArtwork}
        exhibitionId={exhId}
      />

      <ArtworkDetail
        artwork={detailArtwork}
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setDetailArtwork(null);
        }}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
