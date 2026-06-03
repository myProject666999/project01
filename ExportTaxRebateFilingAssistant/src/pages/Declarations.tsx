import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Eye, Send, Activity } from 'lucide-react'
import DataTable, { type Column } from '@/components/DataTable'
import StatusBadge from '@/components/StatusBadge'
import { declarationApi, type Declaration, type PageResult } from '@/api'
import { formatDate, formatMoney } from '@/lib/utils'

export default function Declarations() {
  const navigate = useNavigate()
  const [data, setData] = useState<PageResult<Declaration>>({ list: [], total: 0, page: 1, size: 10, totalPages: 0 })
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [period, setPeriod] = useState('')
  const [generating, setGenerating] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await declarationApi.list({ page, size: 10, keyword: period || undefined })
      setData(res)
    } catch {
      setData({ list: [], total: 0, page: 1, size: 10, totalPages: 0 })
    } finally {
      setLoading(false)
    }
  }, [page, period])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleGenerate = async () => {
    if (!period) {
      alert('请选择申报月份')
      return
    }
    setGenerating(true)
    try {
      await declarationApi.generate(period)
      alert('申报表生成成功')
      fetchData()
    } catch (err) {
      alert((err as Error).message || '生成失败')
    } finally {
      setGenerating(false)
    }
  }

  const handleSubmit = async (id: number) => {
    if (!confirm('确定提交该申报表？提交后不可修改。')) return
    try {
      await declarationApi.submit(id)
      fetchData()
    } catch (err) {
      alert((err as Error).message || '提交失败')
    }
  }

  const columns: Column<Declaration>[] = [
    { key: 'declarationNo', title: '申报编号', width: '140px' },
    { key: 'period', title: '申报月份', width: '110px' },
    { key: 'totalAmount', title: '总金额', width: '130px', render: (_, r) => formatMoney(r.totalAmount) },
    { key: 'totalTaxAmount', title: '退税额', width: '130px', render: (_, r) => formatMoney(r.totalTaxAmount) },
    { key: 'status', title: '状态', width: '110px', render: (_, r) => <StatusBadge status={r.status} /> },
    { key: 'createdAt', title: '创建时间', width: '110px', render: (_, r) => formatDate(r.createdAt) },
    {
      key: 'id',
      title: '操作',
      width: '160px',
      render: (_, r) => (
        <div className="flex items-center gap-1">
          <button onClick={() => navigate(`/declarations/${r.id}`)} className="p-1.5 text-primary-500 hover:bg-primary-50 rounded" title="预览">
            <Eye size={16} />
          </button>
          {r.status === 'DRAFT' && (
            <button onClick={() => handleSubmit(r.id)} className="p-1.5 text-success hover:bg-green-50 rounded" title="提交">
              <Send size={16} />
            </button>
          )}
          <button onClick={() => navigate(`/declarations/${r.id}/progress`)} className="p-1.5 text-orange-500 hover:bg-orange-50 rounded" title="查看进度">
            <Activity size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">申报月份</label>
          <input
            type="month"
            value={period}
            onChange={(e) => { setPeriod(e.target.value); setPage(1) }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors"
        >
          <Plus size={16} />
          {generating ? '生成中...' : '生成申报表'}
        </button>
      </div>

      <DataTable
        columns={columns}
        data={data.list}
        loading={loading}
        pagination={{ page: data.page - 1, size: data.size, total: data.total }}
        onPageChange={(p) => setPage(p + 1)}
      />
    </div>
  )
}
