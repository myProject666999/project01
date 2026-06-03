import { useEffect, useState } from 'react'
import { Plus, Users, Pencil, Trash2 } from 'lucide-react'
import { useBaseDataStore } from '@/stores/useBaseDataStore'
import type { Member as MemberType } from '@/api/client'

const roleMap: Record<string, { label: string; cls: string }> = {
  station_chief: { label: '站长', cls: 'badge-danger' },
  logistics: { label: '后勤', cls: 'badge-warning' },
  researcher: { label: '队员', cls: 'badge-info' },
}

const roleOptions = [
  { value: 'station_chief', label: '站长' },
  { value: 'logistics', label: '后勤' },
  { value: 'researcher', label: '队员' },
]

const emptyForm: { name: string; role: MemberType['role']; team: string; phone: string; projectId: number | null } = { name: '', role: 'researcher', team: '', phone: '', projectId: null }

export default function Members() {
  const { members, projects, loading, fetchMembers, createMember, updateMember, deleteMember, fetchProjects } = useBaseDataStore()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<MemberType | null>(null)
  const [form, setForm] = useState<{ name: string; role: MemberType['role']; team: string; phone: string; projectId: number | null }>(emptyForm)

  useEffect(() => {
    fetchMembers()
    fetchProjects()
  }, [fetchMembers, fetchProjects])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (m: MemberType) => {
    setEditing(m)
    setForm({ name: m.name, role: m.role, team: m.team ?? '', phone: m.phone ?? '', projectId: m.projectId })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (editing) {
      await updateMember(editing.id, form)
    } else {
      await createMember(form)
    }
    setShowModal(false)
    setForm(emptyForm)
    setEditing(null)
    fetchMembers()
  }

  const handleDelete = async (id: number) => {
    await deleteMember(id)
    fetchMembers()
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between">
        <h1 className="page-title flex items-center gap-2"><Users size={24} className="text-polar-400" /> 队员管理</h1>
        <button className="btn-primary" onClick={openCreate}><Plus size={18} /> 新增队员</button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="text-left px-4 py-3">姓名</th>
                <th className="text-left px-4 py-3">角色</th>
                <th className="text-left px-4 py-3">团队</th>
                <th className="text-left px-4 py-3">电话</th>
                <th className="text-left px-4 py-3">项目</th>
                <th className="text-left px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-snow/30">加载中...</td></tr>
              ) : members.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-snow/30">暂无队员数据</td></tr>
              ) : (
                members.map((m) => {
                  const roleInfo = roleMap[m.role] || { label: m.role, cls: 'badge-info' }
                  return (
                    <tr key={m.id} className="table-row">
                      <td className="px-4 py-3 text-sm text-snow font-medium">{m.name}</td>
                      <td className="px-4 py-3"><span className={roleInfo.cls}>{roleInfo.label}</span></td>
                      <td className="px-4 py-3 text-sm text-snow/60">{m.team ?? '-'}</td>
                      <td className="px-4 py-3 text-sm text-snow/60">{m.phone ?? '-'}</td>
                      <td className="px-4 py-3 text-sm text-snow/60">{m.project?.name ?? '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button className="text-polar-400 hover:text-polar-300" onClick={() => openEdit(m)}><Pencil size={16} /></button>
                          <button className="text-red-400 hover:text-red-300" onClick={() => handleDelete(m.id)}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-polar-500/10">
              <h2 className="text-lg font-semibold text-snow">{editing ? '编辑队员' : '新增队员'}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-snow/60 mb-1">姓名</label>
                <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-snow/60 mb-1">角色</label>
                  <select className="select-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as MemberType['role'] })}>
                    {roleOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-snow/60 mb-1">团队</label>
                  <input className="input-field" value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-snow/60 mb-1">电话</label>
                  <input className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm text-snow/60 mb-1">所属项目</label>
                  <select className="select-field" value={form.projectId ?? 0} onChange={(e) => setForm({ ...form, projectId: e.target.value ? Number(e.target.value) : null })}>
                    <option value={0}>无</option>
                    {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
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
