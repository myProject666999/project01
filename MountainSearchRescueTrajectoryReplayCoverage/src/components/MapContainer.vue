<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import { useMap } from '@/composables/useMap'

const props = defineProps<{
  center?: [number, number]
  zoom?: number
}>()

const emit = defineEmits<{
  (e: 'mapReady', map: L.Map): void
}>()

const { map, isReady, initMap } = useMap('main-map')
const containerRef = ref<HTMLElement | null>(null)

onMounted(() => {
  const m = initMap(props.center || [30.5, 114.3], props.zoom || 13)
  if (m) {
    emit('mapReady', m)
  }
})

watch(map, (newMap) => {
  if (newMap && isReady.value) {
    emit('mapReady', newMap)
  }
})

defineExpose({
  map,
  isReady,
})
</script>

<template>
  <div class="relative w-full h-full">
    <div
      ref="containerRef"
      id="main-map"
      class="w-full h-full bg-zinc-900"
    />
    <div
      v-if="!isReady"
      class="absolute inset-0 flex items-center justify-center bg-zinc-900/80"
    >
      <div class="text-white text-lg">
        <span class="animate-pulse">地图加载中...</span>
      </div>
    </div>
  </div>
</template>
