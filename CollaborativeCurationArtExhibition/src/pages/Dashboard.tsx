import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Image,
  Users,
  Clock,
  TrendingUp,
  Truck,
} from 'lucide-react';
import api from '@/utils/api';
import { useExhibitionStore } from '@/stores/exhibitionStore';
import StatusBadge from '@/components/StatusBadge';
import Empty from '@/components/Empty';

interface DashboardStats {
  openCount: number;
  pendingArtists: number;
  transportingArtworks: number;
  daysToOpening: number | null;
}

export default function Dashboard() {
  const { exhibitions, fetchExhibitions } = useExhibitionStore();
  const [stats, setStats] = useState<DashboardStats>({
    openCount: 0,
    pendingArtists: 0,
    transportingArtworks: 0,
    daysToOpening: null,
  });

  useEffect(() => {
    fetchExhibitions();
  }, [fetchExhibitions]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [artistRes, artworkRes] = await Promise.all([
          api.get('/artists'),
          api.get('/artworks'),
        ]);
        const artists = artistRes.data || [];
        const artworks = artworkRes.data || [];

        const openCount = exhibitions.filter((e) => e.status === 'open').length;
        const pendingArtists = artists.filter((a: any) => a.confirmStatus === 'pending').length;
        const transportingArtworks = artworks.filter(
          (a: any) => a.transportStatus === 'shipped' || a.transportStatus === 'in_transit',
        ).length;

        const upcomingExhibitions = exhibitions
          .filter((e) => e.status === 'planning' || e.status === 'preparing')
          .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

        let daysToOpening: number | null = null;
        if (upcomingExhibitions.length > 0) {
          const diff = new Date(upcomingExhibitions[0].startDate).getTime() - Date.now();
          daysToOpening = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
        }

        setStats({ openCount, pendingArtists, transportingArtworks, daysToOpening });
      } catch {
        const openCount = exhibitions.filter((e) => e.status === 'open').length;
        setStats((prev) => ({ ...prev, openCount }));
      }
    };
    if (exhibitions.length >= 0) loadStats();
  }, [exhibitions]);

  const recentExhibitions = [...exhibitions]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const statusCounts = {
    planning: exhibitions.filter((e) => e.status === 'planning').length,
    preparing: exhibitions.filter((e) => e.status === 'preparing').length,
    installing: exhibitions.filter((e) => e.status === 'installing').length,
    open: exhibitions.filter((e) => e.status === 'open').length,
    closed: exhibitions.filter((e) => e.status === 'closed').length,
    dismantling: exhibitions.filter((e) => e.status === 'dismantling').length,
  };
  const maxCount = Math.max(...Object.values(statusCounts), 1);

  const statCards = [
    { label: '开放中展览', value: stats.openCount, icon: Image, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: '待确认艺术家', value: stats.pendingArtists, icon: Users, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: '运输中作品', value: stats.transportingArtworks, icon: Truck, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: '临近开幕天数', value: stats.daysToOpening ?? '-', icon: Clock, color: 'text-gold', bg: 'bg-gold/10' },
  ];

  const todos = [
    { text: '确认参展艺术家名单', urgent: stats.pendingArtists > 0 },
    { text: '跟进作品运输进度', urgent: stats.transportingArtworks > 0 },
    { text: '确认展览场地布置方案', urgent: false },
    { text: '发送嘉宾邀请函', urgent: false },
  ];

  return (
    <div className="fade-in space-y-6">
      <div className="flex items-center gap-3">
        <LayoutDashboard size={24} className="text-gold" />
        <h1 className="font-display text-2xl font-bold text-cream">仪表盘</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="card-hover rounded-xl border border-charcoal-lighter bg-charcoal-light p-5"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg}`}>
                <card.icon size={20} className={card.color} />
              </div>
              <div>
                <p className="text-sm text-gray-400">{card.label}</p>
                <p className="text-2xl font-bold text-cream">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-charcoal-lighter bg-charcoal-light p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-cream">近期展览</h2>
            <Link to="/exhibitions" className="text-sm text-gold hover:text-gold-light">
              查看全部
            </Link>
          </div>
          {recentExhibitions.length === 0 ? (
            <Empty />
          ) : (
            <div className="space-y-3">
              {recentExhibitions.map((exhibition) => (
                <Link
                  key={exhibition.id}
                  to={`/exhibitions/${exhibition.id}`}
                  className="flex items-center justify-between rounded-lg border border-charcoal-lighter bg-charcoal px-4 py-3 transition-colors hover:border-gold/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10">
                      <Image size={18} className="text-gold" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-cream">{exhibition.name}</p>
                      <p className="text-xs text-gray-400">
                        {exhibition.venue || '未指定场馆'} · {exhibition.startDate}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={exhibition.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-charcoal-lighter bg-charcoal-light p-5">
            <h2 className="mb-4 font-display text-lg font-semibold text-cream">待办事项</h2>
            <div className="space-y-2">
              {todos.map((todo) => (
                <div
                  key={todo.text}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-charcoal"
                >
                  <div
                    className={`h-2 w-2 rounded-full ${
                      todo.urgent ? 'bg-coral' : 'bg-gold'
                    }`}
                  />
                  <span className="text-sm text-cream">{todo.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-charcoal-lighter bg-charcoal-light p-5">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-gold" />
              <h2 className="font-display text-lg font-semibold text-cream">展览状态</h2>
            </div>
            <div className="space-y-3">
              {[
                { label: '筹备中', count: statusCounts.planning, color: 'bg-blue-400' },
                { label: '准备中', count: statusCounts.preparing, color: 'bg-cyan-400' },
                { label: '布展中', count: statusCounts.installing, color: 'bg-purple-400' },
                { label: '开放中', count: statusCounts.open, color: 'bg-green-400' },
                { label: '已闭幕', count: statusCounts.closed, color: 'bg-gray-400' },
                { label: '撤展中', count: statusCounts.dismantling, color: 'bg-orange-400' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-gray-400">{item.label}</span>
                    <span className="text-cream">{item.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-charcoal">
                    <div
                      className={`h-2 rounded-full ${item.color} transition-all duration-500`}
                      style={{ width: `${(item.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
