import { useEffect, useState } from 'react'
import { Link2, ArrowRight } from 'lucide-react'
import { matchingApi, type CustomsDeclaration, type VatInvoice } from '@/api'
import { formatMoney, formatDate, cn } from '@/lib/utils'

export default function ManualMatching() {
  const [customsList, setCustomsList] = useState<CustomsDeclaration[]>([])
  const [invoiceList, setInvoiceList] = useState<VatInvoice[]>([])
  const [selectedCustoms, setSelectedCustoms] = useState<CustomsDeclaration | null>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<VatInvoice | null>(null)
  const [matching, setMatching] = useState(false)

  useEffect(() => {
    matchingApi
      .getUnmatchedCustoms()
      .then(setCustomsList)
      .catch(() => {})

    matchingApi
      .getUnmatchedInvoices()
      .then(setInvoiceList)
      .catch(() => {})
  }, [])

  const handleMatch = async () => {
    if (!selectedCustoms || !selectedInvoice) return
    setMatching(true)
    try {
      await matchingApi.manualMatch(selectedCustoms.id, selectedInvoice.id)
      alert('配对成功')
      setCustomsList((prev) => prev.filter((c) => c.id !== selectedCustoms.id))
      setInvoiceList((prev) => prev.filter((i) => i.id !== selectedInvoice.id))
      setSelectedCustoms(null)
      setSelectedInvoice(null)
    } catch (err) {
      alert((err as Error).message || '配对失败')
    } finally {
      setMatching(false)
    }
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">手动匹配</h2>
        <button
          onClick={handleMatch}
          disabled={!selectedCustoms || !selectedInvoice || matching}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Link2 size={16} />
          {matching ? '配对中...' : '配对'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">未匹配报关单</h3>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {customsList.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedCustoms(selectedCustoms?.id === item.id ? null : item)}
                className={cn(
                  'p-3 rounded-lg border cursor-pointer transition-colors',
                  selectedCustoms?.id === item.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-gray-800">{item.declarationNo}</span>
                  <span className="text-xs text-gray-400">{formatDate(item.exportDate)}</span>
                </div>
                <p className="text-sm text-gray-600 truncate">{item.productName}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span>HS: {item.hsCode}</span>
                  <span>{item.quantity} {item.unit}</span>
                  <span>{formatMoney(item.amountCny)}</span>
                </div>
              </div>
            ))}
            {customsList.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-8">暂无未匹配报关单</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">未匹配发票</h3>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {invoiceList.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedInvoice(selectedInvoice?.id === item.id ? null : item)}
                className={cn(
                  'p-3 rounded-lg border cursor-pointer transition-colors',
                  selectedInvoice?.id === item.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-gray-800">{item.invoiceNo}</span>
                  <span className="text-xs text-gray-400">{formatDate(item.invoiceDate)}</span>
                </div>
                <p className="text-sm text-gray-600 truncate">{item.productName}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span>税额: {formatMoney(item.taxAmount)}</span>
                  <span>{item.quantity} {item.unit}</span>
                  <span>{formatMoney(item.amount)}</span>
                </div>
              </div>
            ))}
            {invoiceList.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-8">暂无未匹配发票</p>
            )}
          </div>
        </div>
      </div>

      {selectedCustoms && selectedInvoice && (
        <div className="card mt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">对比详情</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">报关单</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">商品名称</span><span className="text-gray-800">{selectedCustoms.productName}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">HS编码</span><span className="text-gray-800">{selectedCustoms.hsCode}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">数量</span><span className="text-gray-800">{selectedCustoms.quantity} {selectedCustoms.unit}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">金额</span><span className="text-gray-800">{formatMoney(selectedCustoms.amountCny)}</span></div>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">发票</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">商品名称</span><span className="text-gray-800">{selectedInvoice.productName}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">发票代码</span><span className="text-gray-800">{selectedInvoice.invoiceCode}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">数量</span><span className="text-gray-800">{selectedInvoice.quantity} {selectedInvoice.unit}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">金额</span><span className="text-gray-800">{formatMoney(selectedInvoice.amount)}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
