<script setup lang="ts">
import { ref, watch, onMounted, shallowRef } from 'vue'
import L from 'leaflet'
import type { Discovery, Member } from '@/types'
import { discoveryTypeLabel, discoveryTypeIcon, formatTime } from '@/utils/helpers'

const props = defineProps<{
  map: L.Map | null
  discoveries: Discovery[]
  members: Member[]
  selectedId?: number | null
}>()

const emit = defineEmits<{
  (e: 'select', discovery: Discovery): void
}>()

const markers = shallowRef<Map<number, L.Marker>>(new Map())

const getTypeColor = (type: string): string => {
  switch (type) {
    case 'footprint': return '#2196F3'
    case 'clothing': return '#FF9800'
    case 'person': return '#4CAF50'
    default: return '#9C27B0'
  }
}

const createMarker = (discovery: Discovery): L.Marker => {
  const member = props.members.find(m => m.id === discovery.memberId)
  const typeColor = getTypeColor(discovery.type)

  const icon = L.divIcon({
    className: 'discovery-marker',
    html: `
      <div style="
        width: 40px;
        height: 40px;
        border-radius: 12px;
        background: ${typeColor};
        border: 3px solid white;
        box-shadow: 0 3px 10px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        transform: translate(-50%, -50%);
        transition: transform 0.2s;
      " class="discovery-icon">
        ${discoveryTypeIcon[discovery.type] || '📌'}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -18],
  })

  const marker = L.marker([discovery.lat, discovery.lng], { icon })

  const popupContent = `
    <div class="p-2 min-w-[200px]">
      <div class="flex items-center gap-2 mb-2">
        <span style="font-size: 24px;">${discoveryTypeIcon[discovery.type]}</span>
        <div>
          <h3 class="font-bold text-base">${discoveryTypeLabel[discovery.type]}</h3>
          <span class="text-xs text-gray-500">${formatTime(discovery.timestamp)}</span>
        </div>
      </div>
      ${discovery.description ? `
      <p class="text-sm text-gray-700 mb-2">${discovery.description}</p>
      ` : ''}
      <div class="text-xs space-y-0.5 text-gray-500">
        <div class="flex justify-between">
          <span>上报人</span>
          <span class="text-gray-900">${member?.name || '未知'}</span>
        </div>
        <div class="flex justify-between">
          <span>坐标</span>
          <span class="font-mono text-gray-900">${discovery.lat.toFixed(4)}, ${discovery.lng.toFixed(4)}</span>
        </div>
      </div>
    </div>
  `

  marker.bindPopup(popupContent)
  marker.on('click', () => emit('select', discovery))

  return marker
}

const render = () => {
  if (!props.map) return

  markers.value.forEach(marker => {
    if (props.map?.hasLayer(marker)) props.map.removeLayer(marker)
  })
  markers.value.clear()

  props.discoveries.forEach(discovery => {
    const marker = createMarker(discovery)
    marker.addTo(props.map!)
    markers.value.set(discovery.id, marker)

    if (props.selectedId === discovery.id) {
      marker.openPopup()
    }
  })
}

watch(
  () => [props.discoveries, props.map, props.selectedId],
  () => render(),
  { deep: true }
)

onMounted(() => {
  if (props.map) render()
})
</script>

<style>
.discovery-marker {
  background: transparent !important;
  border: none !important;
}
.discovery-marker:hover .discovery-icon {
  transform: translate(-50%, -50%) scale(1.15) !important;
}
</style>
