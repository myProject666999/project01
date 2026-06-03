import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { matchingApi, type MatchingRules as MatchingRulesType } from '@/api'

const defaultRules: MatchingRulesType = {
  id: 0,
  ruleName: '默认规则',
  nameSimilarityThreshold: 0.70,
  amountToleranceRate: 0.05,
  quantityToleranceRate: 0.05,
  enabled: true,
  createdAt: '',
  updatedAt: '',
}

export default function MatchingRules() {
  const [rules, setRules] = useState<MatchingRulesType>(defaultRules)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    matchingApi
      .getRules()
      .then(setRules)
      .catch(() => setRules(defaultRules))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await matchingApi.updateRules(rules)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      alert((err as Error).message || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key: keyof MatchingRulesType, value: number) => {
    setRules((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  return (
    <div className="page-container">
      <div className="card max-w-2xl">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">匹配规则配置</h2>

        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">商品名相似度阈值</label>
              <span className="text-sm font-semibold text-primary-500">{(rules.nameSimilarityThreshold * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={rules.nameSimilarityThreshold}
              onChange={(e) => handleChange('nameSimilarityThreshold', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <div className="flex justify-between mt-1 text-xs text-gray-400">
              <span>0%</span>
              <span>推荐 70%</span>
              <span>100%</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">金额误差率</label>
              <span className="text-sm font-semibold text-primary-500">{(rules.amountToleranceRate * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={rules.amountToleranceRate}
              onChange={(e) => handleChange('amountToleranceRate', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <div className="flex justify-between mt-1 text-xs text-gray-400">
              <span>0%</span>
              <span>推荐 5%</span>
              <span>100%</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">数量误差率</label>
              <span className="text-sm font-semibold text-primary-500">{(rules.quantityToleranceRate * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={rules.quantityToleranceRate}
              onChange={(e) => handleChange('quantityToleranceRate', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <div className="flex justify-between mt-1 text-xs text-gray-400">
              <span>0%</span>
              <span>推荐 5%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors"
          >
            <Save size={16} />
            {saving ? '保存中...' : '保存规则'}
          </button>
          {saved && <span className="text-sm text-success">保存成功</span>}
        </div>
      </div>
    </div>
  )
}
