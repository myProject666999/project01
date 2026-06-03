<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { FileSpreadsheet, Download, Calendar, Search, Eye, X, ChevronRight } from 'lucide-vue-next'
import type { MonthlyReport } from '../../../shared/types'
import { http } from '@/utils/request'

const reports = ref<MonthlyReport[]>([])
const selectedReport = ref<MonthlyReport | null>(null)
const loading = ref(false)
const generating = ref(false)
const showDetailModal = ref(false)
const selectedMonth = ref(new Date().toISOString().slice(0, 7))

const monthOptions = computed(() => {
  const options: string[] = []
  const now = new Date()
  for (let i = 0; i < 24; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    options.push(date.toISOString().slice(0, 7))
  }
  return options
})

const fetchReports = async () => {
  loading.value = true
  try {
    const res = await http.get<MonthlyReport[]>('/reports/monthly')
    if (res.success && res.data) {
      reports.value = res.data
    }
  } catch (e) {
    console.error('Failed to fetch reports:', e)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const formatMonth = (monthStr: string) => {
  const [year, month] = monthStr.split('-')
  return `${year}年${Number(month)}月`
}

const handleGenerateReport = async () => {
  if (!selectedMonth.value) return
  
  generating.value = true
  try {
    const res = await http.post<MonthlyReport>('/reports/monthly/generate', {
      reportMonth: selectedMonth.value
    })
    if (res.success) {
      await fetchReports()
    }
  } catch (e) {
    console.error('Failed to generate report:', e)
  } finally {
    generating.value = false
  }
}

const handleViewDetail = async (report: MonthlyReport) => {
  try {
    const res = await http.get<MonthlyReport>(`/reports/monthly/${report.id}`)
    if (res.success && res.data) {
      selectedReport.value = res.data
      showDetailModal.value = true
    }
  } catch (e) {
    console.error('Failed to fetch report detail:', e)
  }
}

const handleExportExcel = async (report: MonthlyReport) => {
  try {
    const token = localStorage.getItem('token')
    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(`/reports/monthly/${report.id}/export`, {
      headers
    })
    
    if (!response.ok) {
      throw new Error('导出失败')
    }
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `报废车辆拆解报表_${report.reportMonth}.xlsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  } catch (e) {
    console.error('Failed to export report:', e)
    alert('导出失败，请重试')
  }
}

onMounted(() => {
  fetchReports()
})
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">数据报送</h1>
        <p class="text-gray-500 mt-1">生成和管理报废车辆拆解月度报表</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <Calendar class="w-4 h-4 text-gray-400" />
          <select
            v-model="selectedMonth"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option v-for="month in monthOptions" :key="month" :value="month">
              {{ formatMonth(month) }}
            </option>
          </select>
        </div>
        <button
          @click="handleGenerateReport"
          :disabled="generating"
          class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileSpreadsheet v-if="!generating" class="w-5 h-5" />
          <svg v-else class="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {{ generating ? '生成中...' : '生成报表' }}
        </button>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100">
      <div class="p-4 border-b border-gray-100">
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <Search class="w-4 h-4" />
          共 {{ reports.length }} 条报表记录
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">月份</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">拆解车辆数</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">总重量(kg)</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">可回收重量(kg)</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">危废重量(kg)</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">五大总成数量</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">生成时间</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="loading">
              <td colspan="8" class="px-6 py-12 text-center text-gray-400">
                加载中...
              </td>
            </tr>
            <tr v-else-if="reports.length === 0">
              <td colspan="8" class="px-6 py-12 text-center text-gray-400">
                暂无报表记录，请先生成报表
              </td>
            </tr>
            <tr v-for="report in reports" :key="report.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="font-medium text-gray-900">{{ formatMonth(report.reportMonth) }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600">
                {{ report.totalVehicles }} 辆
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600">
                {{ report.totalWeight.toFixed(2) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600">
                {{ report.reusableWeight.toFixed(2) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600">
                {{ report.hazardousWeight.toFixed(2) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600">
                {{ report.majorAssembliesCount }} 件
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600">
                {{ formatDate(report.generatedAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="handleViewDetail(report)"
                    class="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <Eye class="w-4 h-4" />
                    查看详情
                  </button>
                  <button
                    @click="handleExportExcel(report)"
                    class="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors"
                  >
                    <Download class="w-4 h-4" />
                    导出Excel
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showDetailModal && selectedReport" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div class="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">报表详情</h3>
            <p class="text-sm text-gray-500 mt-1">{{ formatMonth(selectedReport.reportMonth) }} 报废车辆拆解统计</p>
          </div>
          <button @click="showDetailModal = false" class="p-1 hover:bg-gray-100 rounded-md transition-colors">
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div class="p-6 overflow-y-auto flex-1 space-y-6">
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div class="bg-blue-50 rounded-lg p-4">
              <div class="text-sm text-blue-600 font-medium">拆解车辆数</div>
              <div class="mt-2 text-2xl font-bold text-blue-700">{{ selectedReport.totalVehicles }} 辆</div>
            </div>
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="text-sm text-gray-600 font-medium">总重量</div>
              <div class="mt-2 text-2xl font-bold text-gray-700">{{ selectedReport.totalWeight.toFixed(2) }} kg</div>
            </div>
            <div class="bg-green-50 rounded-lg p-4">
              <div class="text-sm text-green-600 font-medium">可回收重量</div>
              <div class="mt-2 text-2xl font-bold text-green-700">{{ selectedReport.reusableWeight.toFixed(2) }} kg</div>
            </div>
            <div class="bg-red-50 rounded-lg p-4">
              <div class="text-sm text-red-600 font-medium">危废重量</div>
              <div class="mt-2 text-2xl font-bold text-red-700">{{ selectedReport.hazardousWeight.toFixed(2) }} kg</div>
            </div>
            <div class="bg-purple-50 rounded-lg p-4">
              <div class="text-sm text-purple-600 font-medium">五大总成数量</div>
              <div class="mt-2 text-2xl font-bold text-purple-700">{{ selectedReport.majorAssembliesCount }} 件</div>
            </div>
            <div class="bg-amber-50 rounded-lg p-4">
              <div class="text-sm text-amber-600 font-medium">可回收率</div>
              <div class="mt-2 text-2xl font-bold text-amber-700">
                {{ selectedReport.totalWeight > 0 ? ((selectedReport.reusableWeight / selectedReport.totalWeight) * 100).toFixed(1) : 0 }}%
              </div>
            </div>
          </div>

          <div class="border border-gray-200 rounded-lg overflow-hidden">
            <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h4 class="font-medium text-gray-900">统计明细</h4>
            </div>
            <div class="divide-y divide-gray-100">
              <div class="px-4 py-3 flex items-center justify-between">
                <span class="text-gray-600">报表月份</span>
                <span class="font-medium text-gray-900">{{ formatMonth(selectedReport.reportMonth) }}</span>
              </div>
              <div class="px-4 py-3 flex items-center justify-between">
                <span class="text-gray-600">拆解车辆数</span>
                <span class="font-medium text-gray-900">{{ selectedReport.totalVehicles }} 辆</span>
              </div>
              <div class="px-4 py-3 flex items-center justify-between">
                <span class="text-gray-600">总拆解重量</span>
                <span class="font-medium text-gray-900">{{ selectedReport.totalWeight.toFixed(2) }} kg</span>
              </div>
              <div class="px-4 py-3 flex items-center justify-between">
                <span class="text-gray-600">可回收利用重量</span>
                <span class="font-medium text-green-600">{{ selectedReport.reusableWeight.toFixed(2) }} kg</span>
              </div>
              <div class="px-4 py-3 flex items-center justify-between">
                <span class="text-gray-600">危险废弃物重量</span>
                <span class="font-medium text-red-600">{{ selectedReport.hazardousWeight.toFixed(2) }} kg</span>
              </div>
              <div class="px-4 py-3 flex items-center justify-between">
                <span class="text-gray-600">可回收利用率</span>
                <span class="font-medium text-blue-600">
                  {{ selectedReport.totalWeight > 0 ? ((selectedReport.reusableWeight / selectedReport.totalWeight) * 100).toFixed(1) : 0 }}%
                </span>
              </div>
              <div class="px-4 py-3 flex items-center justify-between">
                <span class="text-gray-600">五大总成拆解数量</span>
                <span class="font-medium text-gray-900">{{ selectedReport.majorAssembliesCount }} 件</span>
              </div>
              <div class="px-4 py-3 flex items-center justify-between">
                <span class="text-gray-600">生成时间</span>
                <span class="font-medium text-gray-900">{{ formatDate(selectedReport.generatedAt) }}</span>
              </div>
            </div>
          </div>

          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-start gap-3">
              <ChevronRight class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <div class="text-sm font-medium text-blue-900">说明</div>
                <div class="text-sm text-blue-700 mt-1">
                  <p>1. 可回收重量包括可再利用的金属、塑料等材料重量</p>
                  <p>2. 危废重量包括机油、防冻液、铅酸电池等危险废弃物重量</p>
                  <p>3. 五大总成包括发动机、变速器、车架、转向器、前后桥</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button
            @click="showDetailModal = false"
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            关闭
          </button>
          <button
            @click="handleExportExcel(selectedReport)"
            class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download class="w-4 h-4" />
            导出Excel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
