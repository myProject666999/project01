<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

type StatusType = 'vehicle' | 'task' | 'part' | 'hazardous' | 'waybill' | 'inventory'

interface Props {
  status: string
  type?: StatusType
}

const props = defineProps<Props>()

const statusConfig: Record<StatusType, Record<string, { label: string; class: string }>> = {
  vehicle: {
    registered: { label: '已登记', class: 'bg-blue-100 text-blue-700 border-blue-200' },
    dismantling: { label: '拆解中', class: 'bg-amber-100 text-amber-700 border-amber-200' },
    completed: { label: '已完成', class: 'bg-green-100 text-green-700 border-green-200' },
  },
  task: {
    pending: { label: '待处理', class: 'bg-gray-100 text-gray-700 border-gray-200' },
    in_progress: { label: '进行中', class: 'bg-blue-100 text-blue-700 border-blue-200' },
    completed: { label: '已完成', class: 'bg-green-100 text-green-700 border-green-200' },
  },
  part: {
    pending: { label: '待拆解', class: 'bg-gray-100 text-gray-700 border-gray-200' },
    dismantled: { label: '已拆解', class: 'bg-blue-100 text-blue-700 border-blue-200' },
    stocked: { label: '已入库', class: 'bg-green-100 text-green-700 border-green-200' },
    disposed: { label: '已处置', class: 'bg-red-100 text-red-700 border-red-200' },
  },
  hazardous: {
    pending: { label: '待转移', class: 'bg-orange-100 text-orange-700 border-orange-200' },
    transferred: { label: '已转移', class: 'bg-blue-100 text-blue-700 border-blue-200' },
    completed: { label: '已处置', class: 'bg-green-100 text-green-700 border-green-200' },
  },
  waybill: {
    pending: { label: '待转移', class: 'bg-gray-100 text-gray-700 border-gray-200' },
    transferred: { label: '转移中', class: 'bg-blue-100 text-blue-700 border-blue-200' },
    completed: { label: '已签收', class: 'bg-green-100 text-green-700 border-green-200' },
  },
  inventory: {
    in_stock: { label: '在库', class: 'bg-green-100 text-green-700 border-green-200' },
    sold: { label: '已售出', class: 'bg-gray-100 text-gray-700 border-gray-200' },
  },
}

const currentType = computed<StatusType>(() => props.type || 'vehicle')

const config = computed(() => {
  return statusConfig[currentType.value][props.status] || {
    label: props.status,
    class: 'bg-gray-100 text-gray-700 border-gray-200',
  }
})
</script>

<template>
  <span
    :class="[
      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
      cn(config.class),
    ]"
  >
    {{ config.label }}
  </span>
</template>
