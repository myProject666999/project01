<script setup lang="ts">
import { ref, watch, onMounted, shallowRef, computed } from 'vue'
import L from 'leaflet'
import type { GPSPoint, Member, RescueTeam, PositionMessage } from '@/types'
import { getMemberColor, formatTime } from '@/utils/helpers'

const props = defineProps<{
  map: L.Map | null
  members: Member[]
  teams: RescueTeam[]
  trajectories: GPSPoint[]
  livePositions: Map<number, PositionMessage>
  showTrails?: boolean
}>()

const markers = shallowRef<Map<number, L.CircleMarker>>(new Map())
const trailLayers = shallowRef<Map<number, L.Polyline>>(new Map())

const latestPositions = computed(() => {
  const result: Map<number, GPSPoint | PositionMessage> = new Map()

  props.members.forEach(member => {
    const live = props.livePositions.get(member.id)
    if (live) {
      result.set(member.id, live)
      return
    }

    const memberTrajectory = props.trajectories
      .filter(p => p.memberId === member.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    if (memberTrajectory.length > 0) {
      result.set(member.id, memberTrajectory[0])
    }
  })

  return result
})

const createMemberIcon = (member: Member, color: string): HTMLDivElement => {
  const div = document.createElement('div')
  div.className = 'member-marker-wrapper'
  div.innerHTML = `
    <div style="
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: ${color};
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 13px;
      animation: pulse 2s infinite;
    ">
      ${member.name.charAt(0)}
    </div>
  `
  return div
}

const createMarker = (member: Member, point: GPSPoint | PositionMessage): L.CircleMarker => {
  const team = props.teams.find(t => t.id === member.teamId)
  const teamColor = team?.color || '#6B7280'
  const memberIndex = props.members.filter(m => m.teamId === member.teamId).findIndex(m => m.id === member.id)
  const color = getMemberColor(teamColor, memberIndex)

  const marker = L.circleMarker([point.lat, point.lng], {
    radius: 14,
    fillColor: color,
    color: '#ffffff',
    weight: 3,
    opacity: 1,
    fillOpacity: 1,
  })

  const popupContent = `
    <div class="p-2 min-w-[160px]">
      <h3 class="font-bold text-base mb-1">${member.name}</h3>
      <div class="text-sm space-y-0.5">
        <div class="flex justify-between">
          <span class="text-gray-500">队伍</span>
          <span style="color: ${teamColor}; font-weight: 600;">${team?.name || '未知'}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">坐标</span>
          <span class="text-xs font-mono">${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}</span>
        </div>
        ${point.altitude !== null ? `
        <div class="flex justify-between">
          <span class="text-gray-500">海拔</span>
          <span>${point.altitude.toFixed(0)} m</span>
        </div>
        ` : ''}
        ${point.speed !== null ? `
        <div class="flex justify-between">
          <span class="text-gray-500">速度</span>
          <span>${point.speed.toFixed(1)} km/h</span>
        </div>
        ` : ''}
        <div class="flex justify-between">
          <span class="text-gray-500">时间</span>
          <span>${formatTime(point.timestamp)}</span>
        </div>
      </div>
    </div>
  `

  marker.bindPopup(popupContent)
  return marker
}

const createTrail = (member: Member): L.Polyline | null => {
  const points = props.trajectories
    .filter(p => p.memberId === member.id)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map(p => [p.lat, p.lng])

  if (points.length < 2) return null

  const team = props.teams.find(t => t.id === member.teamId)
  const color = team?.color || '#6B7280'

  return L.polyline(points as L.LatLngTuple[], {
    color,
    weight: 3,
    opacity: 0.6,
    dashArray: '6, 6',
  })
}

const render = () => {
  if (!props.map) return

  markers.value.forEach(marker => {
    if (props.map?.hasLayer(marker)) props.map.removeLayer(marker)
  })
  markers.value.clear()

  trailLayers.value.forEach(trail => {
    if (props.map?.hasLayer(trail)) props.map.removeLayer(trail)
  })
  trailLayers.value.clear()

  props.members.forEach(member => {
    const pos = latestPositions.value.get(member.id)
    if (pos) {
      const marker = createMarker(member, pos)
      marker.addTo(props.map!)
      markers.value.set(member.id, marker)
    }

    if (props.showTrails) {
      const trail = createTrail(member)
      if (trail) {
        trail.addTo(props.map!)
        trailLayers.value.set(member.id, trail)
      }
    }
  })
}

const updatePositions = () => {
  if (!props.map) return

  props.members.forEach(member => {
    const pos = latestPositions.value.get(member.id)
    if (!pos) return

    const marker = markers.value.get(member.id)
    if (marker) {
      marker.setLatLng([pos.lat, pos.lng])
    } else {
      const newMarker = createMarker(member, pos)
      newMarker.addTo(props.map!)
      markers.value.set(member.id, newMarker)
    }
  })
}

watch(
  () => [props.members, props.map, props.trajectories, props.showTrails],
  () => render(),
  { deep: true }
)

watch(
  () => Array.from(props.livePositions.entries()),
  () => updatePositions(),
  { deep: true }
)

onMounted(() => {
  if (props.map) render()
})
</script>

<style>
@keyframes pulse {
  0% { box-shadow: 0 2px 8px rgba(0,0,0,0.4), 0 0 0 0 rgba(33, 150, 243, 0.4); }
  70% { box-shadow: 0 2px 8px rgba(0,0,0,0.4), 0 0 0 12px rgba(33, 150, 243, 0); }
  100% { box-shadow: 0 2px 8px rgba(0,0,0,0.4), 0 0 0 0 rgba(33, 150, 243, 0); }
}
</style>
