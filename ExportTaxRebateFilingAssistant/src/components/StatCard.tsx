import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: { value: number; label: string }
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple'
}

const colorMap = {
  blue: 'from-primary-500 to-primary-700',
  green: 'from-emerald-500 to-emerald-700',
  orange: 'from-amber-500 to-orange-600',
  red: 'from-rose-500 to-rose-700',
  purple: 'from-violet-500 to-violet-700',
}

export default function StatCard({ title, value, icon: Icon, trend, color = 'blue' }: StatCardProps) {
  return (
    <div className={cn('stat-card bg-gradient-to-br', colorMap[color])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-white/80 mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2 text-xs text-white/80">
              {trend.value >= 0 ? (
                <TrendingUp size={14} className="text-white/90" />
              ) : (
                <TrendingDown size={14} className="text-white/90" />
              )}
              <span>
                {trend.value >= 0 ? '+' : ''}
                {trend.value}% {trend.label}
              </span>
            </div>
          )}
        </div>
        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
          <Icon size={22} className="text-white" />
        </div>
      </div>
    </div>
  )
}
