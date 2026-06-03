import { useEffect, useState, useCallback } from 'react'
import { Search, Trash2 } from 'lucide-react'
import DataTable, { type Column } from '@/components/DataTable'
import FileUpload from '@/components/FileUpload'
import StatusBadge from '@/components/StatusBadge'
import { customsApi, type CustomsDeclaration, type PageResult } from '@/api'
import { formatDate, formatMoney } from '@/lib/utils'

const columns: Column<CustomsDeclaration>[] = [
  { key: 'declarationNo', title: '报关单号', width: '140px' },
  { key: 'hsCode', title: 'HS编码', width: '110px' },
  { key: 'productName', title: '商品名称' },
  { key: 'quantity', title: '数量', width: '80px', render: (_, r) => `${r.quantity} ${r.unit}` },
  { key: 'amountCny', title: '金额', width: '120px', render: (_, r) => formatMoney(r.amountCny) },
  { key: 'currency', title: '币种', width: '60px' },
  { key: 'exportDate', title: '出口日期', width: '110px', render: (_, r) => formatDate(r.exportDate) },
  { key: 'status', title: '状态', width: '100px', render: (_, r) => <StatusBadge status={r.status} /> },
  {
    key: 'id',
    title: '操作',
    width: '80px',
    render: (_, r) => (
      <button
        onClick={(e) => { e.stopPropagation(); handleDelete(r.id) }}
        className="text-danger hover:text-red-600 transition-colors"
      >
        <Trash2 size={16} />
      </button>
    ),
  },
]

let handleDelete: (id: number) => void = () => {}

export default function CustomsDeclarations() {
  const [data, setData] = useState<PageResult<CustomsDeclaration>>({ list: [], total: 0, page: 1, size: 10, totalPages: 0 })
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [searchNo, setSearchNo] = useState('')
  const [searchHs, setSearchHs] = useState('')
  const [searchStatus, setSearchStatus] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await customsApi.list({ page, size: 10, keyword: searchNo || searchHs || searchStatus || undefined })
      setData(res)
    } catch {
      setData({ list: [], total: 0, page: 1, size: 10, totalPages: 0 })
    } finally {
      setLoading(false)
    }
  }, [page, searchNo, searchHs, searchStatus])

  handleDelete = async (id: number) => {
    if (!confirm('确定删除该报关单？')) return
    try {
      await customsApi.delete(id)
      fetchData()
    } catch (err) {
      alert((err as Error).message || '删除失败')
    }
  }

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="page-container">
      <div className="card mb-4">
        <FileUpload onUpload={customsApi.import} title="上传报关单CSV文件" />
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[180px] max-w-[240px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchNo}
              onChange={(e) => { setSearchNo(e.target.value); setPage(1) }}
              placeholder="搜索报关单号"
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
          <div className="relative flex-1 min-w-[180px] max-w-[240px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchHs}
              onChange={(e) => { setSearchHs(e.target.value); setPage(1) }}
              placeholder="搜索HS编码"
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
          <select
            value={searchStatus}
            onChange={(e) => { setSearchStatus(e.target.value); setPage(1) }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          >
            <option value="">全部状态</option>
            <option value="PENDING">待处理</option>
            <option value="MATCHED">已匹配</option>
            <option value="UNMATCHED">未匹配</option>
          </select>
        </div>

        <DataTable
          columns={columns}
          data={data.list}
          loading={loading}
          pagination={{ page: data.page - 1, size: data.size, total: data.total }}
          onPageChange={(p) => setPage(p + 1)}
        />
      </div>
    </div>
  )
}
