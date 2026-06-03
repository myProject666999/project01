import { useEffect, useState } from 'react'
import { FileText, Receipt, Link2, DollarSign, ArrowRight } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import StatCard from '@/components/StatCard'
import { statsApi, type DashboardData, type MatchingStatusItem, type TodoItem } from '@/api'
import { formatMoney, formatDate } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#6B7280']

const mockDashboard: DashboardData = {
  customsCount: 128,
  invoiceCount: 256,
  matchedCount: 98,
  totalRebateAmount: 1256800.5,
  todoItems: [
    { id: 1, title: '3笔异常匹配待确认', type: 'matching', createdAt: '2026-06-03T10:00:00' },
    { id: 2, title: '5月申报表待提交', type: 'declaration', createdAt: '2026-06-02T14:30:00' },
    { id: 3, title: '2笔报关单未匹配发票', type: 'matching', createdAt: '2026-06-01T09:15:00' },
  ],
  matchingStatus: [
    { name: '匹配成功', value: 98, color: '#10B981' },
    { name: '异常匹配', value: 12, color: '#F59E0B' },
    { name: '未匹配', value: 18, color: '#6B7280' },
  ],
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState<DashboardData>(mockDashboard)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    statsApi
      .getDashboard()
      .then(setData)
      .catch(() => setData(mockDashboard))
      .finally(() => setLoading(false))
  }, [])

  const todoTypeRoute: Record<string, string> = {
    matching: '/matching',
    declaration: '/declarations',
    customs: '/documents/customs',
    invoice: '/documents/invoices',
  }

  return (
    <div className="page-container">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="报关单总数"
          value={data.customsCount}
          icon={FileText}
          color="blue"
          trend={{ value: 12, label: '较上月' }}
        />
        <StatCard
          title="发票总数"
          value={data.invoiceCount}
          icon={Receipt}
          color="green"
          trend={{ value: 8, label: '较上月' }}
        />
        <StatCard
          title="已匹配数"
          value={data.matchedCount}
          icon={Link2}
          color="orange"
          trend={{ value: 15, label: '较上月' }}
        />
        <StatCard
          title="应退税额"
          value={formatMoney(data.totalRebateAmount)}
          icon={DollarSign}
          color="purple"
          trend={{ value: 5, label: '较上月' }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-1">
          <h3 className="text-base font-semibold text-gray-800 mb-4">待办事项</h3>
          <div className="space-y-3">
            {data.todoItems.map((item: TodoItem) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => navigate(todoTypeRoute[item.type] || '/')}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate">{item.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(item.createdAt, 'MM-DD HH:mm')}</p>
                </div>
                <ArrowRight size={14} className="text-gray-400 shrink-0 ml-2" />
              </div>
            ))}
            {data.todoItems.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">暂无待办事项</p>
            )}
          </div>
        </div>

        <div className="card lg:col-span-2">
          <h3 className="text-base font-semibold text-gray-800 mb-4">匹配状态分布</h3>
          {loading ? (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data.matchingStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="name"
                >
                  {data.matchingStatus.map((_: MatchingStatusItem, index: number) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value} 笔`, '数量']}
                  contentStyle={{ borderRadius: '8px', fontSize: '13px' }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => <span className="text-sm text-gray-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
