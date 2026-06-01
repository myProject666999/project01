<template>
  <div>
    <div class="bg-primary px-5 pt-12 pb-6 flex items-center gap-3">
      <button class="text-white" @click="router.back()">
        <ArrowLeft class="w-5 h-5" />
      </button>
      <h1 class="text-white text-lg font-bold">预约详情</h1>
    </div>

    <div v-if="loading" class="text-center py-16 text-gray-400">加载中...</div>

    <div v-else-if="appointment" class="px-4 mt-4 space-y-4 pb-6">
      <div class="flex justify-center">
        <div class="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
          <img
            :src="`http://localhost:9090/api/qrcode?content=${encodeURIComponent(appointment.qrCode || appointment.appointmentNo)}`"
            alt="预约二维码"
            class="w-52 h-52"
          />
        </div>
      </div>

      <div class="flex justify-center">
        <span
          class="text-xs font-medium px-3 py-1.5 rounded-full"
          :class="statusClass(appointment.status)"
        >
          {{ statusLabel(appointment.status) }}
        </span>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="divide-y divide-gray-50">
          <div class="flex justify-between px-4 py-3">
            <span class="text-sm text-gray-500">预约编号</span>
            <span class="text-sm font-medium text-gray-900">{{ appointment.appointmentNo }}</span>
          </div>
          <div class="flex justify-between px-4 py-3">
            <span class="text-sm text-gray-500">口岸名称</span>
            <span class="text-sm font-medium text-gray-900">{{ appointment.portName }}</span>
          </div>
          <div class="flex justify-between px-4 py-3">
            <span class="text-sm text-gray-500">车牌号</span>
            <span class="text-sm font-medium text-gray-900">{{ appointment.plateNumber }}</span>
          </div>
          <div class="flex justify-between px-4 py-3">
            <span class="text-sm text-gray-500">预约日期</span>
            <span class="text-sm font-medium text-gray-900">{{ appointment.appointmentDate }}</span>
          </div>
          <div class="flex justify-between px-4 py-3">
            <span class="text-sm text-gray-500">预约时段</span>
            <span class="text-sm font-medium text-gray-900">{{ appointment.timeSlot }}</span>
          </div>
          <div class="flex justify-between px-4 py-3">
            <span class="text-sm text-gray-500">车型</span>
            <span class="text-sm font-medium text-gray-900">
              {{ appointment.vehicleType === 'CARGO' ? '货车' : '客车' }}
            </span>
          </div>
        </div>
      </div>

      <button
        v-if="appointment.status === 'BOOKED'"
        class="w-full py-3 rounded-lg text-red-500 font-medium text-base border border-red-200 bg-red-50 active:bg-red-100 transition-colors"
        @click="handleCancel"
      >
        取消预约
      </button>

      <button
        v-if="appointment.status === 'BOOKED'"
        class="w-full py-3 rounded-lg text-white font-medium text-base bg-primary active:bg-primary/90 transition-colors"
        @click="router.push(`/queue/${appointment.portId}`)"
      >
        查看排队信息
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { getAppointment, cancelAppointment, type AppointmentDTO } from '@/utils/api'

const router = useRouter()
const route = useRoute()

const appointmentId = Number(route.params.appointmentId)
const appointment = ref<AppointmentDTO | null>(null)
const loading = ref(true)

const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    BOOKED: '已预约',
    CHECKED_IN: '已签到',
    CANCELLED: '已取消',
  }
  return map[status] || status
}

const statusClass = (status: string) => {
  const map: Record<string, string> = {
    BOOKED: 'bg-blue-50 text-blue-600',
    CHECKED_IN: 'bg-green-50 text-green-600',
    CANCELLED: 'bg-gray-100 text-gray-500',
  }
  return map[status] || 'bg-gray-50 text-gray-500'
}

const handleCancel = async () => {
  if (!appointment.value) return
  if (!confirm('确定要取消此预约吗？')) return
  try {
    await cancelAppointment(appointment.value.id)
    appointment.value.status = 'CANCELLED'
  } catch (e: any) {
    alert(e.message || '取消失败')
  }
}

onMounted(async () => {
  try {
    appointment.value = await getAppointment(appointmentId)
  } catch {
    appointment.value = null
  } finally {
    loading.value = false
  }
})
</script>
