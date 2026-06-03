import { useEffect, useState } from 'react'
import { Plus, Tag, Pencil, Trash2, ChevronRight, FolderTree } from 'lucide-react'
import { useBaseDataStore } from '@/stores/useBaseDataStore'
import type { Category as CategoryType } from '@/api/client'

const emptyForm = { name: '', parentId: null as number | null, description: '', sortOrder: 0 }

function CategoryTreeItem({ cat, onEdit, onDelete, depth = 0 }: {
  cat: CategoryType
  onEdit: (c: CategoryType) => void
  onDelete: (id: number) => void
  depth?: number
}) {
  const [open, setOpen] = useState(true)
  const hasChildren = cat.children && cat.children.length > 0

  return (
    <>
      <div className="flex items-center gap-2 py-2.5 px-4 hover:bg-polar-500/5 transition-colors" style={{ paddingLeft: `${depth * 24 + 16}px` }}>
        {hasChildren ? (
          <button onClick={() => setOpen(!open)} className="text-snow/30 hover:text-snow">
            <ChevronRight size={14} className={`transition-transform ${open ? 'rotate-90' : ''}`} />
          </button>
        ) : (
          <span className="w-3.5" />
        )}
        <Tag size={14} className="text-polar-400 flex-shrink-0" />
        <span className="flex-1 text-sm text-snow">{cat.name}</span>
        <span className="text-xs text-snow/30 mr-2">排序: {cat.sortOrder}</span>
        <span className="text-xs text-snow/30 max-w-[120px] truncate">{cat.description ?? ''}</span>
        <div className="flex items-center gap-2 ml-2">
          <button className="text-polar-400 hover:text-polar-300" onClick={() => onEdit(cat)}><Pencil size={14} /></button>
          <button className="text-red-400 hover:text-red-300" onClick={() => onDelete(cat.id)}><Trash2 size={14} /></button>
        </div>
      </div>
      {open && hasChildren && cat.children!.map((child) => (
        <CategoryTreeItem key={child.id} cat={child} onEdit={onEdit} onDelete={onDelete} depth={depth + 1} />
      ))}
    </>
  )
}

export default function Categories() {
  const { categories, loading, fetchCategoryTree, createCategory, updateCategory, deleteCategory } = useBaseDataStore()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<CategoryType | null>(null)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    fetchCategoryTree()
  }, [fetchCategoryTree])

  const openCreate = (parentId: number | null = null) => {
    setEditing(null)
    setForm({ ...emptyForm, parentId })
    setShowModal(true)
  }

  const openEdit = (c: CategoryType) => {
    setEditing(c)
    setForm({ name: c.name, parentId: c.parentId, description: c.description ?? '', sortOrder: c.sortOrder })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (editing) {
      await updateCategory(editing.id, form)
    } else {
      await createCategory(form)
    }
    setShowModal(false)
    setForm(emptyForm)
    setEditing(null)
    fetchCategoryTree()
  }

  const handleDelete = async (id: number) => {
    await deleteCategory(id)
    fetchCategoryTree()
  }

  const flatCategories: CategoryType[] = []
  const flatten = (cats: CategoryType[]) => {
    for (const c of cats) {
      flatCategories.push(c)
      if (c.children) flatten(c.children)
    }
  }
  flatten(categories)

  return (
    <div className="page-container">
      <div className="flex items-center justify-between">
        <h1 className="page-title flex items-center gap-2"><FolderTree size={24} className="text-polar-400" /> 分类管理</h1>
        <button className="btn-primary" onClick={() => openCreate()}><Plus size={18} /> 新增分类</button>
      </div>

      <div className="card">
        {loading ? (
          <div className="py-8 text-center text-snow/30">加载中...</div>
        ) : categories.length === 0 ? (
          <div className="py-8 text-center text-snow/30">暂无分类数据</div>
        ) : (
          <div className="divide-y divide-polar-500/10">
            {categories.map((cat) => (
              <CategoryTreeItem key={cat.id} cat={cat} onEdit={openEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-polar-500/10">
              <h2 className="text-lg font-semibold text-snow">{editing ? '编辑分类' : '新增分类'}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-snow/60 mb-1">分类名称</label>
                <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-snow/60 mb-1">父分类</label>
                <select className="select-field" value={form.parentId ?? 0} onChange={(e) => setForm({ ...form, parentId: e.target.value ? Number(e.target.value) : null })}>
                  <option value={0}>无（顶级分类）</option>
                  {flatCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-snow/60 mb-1">排序号</label>
                <input type="number" className="input-field" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
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
