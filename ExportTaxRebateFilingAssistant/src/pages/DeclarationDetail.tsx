import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Printer, Send, ArrowLeft } from 'lucide-react'
import { declarationApi, type Declaration, type DeclarationDetail } from '@/api'
import { formatMoney, formatDate } from '@/lib/utils'

export default function DeclarationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [declaration, setDeclaration] = useState<Declaration | null>(null)
  const [items, setItems] = useState<DeclarationDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      declarationApi.get(Number(id)),
      declarationApi.getDetails(Number(id)),
    ])
      .then(([decl, details]) => {
        setDeclaration(decl)
        setItems(details)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async () => {
    if (!declaration) return
    if (!confirm('确定提交该申报表？提交后不可修改。')) return
    setSubmitting(true)
    try {
      await declarationApi.submit(declaration.id)
      setDeclaration({ ...declaration, status: 'SUBMITTED' })
    } catch (err) {
      alert((err as Error).message || '提交失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePrint = () => window.print()

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!declaration) {
    return (
      <div className="page-container">
        <p className="text-gray-400">未找到该申报表</p>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-4 no-print">
        <button onClick={() => navigate('/declarations')} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
          <ArrowLeft size={16} /> 返回列表
        </button>
        <div className="flex items-center gap-2">
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <Printer size={16} /> 打印
          </button>
          {declaration.status === 'DRAFT' && (
            <button onClick={handleSubmit} disabled={submitting} className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors">
              <Send size={16} /> {submitting ? '提交中...' : '提交申报'}
            </button>
          )}
        </div>
      </div>

      <div className="print-area bg-white shadow-sm border border-gray-100 rounded-lg p-8 max-w-[900px] mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-gray-900 mb-1">出口货物退（免）税申报表</h1>
          <p className="text-sm text-gray-500">申报月份：{declaration.period}</p>
        </div>

        <div className="mb-6 text-sm text-gray-600">
          <div className="grid grid-cols-2 gap-2">
            <span>申报编号：{declaration.declarationNo}</span>
            <span>申报日期：{formatDate(declaration.createdAt)}</span>
          </div>
        </div>

        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-3 py-2 text-left font-medium">序号</th>
              <th className="border border-gray-300 px-3 py-2 text-left font-medium">HS编码</th>
              <th className="border border-gray-300 px-3 py-2 text-left font-medium">商品名称</th>
              <th className="border border-gray-300 px-3 py-2 text-right font-medium">发票金额</th>
              <th className="border border-gray-300 px-3 py-2 text-right font-medium">退税率</th>
              <th className="border border-gray-300 px-3 py-2 text-right font-medium">应退税额</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id}>
                <td className="border border-gray-300 px-3 py-2">{index + 1}</td>
                <td className="border border-gray-300 px-3 py-2">{item.hsCode}</td>
                <td className="border border-gray-300 px-3 py-2">{item.productName}</td>
                <td className="border border-gray-300 px-3 py-2 text-right">{formatMoney(item.invoiceAmount)}</td>
                <td className="border border-gray-300 px-3 py-2 text-right">{(item.taxRate * 100).toFixed(1)}%</td>
                <td className="border border-gray-300 px-3 py-2 text-right">{formatMoney(item.taxAmount)}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="border border-gray-300 px-3 py-8 text-center text-gray-400">
                  暂无明细数据
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-semibold">
              <td className="border border-gray-300 px-3 py-2" colSpan={3}>合计</td>
              <td className="border border-gray-300 px-3 py-2 text-right">{formatMoney(declaration.totalAmount)}</td>
              <td className="border border-gray-300 px-3 py-2"></td>
              <td className="border border-gray-300 px-3 py-2 text-right">{formatMoney(declaration.totalTaxAmount)}</td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-8 text-sm text-gray-500 flex justify-between">
          <span>制表人：__________</span>
          <span>审核人：__________</span>
          <span>日期：__________</span>
        </div>
      </div>
    </div>
  )
}
