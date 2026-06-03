import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ClipboardCheck } from 'lucide-react'
import { useStocktakingStore } from '@/stores/useStocktakingStore'
import { useBaseDataStore } from '@/stores/useBaseDataStore'

const statusMap: Record<string, { label: string; cls: string }> = {
  pending: { label: '待盘点', cls: 'badge-info' },
  in_progress: { label: '进行中', cls: 'badge-warning' },
  completed: { label: '已完成', cls: 'badge-success' },
  approved: { label: '已审批', cls: 'badge-info' },
}

const scopeTypeMap: Record<string, string> = {
  all: '全部',
  warehouse: '仓库',
  category: '分类',
}

const scopeTypeOptions = [
  { value: 'all', label: '全部' },
  { value: 'warehouse', label: '按仓库' },
  { value: 'category', label: '按分类' },
]

const emptyForm = { scopeType: 'all', scopeId: 0, createdBy: 0 }

export default function Stocktaking() {
  const { list, loading, fetchList, create } = useStocktakingStore()
  const { warehouses, categories, members, fetchWarehouses, fetchCategories, fetchMembers } = useBaseDataStore()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    fetchWarehouses()
    fetchCategories()
    fetchMembers()
  }, [fetchWarehouses, fetchCategories, fetchMembers])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  const getScopeName = (scopeType: string, scopeId: number | null) => {
    if (scopeType === 'all') return '全部'
    if (scopeType === 'warehouse') return warehouses.find((w) => w.id === scopeId)?.name ?? `仓库#${scopeId}`
    if (scopeType === 'category') return categories.find((c) => c.id === scopeId)?.name ?? `分类#${scopeId}`
    return '-'
  }

  const handleCreate = async () => {
    const data: { scopeType?: string; scopeId?: number; createdBy: number } = {
      scopeType: form.scopeType === 'all' ? undefined : form.scopeType,
      scopeId: form.scopeType === 'all' ? undefined : form.scopeId || undefined,
      createdBy: form.createdBy,
    }
    await create(data)
    setShowModal(false)
    setForm(emptyForm)
    fetchList()
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between">
        <h1 className="page-title flex items-center gap-2"><ClipboardCheck size={24} className="text-polar-400" /> 盘点管理</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> 新建盘点
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="text-left px-4 py-3">盘点单号</th>
                <th className="text-left px-4 py-3">盘点范围</th>
                <th className="text-left px-4 py-3">状态</th>
                <th className="text-left px-4 py-3">创建时间</th>
                <th className="text-left px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-snow/30">加载中...</td></tr>
              ) : list.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-snow/30">暂无盘点数据</td></tr>
              ) : (
                list.map((s) => (
                  <tr key={s.id} className="table-row">
                    <td className="px-4 py-3 text-sm text-polar-400 font-medium">{s.taskNo}</td>
                    <td className="px-4 py-3 text-sm text-snow/60">
                      {scopeTypeMap[s.scopeType] ?? s.scopeType}
                      {s.scopeType !== 'all' && s.scopeId ? ` - ${getScopeName(s.scopeType, s.scopeId)}` : ''}
                    </td>
                    <td className="px-4 py-3"><span className={statusMap[s.status]?.cls || 'badge-info'}>{statusMap[s.status]?.label || s.status}</span></td>
                    <td className="px-4 py-3 text-sm text-snow/60">{s.createdAt?.slice(0, 10) ?? '-'}</td>
                    <td className="px-4 py-3">
                      <Link to={`/stocktaking/${s.id}`} className="text-polar-400 hover:text-polar-300 text-sm">
                        {s.status === 'completed' || s.status === 'approved' ? '查看' : '执行'}
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-polar-500/10">
              <h2 className="text-lg font-semibold text-snow">新建盘点</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-snow/60 mb-1">盘点范围</label>
                <select className="select-field" value={form.scopeType} onChange={(e) => setForm({ ...form, scopeType: e.target.value, scopeId: 0 })}>
                  {scopeTypeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              {form.scopeType === 'warehouse' && (
                <div>
                  <label className="block text-sm text-snow/60 mb-1">选择仓库</label>
                  <select className="select-field" value={form.scopeId} onChange={(e) => setForm({ ...form, scopeId: Number(e.target.value) })}>
                    <option value={0}>选择仓库</option>
                    {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
              )}
              {form.scopeType === 'category' && (
                <div>
                  <label className="block text-sm text-snow/60 mb-1">选择分类</label>
                  <select className="select-field" value={form.scopeId} onChange={(e) => setForm({ ...form, scopeId: Number(e.target.value) })}>
                    <option value={0}>选择分类</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm text-snow/60 mb-1">创建人</label>
                <select className="select-field" value={form.createdBy} onChange={(e) => setForm({ ...form, createdBy: Number(e.target.value) })}>
                  <option value={0}>选择创建人</option>
                  {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
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
