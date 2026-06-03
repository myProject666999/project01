import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Package, Truck } from 'lucide-react'
import { useVoyageStore } from '@/stores/useVoyageStore'
import { useBaseDataStore } from '@/stores/useBaseDataStore'
import type { Voyage, VoyageSupply } from '@/api/client'

const voyageStatusMap: Record<Voyage['status'], { label: string; cls: string }> = {
  planned: { label: '已计划', cls: 'badge-info' },
  shipping: { label: '运输中', cls: 'badge-warning' },
  arrived: { label: '已到达', cls: 'badge-success' },
  completed: { label: '已完成', cls: 'badge-info' },
}

const supplyStatusMap: Record<VoyageSupply['status'], { label: string; cls: string }> = {
  pending: { label: '待入库', cls: 'badge-warning' },
  stocked_in: { label: '已入库', cls: 'badge-success' },
}

export default function VoyageDetail() {
  const { id } = useParams<{ id: string }>()
  const { current, supplies, loading, fetchVoyage, addSupplies, stockIn } = useVoyageStore()
  const { supplies: supplyList, warehouses, fetchSupplies, fetchWarehouses } = useBaseDataStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForms, setAddForms] = useState([{ supplyId: 0, targetWarehouseId: 0, quantity: 0 }])
  const [stockInItems, setStockInItems] = useState<Record<number, number>>({})

  const voyageId = Number(id)

  useEffect(() => {
    if (voyageId) {
      fetchVoyage(voyageId)
    }
  }, [voyageId, fetchVoyage])

  useEffect(() => {
    fetchSupplies()
    fetchWarehouses()
  }, [fetchSupplies, fetchWarehouses])

  const handleAddSupplies = async () => {
    if (!voyageId) return
    const filtered = addForms.filter((f) => f.supplyId && f.targetWarehouseId && f.quantity > 0)
    if (filtered.length === 0) return
    await addSupplies(voyageId, { supplies: filtered })
    setShowAddModal(false)
    setAddForms([{ supplyId: 0, targetWarehouseId: 0, quantity: 0 }])
    fetchVoyage(voyageId)
  }

  const handleStockIn = async () => {
    if (!voyageId) return
    const items = supplies
      .filter((s) => s.status === 'pending')
      .map((s) => ({
        voyageSupplyId: s.id,
        actualQuantity: stockInItems[s.id] ?? s.quantity,
      }))
    if (items.length === 0) return
    await stockIn(voyageId, { items })
    setStockInItems({})
    fetchVoyage(voyageId)
  }

  const handleSingleStockIn = async (vs: VoyageSupply) => {
    if (!voyageId) return
    await stockIn(voyageId, {
      items: [{ voyageSupplyId: vs.id, actualQuantity: stockInItems[vs.id] ?? vs.quantity }],
    })
    setStockInItems((prev) => {
      const next = { ...prev }
      delete next[vs.id]
      return next
    })
    fetchVoyage(voyageId)
  }

  if (!current) {
    return <div className="page-container"><div className="text-center py-20 text-snow/30">加载中...</div></div>
  }

  const statusInfo = voyageStatusMap[current.status]
  const pendingSupplies = supplies.filter((s) => s.status === 'pending')

  return (
    <div className="page-container">
      <div className="flex items-center gap-3 mb-2">
        <Link to="/voyages" className="text-polar-400 hover:text-polar-300"><ArrowLeft size={20} /></Link>
        <h1 className="page-title">{current.voyageNo}</h1>
        <span className={statusInfo?.cls || 'badge-info'}>{statusInfo?.label || current.status}</span>
      </div>

      <div className="card mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><span className="text-xs text-snow/40">航次编号</span><div className="text-sm text-snow mt-1">{current.voyageNo}</div></div>
          <div><span className="text-xs text-snow/40">船名</span><div className="text-sm text-snow mt-1">{current.shipName ?? '-'}</div></div>
          <div><span className="text-xs text-snow/40">到达日期</span><div className="text-sm text-snow mt-1">{current.arrivalDate}</div></div>
          <div><span className="text-xs text-snow/40">物资数量</span><div className="text-sm text-snow mt-1">{supplies.length}</div></div>
          <div className="col-span-2 md:col-span-4"><span className="text-xs text-snow/40">备注</span><div className="text-sm text-snow mt-1">{current.description || '-'}</div></div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-snow flex items-center gap-2"><Package size={18} className="text-polar-400" />到货物资</h2>
          <div className="flex gap-2">
            {pendingSupplies.length > 0 && (
              <button className="btn-primary" onClick={handleStockIn}>
                <Truck size={16} /> 批量入库 ({pendingSupplies.length})
              </button>
            )}
            <button className="btn-secondary" onClick={() => setShowAddModal(true)}>
              <Plus size={16} /> 添加物资
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="text-left px-4 py-3">物资名称</th>
                <th className="text-left px-4 py-3">目标仓库</th>
                <th className="text-left px-4 py-3">计划数量</th>
                <th className="text-left px-4 py-3">实际数量</th>
                <th className="text-left px-4 py-3">状态</th>
                <th className="text-left px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-snow/30">加载中...</td></tr>
              ) : supplies.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-snow/30">暂无物资</td></tr>
              ) : (
                supplies.map((vs) => {
                  const vsStatus = supplyStatusMap[vs.status]
                  return (
                    <tr key={vs.id} className="table-row">
                      <td className="px-4 py-3 text-sm text-snow">{vs.supply?.name ?? '-'}</td>
                      <td className="px-4 py-3 text-sm text-snow/60">{vs.targetWarehouse?.name ?? '-'}</td>
                      <td className="px-4 py-3 text-sm text-snow/60">{vs.quantity}</td>
                      <td className="px-4 py-3 text-sm text-snow/60">{vs.actualQuantity ?? '-'}</td>
                      <td className="px-4 py-3"><span className={vsStatus?.cls || 'badge-info'}>{vsStatus?.label || vs.status}</span></td>
                      <td className="px-4 py-3">
                        {vs.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              className="input-field w-20 py-1 text-sm"
                              placeholder="实收"
                              value={stockInItems[vs.id] ?? ''}
                              onChange={(e) => setStockInItems((prev) => ({ ...prev, [vs.id]: Number(e.target.value) }))}
                            />
                            <button className="text-polar-400 hover:text-polar-300 text-sm" onClick={() => handleSingleStockIn(vs)}>
                              入库
                            </button>
                          </div>
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

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-polar-500/10">
              <h2 className="text-lg font-semibold text-snow">添加物资</h2>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {addForms.map((f, i) => (
                <div key={i} className="grid grid-cols-3 gap-3">
                  <select
                    className="select-field"
                    value={f.supplyId || ''}
                    onChange={(e) => {
                      const next = [...addForms]
                      next[i] = { ...next[i], supplyId: Number(e.target.value) }
                      setAddForms(next)
                    }}
                  >
                    <option value="">选择物资</option>
                    {supplyList.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <select
                    className="select-field"
                    value={f.targetWarehouseId || ''}
                    onChange={(e) => {
                      const next = [...addForms]
                      next[i] = { ...next[i], targetWarehouseId: Number(e.target.value) }
                      setAddForms(next)
                    }}
                  >
                    <option value="">选择仓库</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="数量"
                    value={f.quantity || ''}
                    onChange={(e) => {
                      const next = [...addForms]
                      next[i] = { ...next[i], quantity: Number(e.target.value) }
                      setAddForms(next)
                    }}
                  />
                </div>
              ))}
              <button className="btn-secondary text-sm" onClick={() => setAddForms([...addForms, { supplyId: 0, targetWarehouseId: 0, quantity: 0 }])}>
                <Plus size={14} /> 添加一行
              </button>
            </div>
            <div className="p-6 border-t border-polar-500/10 flex justify-end gap-3">
              <button className="btn-secondary" onClick={() => setShowAddModal(false)}>取消</button>
              <button className="btn-primary" onClick={handleAddSupplies}>确认添加</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
