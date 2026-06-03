import { ReactNode } from 'react'
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Column<T> {
  key: string
  title: string
  width?: string
  render?: (value: unknown, record: T, index: number) => ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  pagination?: {
    page: number
    size: number
    total: number
  }
  onPageChange?: (page: number) => void
  rowKey?: string
}

export default function DataTable<T>({
  columns,
  data,
  loading = false,
  pagination,
  onPageChange,
  rowKey = 'id',
}: DataTableProps<T>) {
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.size) : 1

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap"
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    <span>加载中...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <Inbox size={40} className="text-gray-300" />
                    <span>暂无数据</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((record, index) => (
                <tr
                  key={String((record as Record<string, unknown>)[rowKey] ?? index)}
                  className={cn(
                    'border-b border-gray-50 transition-colors',
                    index % 2 === 1 ? 'bg-gray-50/50' : 'bg-white',
                    'hover:bg-primary-50'
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {col.render
                        ? col.render((record as Record<string, unknown>)[col.key], record, index)
                        : String((record as Record<string, unknown>)[col.key] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <span className="text-sm text-gray-500">
            共 {pagination.total} 条，第 {pagination.page + 1}/{totalPages} 页
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page <= 0}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                pagination.page <= 0
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-500 hover:bg-gray-100'
              )}
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number
              if (totalPages <= 5) {
                pageNum = i
              } else if (pagination.page < 3) {
                pageNum = i
              } else if (pagination.page > totalPages - 4) {
                pageNum = totalPages - 5 + i
              } else {
                pageNum = pagination.page - 2 + i
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange?.(pageNum)}
                  className={cn(
                    'w-8 h-8 rounded-lg text-sm transition-colors',
                    pageNum === pagination.page
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  {pageNum + 1}
                </button>
              )
            })}
            <button
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page >= totalPages - 1}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                pagination.page >= totalPages - 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-500 hover:bg-gray-100'
              )}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
