<script setup lang="ts">
import { ref, watch, onMounted, shallowRef } from 'vue'
import L from 'leaflet'
import type { SubArea, RescueTeam, Member } from '@/types'
import { statusColor } from '@/utils/helpers'

const props = defineProps<{
  map: L.Map | null
  subAreas: SubArea[]
  teams: RescueTeam[]
  members: Member[]
  selectedId?: number | null
}>()

const emit = defineEmits<{
  (e: 'select', subArea: SubArea): void
}>()

const layers = shallowRef<Map<number, L.Polygon>>(new Map())

const getTeamName = (teamId: number | null): string => {
  if (!teamId) return '未分配'
  const team = props.teams.find(t => t.id === teamId)
  return team ? team.name : '未知队伍'
}

const getMemberCount = (teamId: number | null): number => {
  if (!teamId) return 0
  return props.members.filter(m => m.teamId === teamId).length
}

const createSubAreaLayer = (subArea: SubArea): L.Polygon => {
  const coords = subArea.boundary.coordinates[0].map((c: number[]) => [c[1], c[0]])
  const team = subArea.teamId ? props.teams.find(t => t.id === subArea.teamId) : null

  const layer = L.polygon(coords as L.LatLngExpression[], {
    color: team?.color || '#6B7280',
    weight: 2,
    opacity: 0.9,
    fillColor: team?.color || '#6B7280',
    fillOpacity: 0.15,
    dashArray: subArea.status === 'completed' ? '5, 5' : undefined,
  })

  const teamName = getTeamName(subArea.teamId)
  const memberCount = getMemberCount(subArea.teamId)
  const coverage = subArea.coveragePercent !== undefined ? subArea.coveragePercent.toFixed(1) : '0.0'
  const statusClass = statusColor[subArea.status] || ''

  const popupContent = `
    <div class="min-w-[180px] p-2">
      <h3 class="font-bold text-base mb-2">${subArea.name}</h3>
      <div class="space-y-1 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-500">状态</span>
          <span class="px-2 py-0.5 rounded text-xs font-medium ${statusClass}">${subArea.status === 'searching' ? '搜索中' : subArea.status === 'completed' ? '已完成' : '未分配'}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">负责队伍</span>
          <span class="font-medium">${teamName}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">队员数</span>
          <span>${memberCount} 人</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">覆盖率</span>
          <span class="font-medium ${Number(coverage) > 80 ? 'text-green-600' : Number(coverage) > 50 ? 'text-yellow-600' : 'text-red-600'}">${coverage}%</span>
        </div>
      </div>
    </div>
  `

  layer.bindPopup(popupContent)

  const labelContent = `
    <div style="
      background: ${team?.color || '#6B7280'};
      color: white;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    ">
      ${subArea.name} · ${coverage}%
    </div>
  `

  layer.bindTooltip(labelContent, {
    permanent: true,
    direction: 'center',
    className: 'subarea-label',
    opacity: 0.95,
  })

  layer.on('click', () => {
    emit('select', subArea)
  })

  return layer
}

const render = () => {
  if (!props.map) return

  layers.value.forEach(layer => {
    if (props.map?.hasLayer(layer)) {
      props.map.removeLayer(layer)
    }
  })
  layers.value.clear()

  props.subAreas.forEach(subArea => {
    const layer = createSubAreaLayer(subArea)
    layer.addTo(props.map!)
    layers.value.set(subArea.id, layer)

    if (props.selectedId === subArea.id) {
      layer.setStyle({
        weight: 4,
        opacity: 1,
        fillOpacity: 0.3,
      })
      layer.bringToFront()
    }
  })
}

watch(
  () => [props.subAreas, props.map, props.selectedId],
  () => render(),
  { deep: true }
)

onMounted(() => {
  if (props.map) render()
})
</script>

<style>
.leaflet-tooltip.subarea-label {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}
.leaflet-tooltip.subarea-label::before {
  display: none !important;
}
</style>
