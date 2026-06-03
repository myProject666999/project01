import { useEffect, useState } from 'react'
import { Plus, Search, Filter, CheckCircle, XCircle } from 'lucide-react'
import { useRequisitionStore } from '@/stores/useRequisitionStore'
import { useBaseDataStore } from '@/stores/useBaseDataStore'

const statusMap: Record<string, { label: string; cls: string }> = {
  pending: { label: '待审批', cls: 'badge-warning' },
  approved: { label: '已通过', cls: 'badge-success' },
  rejected: { label: '已拒绝', cls: 'badge-danger' },
  cancelled: { label: '已取消', cls: 'badge-info' },
}

const purposeTypeMap: Record<string, string> = {
  personal: '个人',
  project: '项目',
}

const statusOptions = [
  { value: '', label: '全部状态' },
  { value: 'pending', label: '待审批' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已拒绝' },
  { value: 'cancelled', label: '已取消' },
]

interface FormItem {
  supplyId: number
  quantity: number
}

const defaultFormState = {
  memberId: 0,
  projectId: 0,
  purposeType: 'personal' as 'personal' | 'project',
  remark: '',
}

export default function Requisitions() {
  const { requisitions, loading, fetchRequisitions, createRequisition, approve, reject } = useRequisitionStore()
  const { members, projects, supplies, fetchMembers, fetchProjects, fetchSupplies } = useBaseDataStore()
  const [status, setStatus] = useState('')
  const [keyword, setKeyword] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(defaultFormState)
  const [formItems, setFormItems] = useState<FormItem[]>([{ supplyId: 0, quantity: 1 }])
  const [rejectRemark, setRejectRemark] = useState('')
  const [rejectingId, setRejectingId] = useState<number | null>(null)

  useEffect(() => {
    fetchMembers()
    fetchProjects()
    fetchSupplies()
  }, [fetchMembers, fetchProjects, fetchSupplies])

  useEffect(() => {
    fetchRequisitions()
  }, [fetchRequisitions])

  const filtered = requisitions.filter((r) => {
    if (status && r.status !== status) return false
    if (keyword) {
      const kw = keyword.toLowerCase()
      const matchReqNo = r.reqNo.toLowerCase().includes(kw)
      const matchMember = r.member?.name.toLowerCase().includes(kw)
      const matchProject = r.project?.name.toLowerCase().includes(kw)
      if (!matchReqNo && !matchMember && !matchProject) return false
    }
    return true
  })

  const handleCreate = async () => {
    const items = formItems.filter((i) => i.supplyId > 0)
    if (items.length === 0 || form.memberId === 0) return
    await createRequisition({
      memberId: form.memberId,
      projectId: form.projectId || undefined,
      purposeType: form.purposeType,
      remark: form.remark || undefined,
      items: items.map((i) => ({ supplyId: i.supplyId, quantity: i.quantity })),
    })
    setShowModal(false)
    setForm(defaultFormState)
    setFormItems([{ supplyId: 0, quantity: 1 }])
    fetchRequisitions()
  }

  const handleApprove = async (id: number) => {
    await approve(id, { approvedBy: 1 })
    fetchRequisitions()
  }

  const handleReject = async (id: number) => {
    await reject(id, { approvedBy: 1, remark: rejectRemark || undefined })
    setRejectingId(null)
    setRejectRemark('')
    fetchRequisitions()
  }

  const addItemRow = () => setFormItems([...formItems, { supplyId: 0, quantity: 1 }])
  const removeItemRow = (idx: number) => setFormItems(formItems.filter((_, i) => i !== idx))
  const updateItem = (idx: number, field: keyof FormItem, value: number) => {
    const next = [...formItems]
    next[idx] = { ...next[idx], [field]: value }
    setFormItems(next)
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between">
        <h1 className="page-title">领用管理</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> 新建领用
        </button>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-snow/30" />
            <input
              type="text"
              placeholder="搜索单号/队员/项目..."
              className="input-field pl-9"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-snow/30" />
            <select className="select-field w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
              {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="text-left px-4 py-3">领用单号</th>
                <th className="text-left px-4 py-3">领用人</th>
                <th className="text-left px-4 py-3">项目</th>
                <th className="text-left px-4 py-3">用途</th>
                <th className="text-left px-4 py-3">状态</th>
                <th className="text-left px-4 py-3">申请时间</th>
                <th className="text-left px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-snow/30">加载中...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-snow/30">暂无领用记录</td></tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="table-row">
                    <td className="px-4 py-3 text-sm text-polar-400 font-medium">{r.reqNo}</td>
                    <td className="px-4 py-3 text-sm text-snow/60">{r.member?.name ?? '-'}</td>
                    <td className="px-4 py-3 text-sm text-snow/60">{r.project?.name ?? '-'}</td>
                    <td className="px-4 py-3 text-sm text-snow/60">{purposeTypeMap[r.purposeType] ?? r.purposeType}</td>
                    <td className="px-4 py-3">
                      <span className={statusMap[r.status]?.cls || 'badge-info'}>
                        {statusMap[r.status]?.label || r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-snow/40">
                      {new Date(r.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {r.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            className="text-emerald-400 hover:text-emerald-300 text-sm"
                            onClick={() => handleApprove(r.id)}
                            title="通过"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            className="text-red-400 hover:text-red-300 text-sm"
                            onClick={() => { setRejectingId(r.id); setRejectRemark('') }}
                            title="拒绝"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="mt-4 text-sm text-snow/40">共 {filtered.length} 条</div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-polar-500/10">
              <h2 className="text-lg font-semibold text-snow">新建领用</h2>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-snow/60 mb-1">领用人</label>
                  <select
                    className="select-field"
                    value={form.memberId}
                    onChange={(e) => setForm({ ...form, memberId: Number(e.target.value) })}
                  >
                    <option value={0}>选择队员</option>
                    {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-snow/60 mb-1">项目</label>
                  <select
                    className="select-field"
                    value={form.projectId}
                    onChange={(e) => setForm({ ...form, projectId: Number(e.target.value) })}
                  >
                    <option value={0}>选择项目</option>
                    {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-snow/60 mb-1">用途类型</label>
                  <select
                    className="select-field"
                    value={form.purposeType}
                    onChange={(e) => setForm({ ...form, purposeType: e.target.value as 'personal' | 'project' })}
                  >
                    <option value="personal">个人</option>
                    <option value="project">项目</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-snow/60 mb-1">备注</label>
                <textarea
                  className="input-field"
                  rows={2}
                  value={form.remark}
                  onChange={(e) => setForm({ ...form, remark: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-snow/60 mb-2">领用物资</label>
                <div className="space-y-3">
                  {formItems.map((fi, i) => (
                    <div key={i} className="grid grid-cols-[1fr_100px_auto] gap-3">
                      <select
                        className="select-field"
                        value={fi.supplyId}
                        onChange={(e) => updateItem(i, 'supplyId', Number(e.target.value))}
                      >
                        <option value={0}>选择物资</option>
                        {supplies.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.unit})</option>)}
                      </select>
                      <input
                        type="number"
                        className="input-field"
                        placeholder="数量"
                        min={1}
                        value={fi.quantity || ''}
                        onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))}
                      />
                      <button
                        className="btn-danger text-sm py-2 px-3"
                        onClick={() => removeItemRow(i)}
                        disabled={formItems.length <= 1}
                      >
                        删除
                      </button>
                    </div>
                  ))}
                </div>
                <button className="btn-secondary text-sm mt-2" onClick={addItemRow}>
                  <Plus size={14} /> 添加物资
                </button>
              </div>
            </div>
            <div className="p-6 border-t border-polar-500/10 flex justify-end gap-3">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>取消</button>
              <button className="btn-primary" onClick={handleCreate}>提交</button>
            </div>
          </div>
        </div>
      )}

      {rejectingId !== null && (
        <div className="modal-overlay" onClick={() => { setRejectingId(null); setRejectRemark('') }}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-polar-500/10">
              <h2 className="text-lg font-semibold text-snow">拒绝领用</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-snow/60 mb-1">拒绝原因（可选）</label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={rejectRemark}
                  onChange={(e) => setRejectRemark(e.target.value)}
                  placeholder="请输入拒绝原因..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-polar-500/10 flex justify-end gap-3">
              <button className="btn-secondary" onClick={() => { setRejectingId(null); setRejectRemark('') }}>取消</button>
              <button className="btn-danger" onClick={() => handleReject(rejectingId)}>确认拒绝</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
