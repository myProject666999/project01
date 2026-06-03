import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Ship, Filter } from 'lucide-react'
import { useVoyageStore } from '@/stores/useVoyageStore'
import type { Voyage } from '@/api/client'

const statusMap: Record<Voyage['status'], { label: string; cls: string }> = {
  planned: { label: '已计划', cls: 'badge-info' },
  shipping: { label: '运输中', cls: 'badge-warning' },
  arrived: { label: '已到达', cls: 'badge-success' },
  completed: { label: '已完成', cls: 'badge-info' },
}

const statusOptions = [
  { value: '', label: '全部状态' },
  { value: 'planned', label: '已计划' },
  { value: 'shipping', label: '运输中' },
  { value: 'arrived', label: '已到达' },
  { value: 'completed', label: '已完成' },
]

const emptyForm = { voyageNo: '', shipName: '', arrivalDate: '', description: '' }

export default function Voyages() {
  const { voyages, loading, fetchVoyages, createVoyage } = useVoyageStore()
  const [status, setStatus] = useState('')
  const [keyword, setKeyword] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    fetchVoyages()
  }, [fetchVoyages])

  const filteredVoyages = voyages.filter((v) => {
    if (status && v.status !== status) return false
    if (keyword) {
      const kw = keyword.toLowerCase()
      return (
        v.voyageNo.toLowerCase().includes(kw) ||
        (v.shipName ?? '').toLowerCase().includes(kw)
      )
    }
    return true
  })

  const handleCreate = async () => {
    await createVoyage({ ...form, status: 'planned' })
    setShowModal(false)
    setForm(emptyForm)
    fetchVoyages()
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between">
        <h1 className="page-title">补给航次</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> 新建航次
        </button>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-snow/30" />
            <input
              type="text"
              placeholder="搜索航次编号/船名..."
              className="input-field pl-9"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-snow/30" />
            <select className="select-field w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
              {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="text-left px-4 py-3">航次编号</th>
                <th className="text-left px-4 py-3">船名</th>
                <th className="text-left px-4 py-3">到达日期</th>
                <th className="text-left px-4 py-3">状态</th>
                <th className="text-left px-4 py-3">物资数</th>
                <th className="text-left px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-snow/30">加载中...</td></tr>
              ) : filteredVoyages.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-snow/30">暂无航次数据</td></tr>
              ) : (
                filteredVoyages.map((v) => (
                  <tr key={v.id} className="table-row">
                    <td className="px-4 py-3">
                      <Link to={`/voyages/${v.id}`} className="text-polar-400 hover:text-polar-300 font-medium">{v.voyageNo}</Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-snow/60">{v.shipName ?? '-'}</td>
                    <td className="px-4 py-3 text-sm text-snow/60">{v.arrivalDate}</td>
                    <td className="px-4 py-3"><span className={statusMap[v.status]?.cls || 'badge-info'}>{statusMap[v.status]?.label || v.status}</span></td>
                    <td className="px-4 py-3 text-sm text-snow/60">{v.voyageSupplies?.length ?? 0}</td>
                    <td className="px-4 py-3">
                      <Link to={`/voyages/${v.id}`} className="text-polar-400 hover:text-polar-300 text-sm">详情</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4 text-sm text-snow/40">
          <span>共 {filteredVoyages.length} 条</span>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-polar-500/10">
              <h2 className="text-lg font-semibold text-snow">新建航次</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-snow/60 mb-1">航次编号</label>
                <input className="input-field" placeholder="如: VOY-2026-001" value={form.voyageNo} onChange={(e) => setForm({ ...form, voyageNo: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-snow/60 mb-1">船名</label>
                <input className="input-field" placeholder="如: 雪龙号" value={form.shipName} onChange={(e) => setForm({ ...form, shipName: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-snow/60 mb-1">到达日期</label>
                <input type="date" className="input-field" value={form.arrivalDate} onChange={(e) => setForm({ ...form, arrivalDate: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-snow/60 mb-1">备注</label>
                <textarea className="input-field" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
            <div className="p-6 border-t border-polar-500/10 flex justify-end gap-3">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>取消</button>
              <button className="btn-primary" onClick={handleCreate}>创建</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
