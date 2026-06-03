<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Play, Check, Plus, AlertTriangle, Package, Recycle, Trash2 } from 'lucide-vue-next'
import type { DismantlingTask, DismantlingPart, MajorAssemblyType } from '../../../shared/types'
import { http } from '@/utils/request'

const route = useRoute()
const router = useRouter()
const taskId = Number(route.params.id)

const task = ref<DismantlingTask | null>(null)
const loading = ref(false)
const showAddForm = ref(false)

const majorAssemblyOptions: { value: MajorAssemblyType; label: string }[] = [
  { value: 'none', label: '否' },
  { value: 'engine', label: '发动机' },
  { value: 'transmission', label: '变速箱' },
  { value: 'frame', label: '车架' },
  { value: 'front_axle', label: '前桥' },
  { value: 'rear_axle', label: '后桥' },
  { value: 'steering', label: '转向器' }
]

const newPart = ref({
  name: '',
  category: '',
  weight: 0,
  isReusable: false,
  isHazardous: false,
  isMajorAssembly: false,
  majorAssemblyType: 'none' as MajorAssemblyType
})

const dismantlingSteps = [
  { key: 'preparation', label: '前期准备', desc: '车辆登记、安全检查' },
  { key: 'fluid_drain', label: '废液抽取', desc: '机油、防冻液、燃油等' },
  { key: 'hazardous', label: '危废拆除', desc: '电池、安全气囊等' },
  { key: 'major', label: '五大总成', desc: '发动机、变速箱、车架等' },
  { key: 'reusable', label: '可再利用件', desc: '可用零部件拆除' },
  { key: 'shredding', label: '破碎处理', desc: '剩余车体破碎' }
]

const statusMap = {
  pending: { label: '待开始', class: 'bg-gray-100 text-gray-600' },
  in_progress: { label: '进行中', class: 'bg-blue-100 text-blue-600' },
  completed: { label: '已完成', class: 'bg-green-100 text-green-600' }
}

const partStatusMap = {
  pending: { label: '待拆解', class: 'bg-gray-100 text-gray-600' },
  dismantled: { label: '已拆解', class: 'bg-blue-100 text-blue-600' },
  stocked: { label: '已入库', class: 'bg-green-100 text-green-600' },
  disposed: { label: '已处置', class: 'bg-red-100 text-red-600' }
}

const majorAssemblyLabel = computed(() => {
  const opt = majorAssemblyOptions.find(o => o.value === newPart.value.majorAssemblyType)
  return opt?.label || '否'
})

const fetchTask = async () => {
  loading.value = true
  try {
    const res = await http.get<DismantlingTask>(`/dismantling/${taskId}`)
    if (res.success && res.data) {
      task.value = res.data
    }
  } catch (e) {
    console.error('Failed to fetch task:', e)
  } finally {
    loading.value = false
  }
}

const handleStartDismantling = async () => {
  try {
    const res = await http.put<DismantlingTask>(`/dismantling/${taskId}/start`)
    if (res.success) {
      fetchTask()
    }
  } catch (e) {
    console.error('Failed to start dismantling:', e)
  }
}

const handleCompleteDismantling = async () => {
  if (!confirm('确认完成拆解任务？完成后将无法继续添加零件。')) return
  try {
    const res = await http.put<DismantlingTask>(`/dismantling/${taskId}/complete`)
    if (res.success) {
      fetchTask()
    }
  } catch (e) {
    console.error('Failed to complete dismantling:', e)
  }
}

const handleAddPart = async () => {
  if (!newPart.value.name || !newPart.value.weight) {
    alert('请填写零件名称和重量')
    return
  }
  try {
    const res = await http.post<DismantlingPart>(`/dismantling/${taskId}/parts`, newPart.value)
    if (res.success) {
      showAddForm.value = false
      newPart.value = {
        name: '',
        category: '',
        weight: 0,
        isReusable: false,
        isHazardous: false,
        isMajorAssembly: false,
        majorAssemblyType: 'none'
      }
      fetchTask()
    }
  } catch (e) {
    console.error('Failed to add part:', e)
  }
}

