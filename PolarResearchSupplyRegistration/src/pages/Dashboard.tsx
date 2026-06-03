import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, AlertTriangle, FileText, ClipboardCheck, ArrowRight, Ship } from 'lucide-react'
import { dashboardApi, type DashboardStats, type Alert, type ConsumptionTrend, type Voyage } from '@/api/client'

const voyageStatusMap: Record<Voyage['status'], { label: string; cls: string }> = {
  planned: { label: '已计划', cls: 'badge-info' },
  shipping: { label: '运输中', cls: 'badge-warning' },
  arrived: { label: '已到达', cls: 'badge-success' },
  completed: { label: '已完成', cls: 'badge-info' },
}

const alertLevelMap: Record<Alert['level'], { label: string; dotCls: string; badgeCls: string }> = {
  critical: { label: '紧急', dotCls: 'bg-red-400', badgeCls: 'badge-danger' },
  warning: { label: '预警', dotCls: 'bg-amber', badgeCls: 'badge-warning' },
  notice: { label: '提醒', dotCls: 'bg-blue-400', badgeCls: 'badge-info' },
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({ totalInventory: 0, alertCount: 0, monthlyRequisitions: 0, pendingStocktaking: 0 })
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [trends, setTrends] = useState<ConsumptionTrend[]>([])
  const [voyages, setVoyages] = useState<Voyage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [s, a, t, v] = await Promise.allSettled([
          dashboardApi.stats(),
          dashboardApi.alerts(),
          dashboardApi.trends(),
          dashboardApi.recentVoyages(),
        ])
        if (s.status === 'fulfilled') setStats(s.value)
        if (a.status === 'fulfilled') setAlerts(a.value)
        if (t.status === 'fulfilled') setTrends(t.value)
        if (v.status === 'fulfilled') setVoyages(v.value)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const maxTrendVal = Math.max(...trends.map((t) => Math.max(t.inCount, t.outCount)), 1)

  const statCards = [
    { label: '库存总量', value: stats.totalInventory, icon: <Package size={24} />, color: 'text-polar-400', bg: 'bg-polar-500/10' },
    { label: '预警物资数', value: stats.alertCount, icon: <AlertTriangle size={24} />, color: 'text-amber', bg: 'bg-amber/10' },
    { label: '本月领用次数', value: stats.monthlyRequisitions, icon: <FileText size={24} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: '待盘点任务', value: stats.pendingStocktaking, icon: <ClipboardCheck size={24} />, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ]

  return (
    <div className="page-container">
      <div className="flex items-center justify-between">
        <h1 className="page-title">仪表盘</h1>
        <span className="text-sm text-snow/40">数据概览</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="stat-card">
            <div className="flex items-center justify-between">
              <span className="stat-label">{card.label}</span>
              <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center ${card.color}`}>
                {card.icon}
              </div>
            </div>
            <div className="stat-value">{loading ? '...' : card.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-snow">消耗趋势</h2>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-polar-400" />入库</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber" />出库</span>
            </div>
          </div>
          {trends.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-snow/30">暂无趋势数据</div>
          ) : (
            <div className="flex items-end gap-2 h-48">
              {trends.map((t) => (
                <div key={t.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="flex items-end gap-1 w-full">
                    <div className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-polar-400/80 rounded-t"
                        style={{ height: `${(t.inCount / maxTrendVal) * 140}px` }}
                      />
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-amber/80 rounded-t"
                        style={{ height: `${(t.outCount / maxTrendVal) * 140}px` }}
                      />
                    </div>
                  </div>
                  <span className="text-[10px] text-snow/40">{t.month}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-snow">预警摘要</h2>
            <Link to="/alerts" className="text-xs text-polar-400 hover:text-polar-300 flex items-center gap-1">
              查看全部 <ArrowRight size={12} />
            </Link>
          </div>
          {alerts.length === 0 ? (
            <div className="py-8 text-center text-snow/30">暂无预警</div>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 5).map((a) => {
                const levelInfo = alertLevelMap[a.level]
                return (
                  <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg bg-dark-500/50">
                    <div className={`w-2 h-2 rounded-full ${levelInfo.dotCls}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-snow truncate">{a.supply?.name ?? '未知物资'}</div>
                      <div className="text-xs text-snow/40">剩余 {a.daysRemaining ?? '-'} 天</div>
                    </div>
                    <span className={levelInfo.badgeCls}>{levelInfo.label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-snow">近期航次</h2>
          <Link to="/voyages" className="text-xs text-polar-400 hover:text-polar-300 flex items-center gap-1">
            查看全部 <ArrowRight size={12} />
          </Link>
        </div>
        {voyages.length === 0 ? (
          <div className="py-8 text-center text-snow/30">暂无航次数据</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {voyages.map((v) => {
              const statusInfo = voyageStatusMap[v.status]
              return (
                <Link key={v.id} to={`/voyages/${v.id}`} className="p-4 rounded-lg bg-dark-500/50 border border-polar-500/10 hover:border-polar-500/30 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <Ship size={18} className="text-polar-400" />
                    <span className="font-medium text-snow text-sm">{v.voyageNo}</span>
                  </div>
                  <div className="space-y-1 text-xs text-snow/40">
                    <div>船名: {v.shipName ?? '-'}</div>
                    <div>到达日期: {v.arrivalDate}</div>
                  </div>
                  <div className="mt-2">
                    <span className={statusInfo?.cls || 'badge-info'}>{statusInfo?.label || v.status}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
