import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, UserPlus, Check, ArrowRightLeft, LogOut, Mail, Phone, Edit2, Trash2 } from 'lucide-react';
import { useArtistStore } from '@/stores/artistStore';
import ArtistForm from '@/components/ArtistForm';
import WithdrawDialog from '@/components/WithdrawDialog';
import ReplaceDialog from '@/components/ReplaceDialog';
import type { Artist } from '@/stores/artistStore';

const STATUS_MAP: Record<Artist['confirmStatus'], { label: string; cls: string }> = {
  pending: { label: '待确认', cls: 'bg-amber-500/20 text-amber-400' },
  confirmed: { label: '已确认', cls: 'bg-emerald-500/20 text-emerald-400' },
  withdrawn: { label: '已撤展', cls: 'bg-red-500/20 text-red-400' },
};

export default function ArtistManagement() {
  const { exhibitionId } = useParams<{ exhibitionId: string }>();
  const navigate = useNavigate();
  const { artists, loading, fetchByExhibition, create, update, delete: remove, confirm, withdraw, replace, setCurrentArtist, currentArtist } = useArtistStore();

  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawTarget, setWithdrawTarget] = useState<Artist | null>(null);
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [replaceTarget, setReplaceTarget] = useState<Artist | null>(null);

  const exhId = parseInt(exhibitionId || '0', 10);

  const loadData = useCallback(() => {
    if (exhId) fetchByExhibition(exhId);
  }, [exhId, fetchByExhibition]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = artists.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase()) ||
      a.phone?.includes(search),
  );

  const handleCreate = async (data: Partial<Artist>) => {
    await create(exhId, data);
    setFormOpen(false);
  };

  const handleUpdate = async (data: Partial<Artist>) => {
    if (editingArtist) {
      await update(exhId, editingArtist.id, data);
      setFormOpen(false);
      setEditingArtist(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('确定删除该艺术家吗？')) {
      await remove(exhId, id);
    }
  };

  const handleConfirm = async (id: number) => {
    await confirm(exhId, id);
  };

  const handleWithdraw = async (reason: string) => {
    if (withdrawTarget) {
      await withdraw(exhId, withdrawTarget.id, reason);
      setWithdrawOpen(false);
      setWithdrawTarget(null);
    }
  };

  const handleReplace = async (data: Record<string, string>) => {
    if (replaceTarget) {
      await replace(exhId, replaceTarget.id, data);
      setReplaceOpen(false);
      setReplaceTarget(null);
    }
  };

  const openEdit = (artist: Artist) => {
    setEditingArtist(artist);
    setCurrentArtist(artist);
    setFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-charcoal font-body">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl text-cream">艺术家管理</h1>
            <p className="text-cream-muted text-sm mt-1">共 {artists.length} 位艺术家</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/exhibitions/${exhId}/artworks`)}
              className="px-4 py-2 text-cream-muted hover:text-cream border border-charcoal-border rounded-lg transition-colors text-sm"
            >
              作品管理
            </button>
            <button
              onClick={() => {
                setEditingArtist(null);
                setCurrentArtist(null);
                setFormOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gold text-charcoal font-medium rounded-lg hover:bg-gold-light transition-colors"
            >
              <UserPlus size={18} />
              邀请艺术家
            </button>
          </div>
        </div>

        <div className="relative mb-6">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索艺术家姓名、邮箱、电话..."
            className="w-full pl-10 pr-4 py-2.5 bg-charcoal-light border border-charcoal-border rounded-lg text-cream placeholder:text-cream-muted/50 focus:outline-none focus:border-gold transition-colors"
          />
        </div>

        {loading && !artists.length ? (
          <div className="text-center py-20 text-cream-muted">加载中...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-cream-muted">
            {search ? '未找到匹配的艺术家' : '暂无艺术家，点击上方按钮邀请'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((artist) => {
              const statusInfo = STATUS_MAP[artist.confirmStatus];
              return (
                <div
                  key={artist.id}
                  className="bg-charcoal-light border border-charcoal-border rounded-xl p-5 hover:border-gold/30 transition-colors group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-charcoal-lighter border border-charcoal-border flex items-center justify-center text-gold font-heading text-lg shrink-0 overflow-hidden">
                      {artist.avatar ? (
                        <img src={artist.avatar} alt={artist.name} className="w-full h-full object-cover" />
                      ) : (
                        artist.name.charAt(0)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-cream font-medium truncate">{artist.name}</h3>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${statusInfo.cls}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {artist.phone && (
                          <div className="flex items-center gap-2 text-cream-muted text-sm">
                            <Phone size={14} />
                            <span className="truncate">{artist.phone}</span>
                          </div>
                        )}
                        {artist.email && (
                          <div className="flex items-center gap-2 text-cream-muted text-sm">
                            <Mail size={14} />
                            <span className="truncate">{artist.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-charcoal-border">
                    <button
                      onClick={() => openEdit(artist)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-cream-muted hover:text-cream hover:bg-charcoal-lighter rounded-lg transition-colors"
                    >
                      <Edit2 size={13} /> 编辑
                    </button>
                    {artist.confirmStatus === 'pending' && (
                      <button
                        onClick={() => handleConfirm(artist.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                      >
                        <Check size={13} /> 确认
                      </button>
                    )}
                    {artist.confirmStatus !== 'withdrawn' && (
                      <>
                        <button
                          onClick={() => {
                            setWithdrawTarget(artist);
                            setWithdrawOpen(true);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <LogOut size={13} /> 撤展
                        </button>
                        <button
                          onClick={() => {
                            setReplaceTarget(artist);
                            setReplaceOpen(true);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-gold hover:bg-gold/10 rounded-lg transition-colors"
                        >
                          <ArrowRightLeft size={13} /> 替换
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(artist.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-cream-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-auto"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ArtistForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingArtist(null);
          setCurrentArtist(null);
        }}
        onSubmit={editingArtist ? handleUpdate : handleCreate}
        initial={editingArtist || currentArtist}
      />

      <WithdrawDialog
        open={withdrawOpen}
        onClose={() => {
          setWithdrawOpen(false);
          setWithdrawTarget(null);
        }}
        onConfirm={handleWithdraw}
        artistName={withdrawTarget?.name || ''}
      />

      <ReplaceDialog
        open={replaceOpen}
        onClose={() => {
          setReplaceOpen(false);
          setReplaceTarget(null);
        }}
        onConfirm={handleReplace}
        originalArtist={replaceTarget}
      />
    </div>
  );
}
