import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ArrowUpCircle, ArrowDownCircle, Package, Flame, Clock } from 'lucide-react'
import { useInventoryStore } from '@/stores/useInventoryStore'

const isFoodCategory = (categoryName?: string) => {
  if (!categoryName) return false
  return ['食品', '食物', '粮食', '蔬菜', '肉类', '水果', '饮料', '零食'].some(k => categoryName.includes(k))
}

export default function InventoryDetail() {
  const { id } = useParams<{ id: string }>()
  const { current, records, fetchItem, fetchRecords } = useInventoryStore()
  const inventoryId = Number(id)

  useEffect(() => {
    if (inventoryId) {
      fetchItem(inventoryId)
      fetchRecords(inventoryId)
    }
  }, [inventoryId, fetchItem, fetchRecords])

  if (!current) {
    return <div className="page-container"><div className="text-center py-20 text-snow/30">加载中...</div></div>
  }

  const supply = current.supply
  const warehouse = current.warehouse
  const isFood = isFoodCategory(supply?.category?.name)

  return (
    <div className="page-container">
      <div className="flex items-center gap-3 mb-2">
        <Link to="/inventory" className="text-polar-400 hover:text-polar-300"><ArrowLeft size={20} /></Link>
        <h1 className="page-title">{supply?.name ?? '库存详情'}</h1>
      </div>

      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Package size={18} className="text-polar-400" />
          <h2 className="text-lg font-semibold text-snow">物资信息</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-xs text-snow/40">物资名称</span>
            <div className="text-sm text-snow mt-1 font-medium">{supply?.name ?? '-'}</div>
          </div>
          <div>
            <span className="text-xs text-snow/40">分类</span>
            <div className="text-sm text-snow mt-1">{supply?.category?.name ?? '-'}</div>
          </div>
          <div>
            <span className="text-xs text-snow/40">单位</span>
            <div className="text-sm text-snow mt-1">{supply?.unit ?? '-'}</div>
          </div>
          <div>
            <span className="text-xs text-snow/40">描述</span>
            <div className="text-sm text-snow mt-1">{supply?.description ?? '-'}</div>
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Package size={18} className="text-polar-400" />
          <h2 className="text-lg font-semibold text-snow">库存信息</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-xs text-snow/40">仓库</span>
            <div className="text-sm text-snow mt-1">{warehouse?.name ?? '-'}</div>
          </div>
          <div>
            <span className="text-xs text-snow/40">当前库存</span>
            <div className="text-sm text-snow mt-1 font-bold">{current.quantity} {supply?.unit ?? ''}</div>
          </div>
          <div>
            <span className="text-xs text-snow/40">预留数量</span>
            <div className="text-sm text-snow mt-1">{current.reservedQuantity} {supply?.unit ?? ''}</div>
          </div>
          <div>
            <span className="text-xs text-snow/40">批次号</span>
            <div className="text-sm text-snow mt-1">{current.batchNo ?? '-'}</div>
          </div>
          <div>
            <span className="text-xs text-snow/40">保质期</span>
            <div className="text-sm text-snow mt-1">
              {current.expiryDate ? new Date(current.expiryDate).toLocaleDateString() : '-'}
            </div>
          </div>
          <div>
            <span className="text-xs text-snow/40">最后入库</span>
            <div className="text-sm text-snow mt-1">
              {current.lastStockIn ? new Date(current.lastStockIn).toLocaleDateString() : '-'}
            </div>
          </div>
          <div>
            <span className="text-xs text-snow/40">最后出库</span>
            <div className="text-sm text-snow mt-1">
              {current.lastStockOut ? new Date(current.lastStockOut).toLocaleDateString() : '-'}
            </div>
          </div>
        </div>
      </div>

      {isFood && (supply?.calories != null || supply?.shelfLifeDays != null) && (
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Flame size={18} className="text-amber" />
            <h2 className="text-lg font-semibold text-snow">食品信息</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {supply?.calories != null && (
              <div>
                <span className="text-xs text-snow/40">热量</span>
                <div className="text-sm text-snow mt-1 font-medium">{supply.calories} kcal</div>
              </div>
            )}
            {supply?.shelfLifeDays != null && (
              <div>
                <span className="text-xs text-snow/40">保质天数</span>
                <div className="text-sm text-snow mt-1">{supply.shelfLifeDays} 天</div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={18} className="text-polar-400" />
          <h2 className="text-lg font-semibold text-snow">出入库记录</h2>
        </div>
        {records.length === 0 ? (
          <div className="py-8 text-center text-snow/30">暂无记录</div>
        ) : (
          <div className="relative pl-8 space-y-0">
            <div className="absolute left-[15px] top-2 bottom-2 w-px bg-polar-500/20" />
            {records.map((r) => (
              <div key={r.id} className="relative flex items-center gap-4 py-3">
                <div className={`absolute left-[-25px] w-5 h-5 rounded-full flex items-center justify-center ${
                  r.type === 'in' ? 'bg-emerald-500/20' : 'bg-red-500/20'
                }`}>
                  {r.type === 'in'
                    ? <ArrowUpCircle size={12} className="text-emerald-400" />
                    : <ArrowDownCircle size={12} className="text-red-400" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-snow font-medium">
                    {r.type === 'in' ? '入库' : '出库'}
                    {r.sourceType && <span className="text-snow/40 ml-2">{r.sourceType}</span>}
                  </div>
                  <div className="text-xs text-snow/40">
                    {r.remark && <span className="mr-2">{r.remark}</span>}
                    {new Date(r.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className={`text-lg font-bold ${r.type === 'in' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {r.type === 'in' ? '+' : '-'}{r.quantity}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
