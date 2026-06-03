import { useEffect, useState } from 'react'
import { ShoppingCart, Save, Ship, Zap } from 'lucide-react'
import { useBaseDataStore } from '@/stores/useBaseDataStore'
import { useVoyageStore } from '@/stores/useVoyageStore'

export default function DemandList() {
  const { demandItems, fetchDemand, updateDemandItem, generateDemand } = useBaseDataStore()
  const { voyages, fetchVoyages } = useVoyageStore()
  const [selectedVoyage, setSelectedVoyage] = useState<number>(0)
  const [editValues, setEditValues] = useState<Record<number, number>>({})
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    fetchVoyages()
  }, [fetchVoyages])

  useEffect(() => {
    if (selectedVoyage) {
      fetchDemand(selectedVoyage)
    }
  }, [selectedVoyage, fetchDemand])

  const handleSave = async (id: number) => {
    const requiredQuantity = editValues[id]
    if (requiredQuantity !== undefined) {
      await updateDemandItem(id, { requiredQuantity })
      if (selectedVoyage) fetchDemand(selectedVoyage)
      setEditValues((prev) => { const next = { ...prev }; delete next[id]; return next })
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      await generateDemand()
      if (selectedVoyage) fetchDemand(selectedVoyage)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between">
        <h1 className="page-title flex items-center gap-2">
          <ShoppingCart size={24} className="text-polar-400" /> 下航次需求清单
        </h1>
        <div className="flex items-center gap-3">
          <button className="btn-amber" onClick={handleGenerate} disabled={generating}>
            <Zap size={16} className={generating ? 'animate-pulse' : ''} /> {generating ? '生成中...' : '从预警自动生成'}
          </button>
          <div className="flex items-center gap-2">
            <Ship size={16} className="text-snow/40" />
            <select className="select-field w-auto" value={selectedVoyage} onChange={(e) => setSelectedVoyage(Number(e.target.value))}>
              <option value={0}>选择航次</option>
              {voyages.map((v) => <option key={v.id} value={v.id}>{v.voyageNo} - {v.shipName ?? ''}</option>)}
            </select>
          </div>
        </div>
      </div>

      {!selectedVoyage ? (
        <div className="card">
          <div className="py-16 text-center text-snow/30">请先选择一个航次</div>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="text-left px-4 py-3">物资名称</th>
                  <th className="text-left px-4 py-3">建议数量</th>
                  <th className="text-left px-4 py-3">需求数量</th>
                  <th className="text-left px-4 py-3">单位</th>
                  <th className="text-left px-4 py-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {demandItems.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-snow/30">暂无需求数据</td></tr>
                ) : (
                  demandItems.map((d) => (
                    <tr key={d.id} className="table-row">
                      <td className="px-4 py-3 text-sm text-snow font-medium">{d.supply?.name ?? '-'}</td>
                      <td className="px-4 py-3 text-sm text-snow/60">{d.suggestedQuantity}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          className="input-field w-24 py-1 text-sm"
                          value={editValues[d.id] ?? d.requiredQuantity}
                          onChange={(e) => setEditValues({ ...editValues, [d.id]: Number(e.target.value) })}
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-snow/60">{d.supply?.unit ?? '-'}</td>
                      <td className="px-4 py-3">
                        <button className="text-polar-400 hover:text-polar-300 text-sm flex items-center gap-1" onClick={() => handleSave(d.id)}>
                          <Save size={14} /> 保存
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
