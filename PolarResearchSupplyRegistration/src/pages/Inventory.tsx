import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter } from 'lucide-react'
import { useInventoryStore } from '@/stores/useInventoryStore'
import { useBaseDataStore } from '@/stores/useBaseDataStore'

export default function Inventory() {
  const { items, loading, fetchItems } = useInventoryStore()
  const { warehouses, categories, fetchWarehouses, fetchCategories } = useBaseDataStore()
  const [warehouseId, setWarehouseId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    fetchWarehouses()
    fetchCategories()
  }, [fetchWarehouses, fetchCategories])

  useEffect(() => {
    fetchItems({
      warehouseId: warehouseId || undefined,
      categoryId: categoryId || undefined,
      keyword: keyword || undefined,
    })
  }, [warehouseId, categoryId, keyword, fetchItems])

  return (
    <div className="page-container">
      <div className="flex items-center justify-between">
        <h1 className="page-title">物资库存</h1>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-snow/30" />
            <input
              type="text"
              placeholder="搜索物资名称..."
              className="input-field pl-9"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-snow/30" />
            <select
              className="select-field w-auto"
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
            >
              <option value="">全部仓库</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            <select
              className="select-field w-auto"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">全部分类</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="text-left px-4 py-3">物资名称</th>
                <th className="text-left px-4 py-3">分类</th>
                <th className="text-left px-4 py-3">仓库</th>
                <th className="text-left px-4 py-3">库存</th>
                <th className="text-left px-4 py-3">单位</th>
                <th className="text-left px-4 py-3">保质期</th>
                <th className="text-left px-4 py-3">热量</th>
                <th className="text-left px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-8 text-snow/30">加载中...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-snow/30">暂无库存数据</td></tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="table-row">
                    <td className="px-4 py-3">
                      <Link to={`/inventory/${item.id}`} className="text-polar-400 hover:text-polar-300 font-medium">
                        {item.supply?.name ?? '-'}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-snow/60">{item.supply?.category?.name ?? '-'}</td>
                    <td className="px-4 py-3 text-sm text-snow/60">{item.warehouse?.name ?? '-'}</td>
                    <td className="px-4 py-3 text-sm text-snow font-medium">{item.quantity}</td>
                    <td className="px-4 py-3 text-sm text-snow/60">{item.supply?.unit ?? '-'}</td>
                    <td className="px-4 py-3 text-sm text-snow/60">
                      {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-snow/60">
                      {item.supply?.calories != null ? `${item.supply.calories} kcal` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/inventory/${item.id}`} className="text-polar-400 hover:text-polar-300 text-sm">详情</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && items.length > 0 && (
          <div className="mt-4 text-sm text-snow/40">共 {items.length} 条</div>
        )}
      </div>
    </div>
  )
}
