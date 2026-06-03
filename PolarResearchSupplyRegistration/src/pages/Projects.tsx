import { useEffect, useState } from 'react'
import { Plus, FolderKanban, Pencil, Trash2 } from 'lucide-react'
import { useBaseDataStore } from '@/stores/useBaseDataStore'
import type { Project as ProjectType } from '@/api/client'

const statusMap: Record<string, { label: string; cls: string }> = {
  active: { label: '进行中', cls: 'badge-success' },
  completed: { label: '已完成', cls: 'badge-info' },
  suspended: { label: '暂停', cls: 'badge-warning' },
}

const statusOptions = [
  { value: 'active', label: '进行中' },
  { value: 'completed', label: '已完成' },
  { value: 'suspended', label: '暂停' },
]

const emptyForm: { name: string; leader: string; description: string; status: ProjectType['status'] } = { name: '', leader: '', description: '', status: 'active' }

export default function Projects() {
  const { projects, loading, fetchProjects, createProject, updateProject, deleteProject } = useBaseDataStore()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<ProjectType | null>(null)
  const [form, setForm] = useState<{ name: string; leader: string; description: string; status: ProjectType['status'] }>(emptyForm)

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (p: ProjectType) => {
    setEditing(p)
    setForm({ name: p.name, leader: p.leader ?? '', description: p.description ?? '', status: p.status })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (editing) {
      await updateProject(editing.id, form)
    } else {
      await createProject(form)
    }
    setShowModal(false)
    setForm(emptyForm)
    setEditing(null)
    fetchProjects()
  }

  const handleDelete = async (id: number) => {
    await deleteProject(id)
    fetchProjects()
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between">
        <h1 className="page-title flex items-center gap-2"><FolderKanban size={24} className="text-polar-400" /> 项目管理</h1>
        <button className="btn-primary" onClick={openCreate}><Plus size={18} /> 新增项目</button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="text-left px-4 py-3">项目名称</th>
                <th className="text-left px-4 py-3">负责人</th>
                <th className="text-left px-4 py-3">描述</th>
                <th className="text-left px-4 py-3">状态</th>
                <th className="text-left px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-snow/30">加载中...</td></tr>
              ) : projects.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-snow/30">暂无项目数据</td></tr>
              ) : (
                projects.map((p) => (
                  <tr key={p.id} className="table-row">
                    <td className="px-4 py-3 text-sm text-snow font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-sm text-snow/60">{p.leader ?? '-'}</td>
                    <td className="px-4 py-3 text-sm text-snow/60 max-w-[200px] truncate">{p.description ?? '-'}</td>
                    <td className="px-4 py-3"><span className={statusMap[p.status]?.cls || 'badge-info'}>{statusMap[p.status]?.label || p.status}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="text-polar-400 hover:text-polar-300" onClick={() => openEdit(p)}><Pencil size={16} /></button>
                        <button className="text-red-400 hover:text-red-300" onClick={() => handleDelete(p.id)}><Trash2 size={16} /></button>
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
              <h2 className="text-lg font-semibold text-snow">{editing ? '编辑项目' : '新增项目'}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-snow/60 mb-1">项目名称</label>
                <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-snow/60 mb-1">负责人</label>
                <input className="input-field" value={form.leader} onChange={(e) => setForm({ ...form, leader: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-snow/60 mb-1">描述</label>
                <textarea className="input-field" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-snow/60 mb-1">状态</label>
                <select className="select-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ProjectType['status'] })}>
                  {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
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
