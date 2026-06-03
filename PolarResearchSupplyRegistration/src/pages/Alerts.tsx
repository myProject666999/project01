import { useEffect, useState } from 'react'
import { AlertTriangle, RefreshCw, CheckCircle } from 'lucide-react'
import { useAlertStore } from '@/stores/useAlertStore'

const levelMap: Record<string, { label: string; dotCls: string; badgeCls: string }> = {
  critical: { label: '紧急', dotCls: 'bg-red-500 animate-pulse', badgeCls: 'badge-danger' },
  warning: { label: '警告', dotCls: 'bg-amber', badgeCls: 'badge-warning' },
  notice: { label: '关注', dotCls: 'bg-polar-400', badgeCls: 'badge-info' },
}

export default function Alerts() {
  const { alerts, loading, fetchAlerts, calculate, resolve } = useAlertStore()
  const [calculating, setCalculating] = useState(false)

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  const handleCalculate = async () => {
    setCalculating(true)
    try {
      await calculate()
      await fetchAlerts()
    } finally {
      setCalculating(false)
    }
  }

  const handleResolve = async (id: number) => {
    await resolve(id)
    await fetchAlerts()
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between">
        <h1 className="page-title flex items-center gap-2">
          <AlertTriangle size={24} className="text-amber" /> 库存预警
        </h1>
        <button className="btn-amber" onClick={handleCalculate} disabled={calculating}>
          <RefreshCw size={16} className={calculating ? 'animate-spin' : ''} /> {calculating ? '计算中...' : '触发预警计算'}
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="text-left px-4 py-3 w-12">等级</th>
                <th className="text-left px-4 py-3">物资名称</th>
                <th className="text-left px-4 py-3">日均消耗</th>
                <th className="text-left px-4 py-3">剩余天数</th>
                <th className="text-left px-4 py-3">状态</th>
                <th className="text-left px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-snow/30">加载中...</td></tr>
              ) : alerts.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-snow/30">暂无预警</td></tr>
              ) : (
                alerts.map((a) => {
                  const info = levelMap[a.level] || levelMap.notice
                  return (
                    <tr key={a.id} className="table-row">
                      <td className="px-4 py-3">
                        <div className={`w-3 h-3 rounded-full ${info.dotCls}`} />
                      </td>
                      <td className="px-4 py-3 text-sm text-snow font-medium">{a.supply?.name ?? '-'}</td>
                      <td className="px-4 py-3 text-sm text-snow/60">{a.dailyConsumption}</td>
                      <td className="px-4 py-3 text-sm text-snow font-bold">{a.daysRemaining ?? '-'}</td>
                      <td className="px-4 py-3">
                        {a.resolved ? (
                          <span className="badge-success">已解决</span>
                        ) : (
                          <span className={info.badgeCls}>{info.label}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {!a.resolved && (
                          <button className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center gap-1" onClick={() => handleResolve(a.id)}>
                            <CheckCircle size={14} /> 解决
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
