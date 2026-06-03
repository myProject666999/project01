import { useEffect, useState, useCallback } from 'react'
import { Play, Check, X } from 'lucide-react'
import DataTable, { type Column } from '@/components/DataTable'
import StatusBadge from '@/components/StatusBadge'
import { matchingApi, type MatchingResult, type PageResult } from '@/api'
import { formatMoney, formatDate, formatPercent, cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'

type TabKey = 'MATCHED' | 'SUSPECTED' | 'UNMATCHED'

const tabs: { key: TabKey; label: string }[] = [
  { key: 'MATCHED', label: '匹配成功' },
  { key: 'SUSPECTED', label: '异常匹配' },
  { key: 'UNMATCHED', label: '未匹配' },
]

function ScoreBar({ score }: { score: number }) {
  const pct = Math.round(score * 100)
  const color = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500">{pct}%</span>
    </div>
  )
}

export default function Matching() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabKey>('MATCHED')
  const [data, setData] = useState<PageResult<MatchingResult>>({ list: [], total: 0, page: 1, size: 10, totalPages: 0 })
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [autoMatching, setAutoMatching] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await matchingApi.getResults({ page, size: 10, keyword: activeTab })
      setData(res)
    } catch {
      setData({ list: [], total: 0, page: 1, size: 10, totalPages: 0 })
    } finally {
      setLoading(false)
    }
  }, [page, activeTab])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAutoMatch = async () => {
    setAutoMatching(true)
    try {
      const result = await matchingApi.autoMatch()
      alert(`自动匹配完成：成功匹配 ${result} 笔`)
      setActiveTab('MATCHED')
      setPage(1)
      fetchData()
    } catch (err) {
      alert((err as Error).message || '自动匹配失败')
    } finally {
      setAutoMatching(false)
    }
  }

  const handleConfirm = async (id: number) => {
    try {
      await matchingApi.confirm(id)
      fetchData()
    } catch (err) {
      alert((err as Error).message || '确认失败')
    }
  }

  const handleReject = async (id: number) => {
    try {
      await matchingApi.reject(id)
      fetchData()
    } catch (err) {
      alert((err as Error).message || '否决失败')
    }
  }

  const matchedColumns: Column<MatchingResult>[] = [
    { key: 'customsId', title: '报关单ID', width: '100px' },
    { key: 'invoiceId', title: '发票ID', width: '100px' },
    { key: 'matchScore', title: '匹配度', width: '140px', render: (_, r) => <ScoreBar score={r.matchScore / 100} /> },
    { key: 'matchType', title: '匹配类型', width: '100px', render: (_, r) => r.matchType === 'AUTO' ? '自动' : '手动' },
    { key: 'status', title: '状态', width: '100px', render: (_, r) => <StatusBadge status={r.status} /> },
    { key: 'createdAt', title: '创建时间', width: '150px', render: (_, r) => formatDate(r.createdAt) },
  ]

  const suspectedColumns: Column<MatchingResult>[] = [
    ...matchedColumns,
    {
      key: 'id',
      title: '操作',
      width: '120px',
      render: (_, r) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleConfirm(r.id)} className="p-1 text-success hover:text-green-600" title="确认匹配">
            <Check size={16} />
          </button>
          <button onClick={() => handleReject(r.id)} className="p-1 text-danger hover:text-red-600" title="否决匹配">
            <X size={16} />
          </button>
        </div>
      ),
    },
  ]

  const unmatchedColumns: Column<MatchingResult>[] = [
    { key: 'customsId', title: '报关单ID', width: '100px' },
    { key: 'invoiceId', title: '发票ID', width: '100px' },
    { key: 'matchScore', title: '匹配度', width: '140px', render: (_, r) => <ScoreBar score={r.matchScore / 100} /> },
    { key: 'status', title: '状态', width: '100px', render: (_, r) => <StatusBadge status={r.status} /> },
    { key: 'createdAt', title: '创建时间', width: '150px', render: (_, r) => formatDate(r.createdAt) },
  ]

  const columns = activeTab === 'SUSPECTED' ? suspectedColumns : activeTab === 'UNMATCHED' ? unmatchedColumns : matchedColumns

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setPage(1) }}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                activeTab === tab.key ? 'bg-white text-primary-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/matching/manual')}
            className="px-4 py-2 border border-primary-500 text-primary-500 rounded-lg text-sm font-medium hover:bg-primary-50 transition-colors"
          >
            手动匹配
          </button>
          <button
            onClick={handleAutoMatch}
            disabled={autoMatching}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors"
          >
            <Play size={16} />
            {autoMatching ? '匹配中...' : '执行自动匹配'}
          </button>
        </div>
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
