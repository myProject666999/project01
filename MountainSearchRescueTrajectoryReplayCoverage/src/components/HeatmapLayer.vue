<script setup lang="ts">
import { ref, watch, onMounted, shallowRef } from 'vue'
import L from 'leaflet'
import 'leaflet.heat'

import type { HeatLayer } from 'leaflet.heat'

const props = defineProps<{
  map: L.Map | null
  heatmapData: [number, number, number][]
  minOpacity?: number
  maxZoom?: number
  radius?: number
  blur?: number
}>()

const heatLayer = shallowRef<HeatLayer | null>(null)

const render = () => {
  if (!props.map || props.heatmapData.length === 0) {
    if (heatLayer.value && props.map?.hasLayer(heatLayer.value)) {
      props.map.removeLayer(heatLayer.value)
    }
    heatLayer.value = null
    return
  }

  const data = props.heatmapData.map(d => [d[0], d[1], d[2]])

  if (heatLayer.value) {
    heatLayer.value.setLatLngs(data as L.LatLngTuple[])
  } else {
    heatLayer.value = L.heatLayer(data as L.LatLngTuple[], {
      minOpacity: props.minOpacity || 0.4,
      maxZoom: props.maxZoom || 18,
      radius: props.radius || 25,
      blur: props.blur || 20,
      gradient: {
        0.0: '#FFE0B2',
        0.2: '#FFCC80',
        0.4: '#FFB74D',
        0.6: '#FF9800',
        0.8: '#F57C00',
        1.0: '#E65100',
      },
    })
    heatLayer.value.addTo(props.map)
  }
}

watch(
  () => [props.heatmapData, props.map],
  () => render(),
  { deep: true }
)

onMounted(() => {
  if (props.map) render()
})

defineExpose({
  refresh: render,
})
</script>
