import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Clock, XCircle, Circle } from 'lucide-react'
import { declarationApi, type Declaration, type DeclarationProgressItem } from '@/api'
import { formatDate, cn } from '@/lib/utils'

const steps = [
  { name: '草稿' },
  { name: '已提交' },
  { name: '审核中' },
  { name: '审核通过' },
]

export default function DeclarationProgress() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [declaration, setDeclaration] = useState<Declaration | null>(null)
  const [progressList, setProgressList] = useState<DeclarationProgressItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      declarationApi.get(Number(id)),
      declarationApi.getProgress(Number(id)),
    ])
      .then(([decl, progress]) => {
        setDeclaration(decl)
        setProgressList(progress)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle size={24} className="text-success" />
      case 'REJECTED':
        return <XCircle size={24} className="text-danger" />
      case 'PENDING':
        return <Circle size={24} className="text-gray-300" />
      default:
        return <Clock size={24} className="text-yellow-500" />
    }
  }

  const currentStep = progressList.filter((p) => p.status === 'COMPLETED').length

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/declarations')} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
          <ArrowLeft size={16} /> 返回列表
        </button>
        {declaration && (
          <span className="text-sm text-gray-500">
            申报编号：{declaration.declarationNo}
          </span>
        )}
      </div>

      <div className="card max-w-2xl mx-auto">
        <h2 className="text-lg font-semibold text-gray-800 mb-8">申报进度</h2>

        <div className="flex items-center justify-between mb-10 px-4">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep
            const isCurrent = index === currentStep
            const isRejected = progressList[index]?.status === 'REJECTED'
            return (
              <div key={step.name} className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors',
                    isCompleted && !isRejected && 'bg-success border-success text-white',
                    isRejected && 'bg-danger border-danger text-white',
                    isCurrent && !isRejected && 'bg-primary-500 border-primary-500 text-white',
                    !isCompleted && !isCurrent && !isRejected && 'bg-white border-gray-300 text-gray-400'
                  )}
                >
                  {isCompleted && !isRejected ? <CheckCircle size={18} /> : isRejected ? <XCircle size={18} /> : index + 1}
                </div>
                <span className={cn('text-xs mt-2', isCurrent ? 'text-primary-500 font-medium' : 'text-gray-500')}>
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'absolute top-5 left-1/2 w-full h-0.5',
                      isCompleted ? 'bg-success' : 'bg-gray-200'
                    )}
                    style={{ width: 'calc(100% - 40px)', left: 'calc(50% + 20px)', position: 'relative', marginTop: '-28px', marginBottom: '28px' }}
                  />
                )}
              </div>
            )
          })}
        </div>

        <div className="space-y-4 mt-6">
          {progressList.map((item) => (
            <div
              key={item.id}
              className={cn(
                'flex items-start gap-4 p-4 rounded-lg border',
                item.status === 'COMPLETED' && 'bg-green-50 border-green-200',
                item.status === 'REJECTED' && 'bg-red-50 border-red-200',
                item.status === 'PENDING' && 'bg-gray-50 border-gray-200'
              )}
            >
              {getStepIcon(item.status)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800">{item.stepName}</span>
                  {item.operatedAt && (
                    <span className="text-xs text-gray-400">{formatDate(item.operatedAt, 'YYYY-MM-DD HH:mm')}</span>
                  )}
                </div>
                {item.operatorId && (
                  <p className="text-xs text-gray-500 mt-0.5">操作人：{item.operatorId}</p>
                )}
                {item.remark && (
                  <p className="text-sm text-gray-600 mt-1">{item.remark}</p>
                )}
              </div>
            </div>
          ))}

          {progressList.length === 0 && (
            <p className="text-center text-gray-400 py-8">暂无进度信息</p>
          )}
        </div>
      </div>
    </div>
  )
}
