import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Save, CheckCircle, ShieldCheck } from 'lucide-react'
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

export default function StocktakingDetail() {
  const { id } = useParams<{ id: string }>()
  const { current, items, fetchStocktaking, updateItem, complete, approve } = useStocktakingStore()
  const { members, fetchMembers } = useBaseDataStore()
  const [editValues, setEditValues] = useState<Record<number, number>>({})
  const [approveBy, setApproveBy] = useState(0)

  const stocktakingId = Number(id)

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  useEffect(() => {
    if (stocktakingId) {
      fetchStocktaking(stocktakingId)
    }
  }, [stocktakingId, fetchStocktaking])

  const handleActualChange = (itemId: number, value: number) => {
    setEditValues({ ...editValues, [itemId]: value })
  }

  const handleSaveItem = async (itemId: number) => {
    const actualQuantity = editValues[itemId]
    if (actualQuantity === undefined || !stocktakingId) return
    await updateItem(stocktakingId, itemId, { actualQuantity })
    fetchStocktaking(stocktakingId)
    setEditValues((prev) => { const next = { ...prev }; delete next[itemId]; return next })
  }

  const handleComplete = async () => {
    if (!stocktakingId) return
    await complete(stocktakingId)
    fetchStocktaking(stocktakingId)
  }

  const handleApprove = async () => {
    if (!stocktakingId || !approveBy) return
    await approve(stocktakingId, { approvedBy: approveBy })
    fetchStocktaking(stocktakingId)
  }

  if (!current) {
    return <div className="page-container"><div className="text-center py-20 text-snow/30">加载中...</div></div>
  }

  const isCompleted = current.status === 'completed'
  const isApproved = current.status === 'approved'
  const isEditable = !isCompleted && !isApproved

  return (
    <div className="page-container">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/stocktaking" className="text-polar-400 hover:text-polar-300"><ArrowLeft size={20} /></Link>
          <h1 className="page-title">盘点执行 - {current.taskNo}</h1>
          <span className={statusMap[current.status]?.cls || 'badge-info'}>{statusMap[current.status]?.label || current.status}</span>
        </div>
        <div className="flex items-center gap-3">
          {isEditable && (
            <button className="btn-primary" onClick={handleComplete}>
              <CheckCircle size={16} /> 完成盘点
            </button>
          )}
          {isCompleted && (
            <div className="flex items-center gap-2">
              <select className="select-field w-auto" value={approveBy} onChange={(e) => setApproveBy(Number(e.target.value))}>
                <option value={0}>选择审批人</option>
                {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <button className="btn-primary" onClick={handleApprove} disabled={!approveBy}>
                <ShieldCheck size={16} /> 审批
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><span className="text-xs text-snow/40">盘点范围</span><div className="text-sm text-snow mt-1">{scopeTypeMap[current.scopeType] ?? current.scopeType}</div></div>
          <div><span className="text-xs text-snow/40">状态</span><div className="text-sm text-snow mt-1">{statusMap[current.status]?.label ?? current.status}</div></div>
          <div><span className="text-xs text-snow/40">创建时间</span><div className="text-sm text-snow mt-1">{current.createdAt?.slice(0, 10) ?? '-'}</div></div>
          <div><span className="text-xs text-snow/40">完成时间</span><div className="text-sm text-snow mt-1">{current.completedAt?.slice(0, 10) ?? '-'}</div></div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-snow mb-4">盘点明细</h2>
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="text-left px-4 py-3">物资名称</th>
                <th className="text-left px-4 py-3">仓库</th>
                <th className="text-center px-4 py-3 bg-dark-500/50">账面数量</th>
                <th className="text-center px-4 py-3 bg-polar-500/10">实盘数量</th>
                <th className="text-center px-4 py-3">差异</th>
                <th className="text-left px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-snow/30">暂无盘点物资</td></tr>
              ) : (
                items.map((item) => {
                  const actualQty = editValues[item.id] ?? item.actualQuantity
                  const difference = actualQty !== undefined && actualQty !== null
                    ? actualQty - item.bookQuantity
                    : item.difference
                  return (
                    <tr key={item.id} className="table-row">
                      <td className="px-4 py-3 text-sm text-snow font-medium">{item.inventoryItem?.supply?.name ?? '-'}</td>
                      <td className="px-4 py-3 text-sm text-snow/60">{item.inventoryItem?.warehouse?.name ?? '-'}</td>
                      <td className="px-4 py-3 text-center text-sm text-snow bg-dark-500/30">{item.bookQuantity}</td>
                      <td className="px-4 py-3 text-center bg-polar-500/5">
                        {isEditable ? (
                          <input
                            type="number"
                            className="input-field w-20 py-1 text-center text-sm mx-auto"
                            value={actualQty ?? ''}
                            onChange={(e) => handleActualChange(item.id, Number(e.target.value))}
                          />
                        ) : (
                          <span className="text-sm text-snow">{item.actualQuantity ?? '-'}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        <span className={difference !== null && difference !== 0 ? (difference > 0 ? 'text-emerald-400' : 'text-red-400') : 'text-snow/40'}>
                          {difference !== null && difference !== undefined ? (difference > 0 ? `+${difference}` : difference) : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isEditable && editValues[item.id] !== undefined && (
                          <button className="text-polar-400 hover:text-polar-300 text-sm flex items-center gap-1" onClick={() => handleSaveItem(item.id)}>
                            <Save size={14} /> 保存
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
