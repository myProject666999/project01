import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wine, TrendingUp, Bell, Package, Plus, ArrowRight } from 'lucide-react';
import { useWineStore } from '@/stores/wineStore';
import { useAlertStore } from '@/stores/alertStore';
import { useValuationStore } from '@/stores/valuationStore';

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
  link: string;
}

export default function Dashboard() {
  const { wines, fetchWines } = useWineStore();
  const { alerts, fetchAlerts } = useAlertStore();
  const { summary, fetchSummary } = useValuationStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fetchWines();
    fetchAlerts();
    fetchSummary();
    setMounted(true);
  }, []);

  const totalBottles = wines.reduce((sum, w) => sum + (w.bottleCount ?? 0), 0);

  const stats: StatCard[] = [
    {
      label: '总瓶数',
      value: totalBottles,
      icon: <Package className="w-6 h-6" />,
      gradient: 'from-burgundy/40 to-cellar-mid',
      link: '/cellar',
    },
    {
      label: '酒窖估值',
      value: `¥${summary?.totalMarketValue?.toLocaleString() ?? '...'}`,
      icon: <TrendingUp className="w-6 h-6" />,
      gradient: 'from-gold/30 to-cellar-mid',
      link: '/valuation',
    },
    {
      label: '活跃提醒',
      value: alerts.filter((a) => a.urgency !== 'safe').length,
      icon: <Bell className="w-6 h-6" />,
      gradient: 'from-amber-800/40 to-cellar-mid',
      link: '/alerts',
    },
    {
      label: '酒款目录',
      value: wines.length,
      icon: <Wine className="w-6 h-6" />,
      gradient: 'from-purple-900/40 to-cellar-mid',
      link: '/wines',
    },
  ];

  const recentWines = wines.slice(-5).reverse();

  return (
    <div className={`space-y-8 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <div>
        <h1 className="font-display text-3xl text-gold text-shadow-gold">仪表盘</h1>
        <p className="text-gray-400 font-body mt-1">欢迎来到您的酒窖</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.link}
            className={`bg-gradient-to-br ${stat.gradient} rounded-xl p-6 border border-gold/10 hover:border-gold/30 transition-all duration-300 hover:shadow-lg hover:shadow-gold/5 group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-gold/70 group-hover:text-gold transition-colors">
                {stat.icon}
              </div>
              <ArrowRight className="w-4 h-4 text-gold/30 group-hover:text-gold/70 transition-all group-hover:translate-x-1" />
            </div>
            <p className="text-2xl font-display font-bold text-white">{stat.value}</p>
            <p className="text-sm text-gray-400 font-body mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl text-gold">最近入库</h2>
            <Link
              to="/wines"
              className="text-sm text-gold/60 hover:text-gold font-body transition-colors flex items-center gap-1"
            >
              查看全部 <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recentWines.length === 0 ? (
            <p className="text-gray-500 font-body text-sm">暂无酒款，添加您的第一瓶酒！</p>
          ) : (
            <div className="space-y-3">
              {recentWines.map((wine) => (
                <Link
                  key={wine.id}
                  to={`/wines/${wine.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-cellar-dark/50 hover:bg-burgundy/20 transition-colors group"
                >
                  <div>
                    <p className="font-display text-sm text-white group-hover:text-gold transition-colors">
                      {wine.chateau}
                    </p>
                    <p className="text-xs text-gray-500 font-body">
                      {wine.vintage} · {wine.region}
                    </p>
                  </div>
                  <span className="text-xs bg-burgundy/30 text-gold/80 px-2 py-1 rounded-full font-body">
                    {wine.bottleCount ?? 0} 瓶
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="glass-effect rounded-xl p-6">
          <h2 className="font-display text-xl text-gold mb-6">快捷操作</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/wines/new"
              className="flex flex-col items-center gap-2 p-4 rounded-lg bg-burgundy/20 hover:bg-burgundy/30 border border-burgundy/30 hover:border-gold/30 transition-all group"
            >
              <Plus className="w-6 h-6 text-gold/60 group-hover:text-gold transition-colors" />
              <span className="text-sm text-gray-300 font-body group-hover:text-gold transition-colors">
                添加酒款
              </span>
            </Link>
            <Link
              to="/cellar/stock-in"
              className="flex flex-col items-center gap-2 p-4 rounded-lg bg-burgundy/20 hover:bg-burgundy/30 border border-burgundy/30 hover:border-gold/30 transition-all group"
            >
              <Package className="w-6 h-6 text-gold/60 group-hover:text-gold transition-colors" />
              <span className="text-sm text-gray-300 font-body group-hover:text-gold transition-colors">
                入库
              </span>
            </Link>
            <Link
              to="/tasting/new"
              className="flex flex-col items-center gap-2 p-4 rounded-lg bg-burgundy/20 hover:bg-burgundy/30 border border-burgundy/30 hover:border-gold/30 transition-all group"
            >
              <Wine className="w-6 h-6 text-gold/60 group-hover:text-gold transition-colors" />
              <span className="text-sm text-gray-300 font-body group-hover:text-gold transition-colors">
                新增品鉴
              </span>
            </Link>
            <Link
              to="/alerts"
              className="flex flex-col items-center gap-2 p-4 rounded-lg bg-burgundy/20 hover:bg-burgundy/30 border border-burgundy/30 hover:border-gold/30 transition-all group"
            >
              <Bell className="w-6 h-6 text-gold/60 group-hover:text-gold transition-colors" />
              <span className="text-sm text-gray-300 font-body group-hover:text-gold transition-colors">
                查看提醒
              </span>
            </Link>
          </div>
        </div>
      </div>

      {alerts.filter((a) => a.urgency === 'overdue' || a.urgency === 'urgent').length > 0 && (
        <div className="glass-effect rounded-xl p-6 border-l-4 border-red-500">
          <h2 className="font-display text-xl text-red-400 mb-3">紧急提醒</h2>
          <div className="space-y-2">
            {alerts
              .filter((a) => a.urgency === 'overdue' || a.urgency === 'urgent')
              .slice(0, 3)
              .map((alert) => (
                <Link
                  key={alert.id}
                  to={`/wines/${alert.wineId}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-red-900/20 hover:bg-red-900/30 transition-colors"
                >
                  <div>
                    <p className="font-display text-sm text-white">
                      {alert.chateau} {alert.vintage}
                    </p>
                    <p className="text-xs text-gray-400 font-body">
                      {alert.urgency === 'overdue'
                        ? '已过适饮期'
                        : `${alert.remainingYears} 年后到期`}
                    </p>
                  </div>
                  <span className="text-xs text-red-400 font-body font-medium">
                    {alert.bottleCount} 瓶
                  </span>
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
