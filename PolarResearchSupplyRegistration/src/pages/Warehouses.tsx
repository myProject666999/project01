import { useEffect, useState } from 'react'
import { Plus, Warehouse, Pencil, Trash2 } from 'lucide-react'
import { useBaseDataStore } from '@/stores/useBaseDataStore'
import type { Warehouse as WarehouseType } from '@/api/client'

const emptyForm = { name: '', location: '', description: '', capacity: 0 }

export default function Warehouses() {
  const { warehouses, loading, fetchWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } = useBaseDataStore()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<WarehouseType | null>(null)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    fetchWarehouses()
  }, [fetchWarehouses])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (w: WarehouseType) => {
    setEditing(w)
    setForm({ name: w.name, location: w.location ?? '', description: w.description ?? '', capacity: w.capacity })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (editing) {
      await updateWarehouse(editing.id, form)
    } else {
      await createWarehouse(form)
    }
    setShowModal(false)
    setForm(emptyForm)
    setEditing(null)
    fetchWarehouses()
  }

  const handleDelete = async (id: number) => {
    await deleteWarehouse(id)
    fetchWarehouses()
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between">
        <h1 className="page-title flex items-center gap-2"><Warehouse size={24} className="text-polar-400" /> 仓库管理</h1>
        <button className="btn-primary" onClick={openCreate}><Plus size={18} /> 新增仓库</button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="text-left px-4 py-3">仓库名称</th>
                <th className="text-left px-4 py-3">位置</th>
                <th className="text-left px-4 py-3">容量</th>
                <th className="text-left px-4 py-3">描述</th>
                <th className="text-left px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-snow/30">加载中...</td></tr>
              ) : warehouses.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-snow/30">暂无仓库数据</td></tr>
              ) : (
                warehouses.map((w) => (
                  <tr key={w.id} className="table-row">
                    <td className="px-4 py-3 text-sm text-snow font-medium">{w.name}</td>
                    <td className="px-4 py-3 text-sm text-snow/60">{w.location ?? '-'}</td>
                    <td className="px-4 py-3 text-sm text-snow/60">{w.capacity}</td>
                    <td className="px-4 py-3 text-sm text-snow/60 max-w-[200px] truncate">{w.description ?? '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="text-polar-400 hover:text-polar-300" onClick={() => openEdit(w)}><Pencil size={16} /></button>
                        <button className="text-red-400 hover:text-red-300" onClick={() => handleDelete(w.id)}><Trash2 size={16} /></button>
                      </div>
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
              <h2 className="text-lg font-semibold text-snow">{editing ? '编辑仓库' : '新增仓库'}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-snow/60 mb-1">仓库名称</label>
                <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-snow/60 mb-1">位置</label>
                <input className="input-field" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-snow/60 mb-1">容量</label>
                <input type="number" className="input-field" value={form.capacity || ''} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
              </div>
              <div>
                <label className="block text-sm text-snow/60 mb-1">描述</label>
                <textarea className="input-field" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
            <div className="p-6 border-t border-polar-500/10 flex justify-end gap-3">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>取消</button>
              <button className="btn-primary" onClick={handleSubmit}>{editing ? '保存' : '创建'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
