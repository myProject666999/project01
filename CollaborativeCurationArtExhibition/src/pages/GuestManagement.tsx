import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Search, QrCode, ClipboardCheck, Trash2, Edit2 } from 'lucide-react';
import useGuestStore from '@/stores/guestStore';
import GuestForm from '@/components/GuestForm';
import QRCodeModal from '@/components/QRCodeModal';
import type { Guest, GuestCategory } from '@/stores/guestStore';

const CATEGORY_STYLES: Record<string, { bg: string; color: string }> = {
  vvip: { bg: '#c9a96e22', color: '#c9a96e' },
  vip: { bg: '#c9a96e15', color: '#d4b87a' },
  media: { bg: '#6ea9c922', color: '#6ea9c9' },
  general: { bg: '#88888822', color: '#888' },
};

const CATEGORY_LABELS: Record<string, string> = {
  vvip: 'VVIP',
  vip: 'VIP',
  media: '媒体',
  general: '普通',
};

const INVITE_STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  pending: { bg: '#88888822', color: '#888' },
  sent: { bg: '#6ea9c922', color: '#6ea9c9' },
  accepted: { bg: '#6ec9a922', color: '#6ec9a9' },
  declined: { bg: '#c96e6e22', color: '#c96e6e' },
};

const INVITE_STATUS_LABELS: Record<string, string> = {
  pending: '待发送',
  sent: '已发送',
  accepted: '已接受',
  declined: '已拒绝',
};

export default function GuestManagement() {
  const { exhibitionId } = useParams<{ exhibitionId: string }>();
  const exId = Number(exhibitionId);
  const navigate = useNavigate();
  const { guests, fetchByExhibition, delete: deleteGuest } = useGuestStore();

  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editGuest, setEditGuest] = useState<Guest | null>(null);
  const [qrGuest, setQrGuest] = useState<Guest | null>(null);

  useEffect(() => { fetchByExhibition(exId); }, [exId, fetchByExhibition]);

  const filtered = guests.filter((g) => {
    const matchSearch = !search || g.name.includes(search) || (g.organization || '').includes(search);
    const matchCat = !filterCat || g.category === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen p-6" style={{ background: '#1a1a2e', color: '#f5f0eb' }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display', color: '#c9a96e' }}>嘉宾管理</h1>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(`/exhibition/${exId}/checkin`)}
              className="flex items-center gap-2 px-4 py-2 rounded text-sm" style={{ border: '1px solid #c9a96e', color: '#c9a96e' }}>
              <ClipboardCheck size={16} /> 签到管理
            </button>
            <button onClick={() => { setEditGuest(null); setFormOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium" style={{ background: '#c9a96e', color: '#1a1a2e' }}>
              <Plus size={16} /> 添加嘉宾
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded" style={{ background: '#1e1e38', border: '1px solid #2a2a4e' }}>
            <Search size={14} style={{ color: '#666' }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索姓名或机构..."
              className="flex-1 bg-transparent text-sm outline-none" style={{ color: '#f5f0eb' }} />
          </div>
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
            className="px-3 py-2 rounded text-sm outline-none" style={{ background: '#1e1e38', border: '1px solid #2a2a4e', color: '#f5f0eb' }}>
            <option value="">全部类别</option>
            <option value="vvip">VVIP</option>
            <option value="vip">VIP</option>
            <option value="media">媒体</option>
            <option value="general">普通</option>
          </select>
        </div>

        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #2a2a4e' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#16162a' }}>
                <th className="text-left px-4 py-3 font-medium" style={{ color: '#888' }}>姓名</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: '#888' }}>类别</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: '#888' }}>机构</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: '#888' }}>邀请状态</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: '#888' }}>签到状态</th>
                <th className="text-right px-4 py-3 font-medium" style={{ color: '#888' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((guest) => {
                const catStyle = CATEGORY_STYLES[guest.category || 'general'] || CATEGORY_STYLES['general'];
                const inviteStyle = INVITE_STATUS_STYLES[guest.inviteStatus] || INVITE_STATUS_STYLES['pending'];
                return (
                  <tr key={guest.id} className="border-t" style={{ borderColor: '#2a2a4e' }}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{guest.name}</div>
                      <div className="text-xs" style={{ color: '#666' }}>{guest.phone || guest.email || ''}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-xs" style={{ background: catStyle.bg, color: catStyle.color }}>
                        {CATEGORY_LABELS[guest.category || 'general'] || guest.category}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: '#aaa' }}>{guest.organization || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-xs" style={{ background: inviteStyle.bg, color: inviteStyle.color }}>
                        {INVITE_STATUS_LABELS[guest.inviteStatus] || guest.inviteStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {guest.checkinStatus === 'checked_in'
                        ? <span className="px-2 py-0.5 rounded text-xs" style={{ background: '#c9a96e22', color: '#c9a96e' }}>已签到</span>
                        : <span className="px-2 py-0.5 rounded text-xs" style={{ background: '#88888822', color: '#888' }}>未签到</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setQrGuest(guest)} className="p-1.5 rounded hover:bg-white/10"><QrCode size={14} style={{ color: '#c9a96e' }} /></button>
                        <button onClick={() => { setEditGuest(guest); setFormOpen(true); }} className="p-1.5 rounded hover:bg-white/10"><Edit2 size={14} style={{ color: '#888' }} /></button>
                        <button onClick={() => deleteGuest(exId, guest.id)} className="p-1.5 rounded hover:bg-white/10"><Trash2 size={14} style={{ color: '#8a4a4a' }} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8" style={{ color: '#666' }}>暂无嘉宾数据</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <GuestForm open={formOpen} onClose={() => setFormOpen(false)}
        onSubmit={(data) => { useGuestStore.getState().create(exId, data); }}
        initial={editGuest}
      />
      <QRCodeModal open={!!qrGuest} onClose={() => setQrGuest(null)} guest={qrGuest} />
    </div>
  );
}
