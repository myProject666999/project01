import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ScanLine, Smile, Hand, UserCheck } from 'lucide-react';
import useGuestStore from '@/stores/guestStore';
import CheckinFeed from '@/components/CheckinFeed';

const CATEGORY_LABELS: Record<string, string> = {
  vvip: 'VVIP',
  vip: 'VIP',
  media: '媒体',
  general: '普通',
};

export default function GuestCheckin() {
  const { exhibitionId } = useParams<{ exhibitionId: string }>();
  const exId = Number(exhibitionId);
  const { guests, checkinStats, fetchByExhibition, fetchCheckinStats, checkin } = useGuestStore();

  const [activeTab, setActiveTab] = useState<'qr' | 'face' | 'manual'>('manual');
  const [qrInput, setQrInput] = useState('');

  const refreshData = useCallback(() => {
    fetchByExhibition(exId);
    fetchCheckinStats(exId);
  }, [exId, fetchByExhibition, fetchCheckinStats]);

  useEffect(() => { refreshData(); }, [refreshData]);

  useEffect(() => {
    const interval = setInterval(() => { fetchCheckinStats(exId); }, 5000);
    return () => clearInterval(interval);
  }, [exId, fetchCheckinStats]);

  const stats = checkinStats || {
    total: guests.length,
    checkedIn: guests.filter((g) => g.checkinStatus === 'checked_in').length,
    notCheckedIn: guests.filter((g) => g.checkinStatus === 'not_checked_in').length,
    rate: guests.length ? guests.filter((g) => g.checkinStatus === 'checked_in').length / guests.length : 0,
  };

  const uncheckedGuests = guests.filter((g) => g.checkinStatus === 'not_checked_in');

  const handleQrCheckin = () => {
    if (!qrInput.trim()) return;
    const guest = guests.find((g) => g.qrcodeToken === qrInput.trim());
    if (guest) {
      checkin(exId, guest.id, 'qrcode');
      setQrInput('');
    }
  };

  const handleManualCheckin = (guestId: number) => {
    checkin(exId, guestId, 'manual');
  };

  const tabs = [
    { key: 'qr' as const, label: '扫码签到', icon: <ScanLine size={16} /> },
    { key: 'face' as const, label: '扫脸签到', icon: <Smile size={16} /> },
    { key: 'manual' as const, label: '手动签到', icon: <Hand size={16} /> },
  ];

  return (
    <div className="min-h-screen p-6" style={{ background: '#1a1a2e', color: '#f5f0eb' }}>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Playfair Display', color: '#c9a96e' }}>签到管理</h1>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: '总嘉宾数', value: stats.total, color: '#f5f0eb' },
            { label: '已签到', value: stats.checkedIn, color: '#c9a96e' },
            { label: '未签到', value: stats.notCheckedIn, color: '#888' },
            { label: '签到率', value: `${Math.round(stats.rate * 100)}%`, color: '#6ec9a9' },
          ].map((s) => (
            <div key={s.label} className="rounded-lg p-4 text-center" style={{ background: '#1e1e38', border: '1px solid #2a2a4e' }}>
              <div className="text-3xl font-bold" style={{ color: s.color, fontFamily: 'Playfair Display' }}>{s.value}</div>
              <div className="text-xs mt-1" style={{ color: '#888' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="flex gap-1 mb-4 p-1 rounded-lg" style={{ background: '#16162a' }}>
              {tabs.map((tab) => (
                <button key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="flex items-center gap-2 px-4 py-2 rounded text-sm flex-1 justify-center transition-colors"
                  style={{
                    background: activeTab === tab.key ? '#c9a96e' : 'transparent',
                    color: activeTab === tab.key ? '#1a1a2e' : '#888',
                    fontWeight: activeTab === tab.key ? 600 : 400,
                  }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            <div className="rounded-lg p-6" style={{ background: '#1e1e38', border: '1px solid #2a2a4e' }}>
              {activeTab === 'qr' && (
                <div className="space-y-4">
                  <div className="w-64 h-48 rounded-lg mx-auto flex items-center justify-center" style={{ background: '#0d0d1a', border: '2px dashed #2a2a4e' }}>
                    <ScanLine size={48} style={{ color: '#333' }} />
                  </div>
                  <p className="text-center text-xs" style={{ color: '#666' }}>摄像头区域 - 请扫描嘉宾二维码</p>
                  <div className="flex gap-2 max-w-sm mx-auto">
                    <input value={qrInput} onChange={(e) => setQrInput(e.target.value)} placeholder="手动输入二维码编号"
                      onKeyDown={(e) => e.key === 'Enter' && handleQrCheckin()}
                      className="flex-1 px-3 py-2 rounded text-sm outline-none"
                      style={{ background: '#1a1a2e', border: '1px solid #2a2a4e', color: '#f5f0eb' }}
                    />
                    <button onClick={handleQrCheckin}
                      className="px-4 py-2 rounded text-sm font-medium" style={{ background: '#c9a96e', color: '#1a1a2e' }}>
                      签到
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'face' && (
                <div className="space-y-4">
                  <div className="w-64 h-48 rounded-lg mx-auto flex items-center justify-center" style={{ background: '#0d0d1a', border: '2px dashed #2a2a4e' }}>
                    <Smile size={48} style={{ color: '#333' }} />
                  </div>
                  <p className="text-center text-xs" style={{ color: '#666' }}>摄像头区域 - 人脸识别签到</p>
                </div>
              )}

              {activeTab === 'manual' && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {uncheckedGuests.length === 0 && (
                    <div className="text-center py-8 text-sm" style={{ color: '#666' }}>所有嘉宾已签到</div>
                  )}
                  {uncheckedGuests.map((guest) => (
                    <div key={guest.id} className="flex items-center justify-between px-4 py-3 rounded" style={{ background: '#1a1a2e' }}>
                      <div>
                        <div className="text-sm font-medium">{guest.name}</div>
                        <div className="text-xs" style={{ color: '#666' }}>{CATEGORY_LABELS[guest.category || 'general'] || '普通'} · {guest.organization || ''}</div>
                      </div>
                      <button onClick={() => handleManualCheckin(guest.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium" style={{ background: '#c9a96e', color: '#1a1a2e' }}>
                        <UserCheck size={14} /> 签到
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <CheckinFeed guests={guests} onCheckin={(id, method) => checkin(exId, id, method)} />
          </div>
        </div>
      </div>
    </div>
  );
}
