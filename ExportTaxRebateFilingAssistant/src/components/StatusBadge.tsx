import { cn } from '@/lib/utils'

type StatusType = 'MATCHED' | 'SUSPECTED' | 'UNMATCHED' | 'PENDING' | 'DRAFT' | 'SUBMITTED' | 'REVIEWING' | 'APPROVED' | 'REJECTED' | 'CONFIRMED'

const statusConfig: Record<string, { label: string; className: string }> = {
  MATCHED: { label: '匹配成功', className: 'bg-green-100 text-green-700' },
  SUSPECTED: { label: '异常匹配', className: 'bg-yellow-100 text-yellow-700' },
  UNMATCHED: { label: '未匹配', className: 'bg-orange-100 text-orange-700' },
  PENDING: { label: '待处理', className: 'bg-orange-100 text-orange-700' },
  CONFIRMED: { label: '已确认', className: 'bg-green-100 text-green-700' },
  DRAFT: { label: '草稿', className: 'bg-gray-100 text-gray-600' },
  SUBMITTED: { label: '已提交', className: 'bg-blue-100 text-blue-700' },
  REVIEWING: { label: '审核中', className: 'bg-yellow-100 text-yellow-700' },
  APPROVED: { label: '审核通过', className: 'bg-green-100 text-green-700' },
  REJECTED: { label: '审核退回', className: 'bg-red-100 text-red-700' },
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-600' }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}

export { statusConfig }