const handleMajorAssemblyChange = (value: MajorAssemblyType) => {
  newPart.value.majorAssemblyType = value
  newPart.value.isMajorAssembly = value !== 'none'
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

const getStepStatus = (index: number) => {
  if (!task.value) return 'pending'
  if (task.value.status === 'completed') return 'completed'
  if (task.value.status === 'in_progress') {
    return index <= 2 ? 'completed' : 'in_progress'
  }
  return 'pending'
}

onMounted(() => {
  fetchTask()
})
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto">
    <div class="flex items-center gap-4 mb-6">
      <button @click="router.back()" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
        <ArrowLeft class="w-5 h-5 text-gray-600" />
      </button>
      <div class="flex-1">
        <h1 class="text-2xl font-bold text-gray-900">拆解作业详情</h1>
        <p class="text-gray-500 mt-1">任务编号: #{{ taskId }}</p>
      </div>
      <div class="flex gap-3">
        <button
          v-if="task?.status === 'pending'"
          @click="handleStartDismantling"
          class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Play class="w-5 h-5" />
          开始拆解
        </button>
        <button
          v-if="task?.status === 'in_progress'"
          @click="handleCompleteDismantling"
          class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Check class="w-5 h-5" />
          完成拆解
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12 text-gray-400">加载中...</div>

    <div v-else-if="task" class="space-y-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">车辆基本信息</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p class="text-sm text-gray-500 mb-1">车牌号</p>
            <p class="font-semibold text-gray-900">{{ task.vehicle?.plateNumber || '-' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 mb-1">VIN 码</p>
            <p class="font-mono text-sm text-gray-900">{{ task.vehicle?.vin || '-' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 mb-1">车主</p>
            <p class="text-gray-900">{{ task.vehicle?.owner || '-' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 mb-1">状态</p>
            <span :class="['inline-flex px-2.5 py-1 rounded-full text-xs font-medium', statusMap[task.status].class]">
              {{ statusMap[task.status].label }}
            </span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">拆解步骤</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div
            v-for="(step, index) in dismantlingSteps"
            :key="step.key"
            class="relative p-4 rounded-lg border-2 transition-colors"
            :class="{
              'border-green-500 bg-green-50': getStepStatus(index) === 'completed',
              'border-blue-500 bg-blue-50': getStepStatus(index) === 'in_progress',
              'border-gray-200 bg-gray-50': getStepStatus(index) === 'pending'
            }"
          >
            <div
              class="absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              :class="{
                'bg-green-500 text-white': getStepStatus(index) === 'completed',
                'bg-blue-500 text-white': getStepStatus(index) === 'in_progress',
                'bg-gray-300 text-gray-600': getStepStatus(index) === 'pending'
              }"
            >
              <Check v-if="getStepStatus(index) === 'completed'" class="w-4 h-4" />
              <span v-else>{{ index + 1 }}</span>
            </div>
            <p class="font-medium text-gray-900 mt-2">{{ step.label }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ step.desc }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">已拆解零件</h2>
          <button
            v-if="task.status === 'in_progress'"
            @click="showAddForm = !showAddForm"
            class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus class="w-5 h-5" />
            新增零件
          </button>
        </div>

        <div v-if="showAddForm" class="p-6 bg-gray-50 border-b border-gray-100">
          <h3 class="font-medium text-gray-900 mb-4">添加拆解零件</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">零件名称 *</label>
              <input
                v-model="newPart.name"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="请输入零件名称"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">分类</label>
              <input
                v-model="newPart.category"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="如：发动机配件"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">重量 (kg) *</label>
              <input
                v-model.number="newPart.weight"
                type="number"
                step="0.01"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="0.00"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">是否可再利用</label>
              <label class="flex items-center gap-2 cursor-pointer mt-2">
                <input v-model="newPart.isReusable" type="checkbox" class="w-4 h-4 text-blue-600 rounded" />
                <span class="text-gray-700">是</span>
              </label>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">是否危废</label>
              <label class="flex items-center gap-2 cursor-pointer mt-2">
                <input v-model="newPart.isHazardous" type="checkbox" class="w-4 h-4 text-red-600 rounded" />
                <span class="text-gray-700">是</span>
              </label>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">五大总成</label>
              <select
                :value="newPart.majorAssemblyType"
                @change="handleMajorAssemblyChange(($event.target as HTMLSelectElement).value as MajorAssemblyType)"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option v-for="opt in majorAssemblyOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
          </div>
          <div class="flex gap-3 mt-4">
            <button
              @click="handleAddPart"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              确认添加
            </button>
            <button
              @click="showAddForm = false"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              取消
            </button>
          </div>
        </div>

        <div class="divide-y divide-gray-100">
          <div v-if="!task.parts || task.parts.length === 0" class="p-8 text-center text-gray-400">
            暂无拆解零件
          </div>
          <div v-for="part in task.parts" :key="part.id" class="p-4 hover:bg-gray-50 transition-colors">
            <div class="flex items-start justify-between">
              <div class="flex items-start gap-3">
                <div
                  class="p-2 rounded-lg"
                  :class="{
                    'bg-yellow-100': part.isMajorAssembly,
                    'bg-green-100': part.isReusable && !part.isMajorAssembly,
                    'bg-red-100': part.isHazardous && !part.isReusable && !part.isMajorAssembly,
                    'bg-gray-100': !part.isMajorAssembly && !part.isReusable && !part.isHazardous
                  }"
                >
                  <AlertTriangle v-if="part.isMajorAssembly" class="w-5 h-5 text-yellow-600" />
                  <Recycle v-else-if="part.isReusable" class="w-5 h-5 text-green-600" />
                  <Trash2 v-else-if="part.isHazardous" class="w-5 h-5 text-red-600" />
                  <Package v-else class="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-medium text-gray-900">{{ part.name }}</span>
                    <span v-if="part.isMajorAssembly" class="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                      {{ majorAssemblyOptions.find(o => o.value === part.majorAssemblyType)?.label }}
                    </span>
                    <span v-if="part.isHazardous" class="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                      危废
                    </span>
                    <span v-if="part.isReusable" class="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                      可再利用
                    </span>
                  </div>
                  <div class="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span>{{ part.category || '未分类' }}</span>
                    <span>{{ part.weight }} kg</span>
                    <span>{{ formatDate(part.dismantledAt) }}</span>
                  </div>
                </div>
              </div>
              <span :class="['inline-flex px-2.5 py-1 rounded-full text-xs font-medium', partStatusMap[part.status].class]">
                {{ partStatusMap[part.status].label }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
