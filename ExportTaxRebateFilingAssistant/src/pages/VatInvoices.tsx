import { useEffect, useState, useCallback } from 'react'
import { Search, Trash2 } from 'lucide-react'
import DataTable, { type Column } from '@/components/DataTable'
import FileUpload from '@/components/FileUpload'
import StatusBadge from '@/components/StatusBadge'
import { invoiceApi, type VatInvoice, type PageResult } from '@/api'
import { formatDate, formatMoney } from '@/lib/utils'

const columns: Column<VatInvoice>[] = [
  { key: 'invoiceNo', title: '发票号码', width: '130px' },
  { key: 'invoiceCode', title: '发票代码', width: '120px' },
  { key: 'productName', title: '商品名称' },
  { key: 'quantity', title: '数量', width: '80px', render: (_, r) => `${r.quantity} ${r.unit}` },
  { key: 'amount', title: '金额', width: '110px', render: (_, r) => formatMoney(r.amount) },
  { key: 'taxAmount', title: '税额', width: '110px', render: (_, r) => formatMoney(r.taxAmount) },
  { key: 'invoiceDate', title: '开票日期', width: '110px', render: (_, r) => formatDate(r.invoiceDate) },
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

export default function VatInvoices() {
  const [data, setData] = useState<PageResult<VatInvoice>>({ list: [], total: 0, page: 1, size: 10, totalPages: 0 })
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [searchNo, setSearchNo] = useState('')
  const [searchStatus, setSearchStatus] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await invoiceApi.list({ page, size: 10, keyword: searchNo || searchStatus || undefined })
      setData(res)
    } catch {
      setData({ list: [], total: 0, page: 1, size: 10, totalPages: 0 })
    } finally {
      setLoading(false)
    }
  }, [page, searchNo, searchStatus])

  handleDelete = async (id: number) => {
    if (!confirm('确定删除该发票？')) return
    try {
      await invoiceApi.delete(id)
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
        <FileUpload onUpload={invoiceApi.import} title="上传增值税发票CSV文件" />
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[180px] max-w-[240px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchNo}
              onChange={(e) => { setSearchNo(e.target.value); setPage(1) }}
              placeholder="搜索发票号码"
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
