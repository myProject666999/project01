<template>
  <div>
    <div class="bg-primary px-5 pt-12 pb-6 flex items-center gap-3">
      <button class="text-white" @click="router.back()">
        <ArrowLeft class="w-5 h-5" />
      </button>
      <h1 class="text-white text-lg font-bold truncate">{{ portName }}</h1>
    </div>

    <div class="px-4 mt-4 space-y-5 pb-6">
      <div class="flex bg-gray-100 rounded-lg p-1">
        <button
          class="flex-1 py-2 text-sm font-medium rounded-md transition-all"
          :class="vehicleType === 'CARGO' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'"
          @click="switchVehicleType('CARGO')"
        >
          货车
        </button>
        <button
          class="flex-1 py-2 text-sm font-medium rounded-md transition-all"
          :class="vehicleType === 'PASSENGER' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'"
          @click="switchVehicleType('PASSENGER')"
        >
          客车
        </button>
      </div>

      <div>
        <div class="text-sm font-medium text-gray-700 mb-2">选择日期</div>
        <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            v-for="d in dateOptions"
            :key="d.value"
            class="shrink-0 px-3 py-2 rounded-lg text-center transition-all border"
            :class="
              selectedDate === d.value
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-600 border-gray-200'
            "
            @click="selectDate(d.value)"
          >
            <div class="text-xs">{{ d.weekday }}</div>
            <div class="text-sm font-medium mt-0.5">{{ d.label }}</div>
          </button>
        </div>
      </div>

      <div>
        <div class="text-sm font-medium text-gray-700 mb-2">选择时段</div>
        <div v-if="loadingQuotas" class="text-center py-6 text-gray-400 text-sm">加载中...</div>
        <div v-else-if="quotas.length === 0" class="text-center py-6 text-gray-400 text-sm">
          暂无可选时段
        </div>
        <div v-else class="grid grid-cols-2 gap-2">
          <button
            v-for="q in quotas"
            :key="q.id"
            class="py-3 px-2 rounded-lg text-center border transition-all"
            :class="
              q.remaining <= 0
                ? 'bg-gray-50 border-gray-100 cursor-not-allowed'
                : selectedSlot === q.timeSlot
                  ? 'bg-primary/5 border-primary ring-1 ring-primary/30'
                  : 'bg-white border-gray-200 active:bg-gray-50'
            "
            :disabled="q.remaining <= 0"
            @click="selectSlot(q)"
          >
            <div
              class="text-sm font-medium"
              :class="q.remaining <= 0 ? 'text-gray-300 line-through' : selectedSlot === q.timeSlot ? 'text-primary' : 'text-gray-800'"
            >
              {{ q.timeSlot }}
            </div>
            <div
              class="text-xs mt-1"
              :class="q.remaining <= 0 ? 'text-gray-300' : 'text-primary'"
            >
              {{ q.remaining <= 0 ? '已满' : `剩余 ${q.remaining}` }}
            </div>
          </button>
        </div>
      </div>

      <div class="space-y-3">
        <div>
          <label class="text-sm font-medium text-gray-700 mb-1 block">车牌号</label>
          <input
            v-model="form.plateNumber"
            type="text"
            placeholder="请输入车牌号"
            class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700 mb-1 block">司机姓名</label>
          <input
            v-model="form.driverName"
            type="text"
            placeholder="请输入司机姓名"
            class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700 mb-1 block">手机号</label>
          <input
            v-model="form.driverPhone"
            type="tel"
            placeholder="请输入手机号"
            maxlength="11"
            class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <button
        class="w-full py-3 rounded-lg text-white font-medium text-base transition-all"
        :class="submitting ? 'bg-primary/60 cursor-not-allowed' : 'bg-primary active:bg-primary/90'"
        :disabled="submitting"
        @click="handleSubmit"
      >
        {{ submitting ? '提交中...' : '预约' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { getPortById, getQuotas, createAppointment, type QuotaDTO } from '@/utils/api'

const router = useRouter()
const route = useRoute()

const portId = Number(route.params.portId)
const portName = ref('')
const vehicleType = ref<'CARGO' | 'PASSENGER'>('CARGO')
const selectedDate = ref('')
const selectedSlot = ref('')
const selectedQuotaId = ref<number | null>(null)
const quotas = ref<QuotaDTO[]>([])
const loadingQuotas = ref(false)
const submitting = ref(false)

const form = reactive({
  plateNumber: '',
  driverName: '',
  driverPhone: '',
})

const dateOptions = computed(() => {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const result: { value: string; label: string; weekday: string }[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    result.push({
      value: `${d.getFullYear()}-${mm}-${dd}`,
      label: i === 0 ? '今天' : `${mm}/${dd}`,
      weekday: days[d.getDay()],
    })
  }
  return result
})

const switchVehicleType = (type: 'CARGO' | 'PASSENGER') => {
  vehicleType.value = type
  selectedSlot.value = ''
  selectedQuotaId.value = null
  fetchQuotas()
}

const selectDate = (date: string) => {
  selectedDate.value = date
  selectedSlot.value = ''
  selectedQuotaId.value = null
  fetchQuotas()
}

const selectSlot = (q: QuotaDTO) => {
  selectedSlot.value = q.timeSlot
  selectedQuotaId.value = q.id
}

const fetchQuotas = async () => {
  if (!selectedDate.value) return
  loadingQuotas.value = true
  quotas.value = []
  try {
    quotas.value = await getQuotas(portId, vehicleType.value, selectedDate.value)
  } catch {
    quotas.value = []
  } finally {
    loadingQuotas.value = false
  }
}

const handleSubmit = async () => {
  if (!selectedSlot.value) {
    alert('请选择时段')
    return
  }
  if (!form.plateNumber.trim()) {
    alert('请输入车牌号')
    return
  }
  if (!form.driverName.trim()) {
    alert('请输入司机姓名')
    return
  }
  if (!form.driverPhone.trim() || form.driverPhone.length < 11) {
    alert('请输入正确的手机号')
    return
  }

  submitting.value = true
  try {
    const result = await createAppointment({
      portId,
      vehicleType: vehicleType.value,
      plateNumber: form.plateNumber.trim(),
      driverName: form.driverName.trim(),
      driverPhone: form.driverPhone.trim(),
      appointmentDate: selectedDate.value,
      timeSlot: selectedSlot.value,
    })
    router.replace(`/qrcode/${result.id}`)
  } catch (e: any) {
    alert(e.message || '预约失败，请重试')
  } finally {
    submitting.value = false
  }
}

watch(selectedDate, () => {
  fetchQuotas()
})

onMounted(async () => {
  selectedDate.value = dateOptions.value[0]?.value || ''
  try {
    const port = await getPortById(portId)
    portName.value = port.name
  } catch {
    portName.value = '口岸预约'
  }
})
</script>
