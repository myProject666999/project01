import { useEffect, useState, useCallback } from 'react'
import { Search, Plus, Upload, Trash2, Check, X } from 'lucide-react'
import DataTable, { type Column } from '@/components/DataTable'
import FileUpload from '@/components/FileUpload'
import { taxRateApi, type TaxRate, type PageResult } from '@/api'
import { formatDate, cn } from '@/lib/utils'

export default function TaxRates() {
  const [data, setData] = useState<PageResult<TaxRate>>({ list: [], total: 0, page: 1, size: 10, totalPages: 0 })
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [searchHs, setSearchHs] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [editingHsCode, setEditingHsCode] = useState<string | null>(null)
  const [editRate, setEditRate] = useState('')
  const [newRate, setNewRate] = useState({ hsCode: '', productName: '', taxRate: '', category: '', effectiveDate: '' })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await taxRateApi.list({ page, size: 10, keyword: searchHs || undefined })
      setData(res)
    } catch {
      setData({ list: [], total: 0, page: 1, size: 10, totalPages: 0 })
    } finally {
      setLoading(false)
    }
  }, [page, searchHs])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSaveRate = async (hsCode: string) => {
    try {
      await taxRateApi.update(hsCode, { taxRate: parseFloat(editRate) / 100 })
      setEditingHsCode(null)
      fetchData()
    } catch (err) {
      alert((err as Error).message || '更新失败')
    }
  }

  const handleAdd = async () => {
    try {
      await taxRateApi.create({
        hsCode: newRate.hsCode,
        productName: newRate.productName,
        taxRate: parseFloat(newRate.taxRate) / 100,
        category: newRate.category,
        effectiveDate: newRate.effectiveDate,
        createdAt: '',
      })
      setShowAdd(false)
      setNewRate({ hsCode: '', productName: '', taxRate: '', category: '', effectiveDate: '' })
      fetchData()
    } catch (err) {
      alert((err as Error).message || '添加失败')
    }
  }

  const handleDelete = async (hsCode: string) => {
    if (!confirm('确定删除该退税率记录？')) return
    try {
      await taxRateApi.delete(hsCode)
      fetchData()
    } catch (err) {
      alert((err as Error).message || '删除失败')
    }
  }

  const columns: Column<TaxRate>[] = [
    { key: 'hsCode', title: 'HS编码', width: '120px' },
    { key: 'productName', title: '商品名称' },
    { key: 'category', title: '类别', width: '100px' },
    {
      key: 'taxRate',
      title: '退税率',
      width: '150px',
      render: (_, r) =>
        editingHsCode === r.hsCode ? (
          <div className="flex items-center gap-1">
            <input
              type="number"
              step="0.1"
              value={editRate}
              onChange={(e) => setEditRate(e.target.value)}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
            />
            <button onClick={() => handleSaveRate(r.hsCode)} className="p-1 text-success"><Check size={14} /></button>
            <button onClick={() => setEditingHsCode(null)} className="p-1 text-danger"><X size={14} /></button>
          </div>
        ) : (
          <span
            className="cursor-pointer hover:text-primary-500"
            onClick={() => { setEditingHsCode(r.hsCode); setEditRate((r.taxRate * 100).toFixed(1)) }}
          >
            {(r.taxRate * 100).toFixed(1)}%
          </span>
        ),
    },
    { key: 'effectiveDate', title: '生效日期', width: '110px', render: (_, r) => formatDate(r.effectiveDate) },
    {
      key: 'hsCode',
      title: '操作',
      width: '80px',
      render: (_, r) => (
        <button onClick={() => handleDelete(r.hsCode)} className="text-danger hover:text-red-600 transition-colors">
          <Trash2 size={16} />
        </button>
      ),
    },
  ]

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-4">
        <div className="relative flex-1 max-w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchHs}
            onChange={(e) => { setSearchHs(e.target.value); setPage(1) }}
            placeholder="搜索HS编码"
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowImport(!showImport)} className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <Upload size={16} /> 导入
          </button>
          <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors">
            <Plus size={16} /> 新增
          </button>
        </div>
      </div>

      {showImport && (
        <div className="card mb-4">
          <FileUpload onUpload={taxRateApi.importRates} title="上传退税率CSV文件" />
        </div>
      )}

      {showAdd && (
        <div className="card mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">新增退税率</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <input value={newRate.hsCode} onChange={(e) => setNewRate({ ...newRate, hsCode: e.target.value })} placeholder="HS编码" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            <input value={newRate.productName} onChange={(e) => setNewRate({ ...newRate, productName: e.target.value })} placeholder="商品名称" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            <input value={newRate.taxRate} onChange={(e) => setNewRate({ ...newRate, taxRate: e.target.value })} placeholder="退税率(%)" type="number" step="0.1" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            <input value={newRate.category} onChange={(e) => setNewRate({ ...newRate, category: e.target.value })} placeholder="类别" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            <div className="flex gap-2">
              <input value={newRate.effectiveDate} onChange={(e) => setNewRate({ ...newRate, effectiveDate: e.target.value })} placeholder="生效日期" type="date" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <button onClick={handleAdd} className="px-3 py-2 bg-primary-500 text-white rounded-lg text-sm">确定</button>
            </div>
          </div>
        </div>
      )}

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
