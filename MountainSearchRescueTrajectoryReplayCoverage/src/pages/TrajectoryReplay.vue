<script setup lang="ts">
import { ref, shallowRef, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Map as MapIcon, ArrowLeft } from 'lucide-vue-next'
import type L from 'leaflet'
import type { Mission, SubArea, RescueTeam, Member, GPSPoint, Discovery } from '@/types'
import { useReplay } from '@/composables/useReplay'
import { api } from '@/utils/api'
import MapContainer from '@/components/MapContainer.vue'
import SubAreaLayer from '@/components/SubAreaLayer.vue'
import MemberMarker from '@/components/MemberMarker.vue'
import DiscoveryMarker from '@/components/DiscoveryMarker.vue'
import HeatmapLayer from '@/components/HeatmapLayer.vue'
import ReplayControl from '@/components/ReplayControl.vue'

const route = useRoute()
const router = useRouter()
const missionId = Number(route.params.taskId)

const map = shallowRef<L.Map | null>(null)
const mission = ref<Mission | null>(null)
const subAreas = ref<SubArea[]>([])
const teams = ref<RescueTeam[]>([])
const members = ref<Member[]>([])
const trajectories = ref<GPSPoint[]>([])
const discoveries = ref<Discovery[]>([])
const loading = ref(true)

const visibleDiscoveries = computed(() => {
  return discoveries.value.filter(d =>
    new Date(d.timestamp).getTime() <= replay.state.value.currentTime
  )
})

const replayHeatmapData = computed((): [number, number, number][] => {
  const cutoffTime = replay.state.value.currentTime
  const data: Map<string, number> = new globalThis.Map()

  trajectories.value.forEach(point => {
    if (new Date(point.timestamp).getTime() <= cutoffTime) {
      const key = `${point.lat.toFixed(3)},${point.lng.toFixed(3)}`
      data.set(key, (data.get(key) || 0) + 1)
    }
  })

  const maxCount = Math.max(...Array.from(data.values()), 1)
  const result: [number, number, number][] = []

  data.forEach((count, key) => {
    const [lat, lng] = key.split(',').map(Number)
    result.push([lat, lng, count / maxCount])
  })

  return result
})

const replay = useReplay(trajectories.value, members.value)
const emptyPositions = new globalThis.Map<number, any>()

const onMapReady = (m: L.Map) => {
  map.value = m
}

const loadData = async () => {
  loading.value = true
  try {
    const [missionData, subAreasData, teamsData, discoveriesData, trajectoriesData] = await Promise.all([
      api.missions.get(missionId),
      api.subAreas.list(missionId),
      api.teams.list(),
      api.discoveries.list(missionId),
      api.gps.trajectories(missionId),
    ])

    mission.value = missionData
    subAreas.value = subAreasData
    teams.value = teamsData
    discoveries.value = discoveriesData
    trajectories.value = trajectoriesData

    const membersPromises = teamsData.map(t => api.teams.members(t.id))
    const membersResults = await Promise.all(membersPromises)
    members.value = membersResults.flat()

    replay.init()
  } catch (e) {
    console.error('Failed to load data:', e)
    loadMockData()
    replay.init()
  } finally {
    loading.value = false
  }
}

const loadMockData = () => {
  mission.value = {
    id: missionId,
    name: '磨山失踪人员搜救行动',
    status: 'active',
    searchArea: {
      type: 'Polygon',
      coordinates: [[[114.25, 30.45], [114.35, 30.45], [114.35, 30.55], [114.25, 30.55], [114.25, 30.45]]],
    },
    createdAt: '2026-06-04T08:00:00',
    updatedAt: '2026-06-04T08:00:00',
  }

  teams.value = [
    { id: 1, name: '蓝鹰救援队', leaderId: 1, color: '#2196F3', createdAt: '', memberCount: 2 },
    { id: 2, name: '红枫救援队', leaderId: 3, color: '#F44336', createdAt: '', memberCount: 2 },
    { id: 3, name: '绿野救援队', leaderId: 5, color: '#4CAF50', createdAt: '', memberCount: 2 },
  ]

  subAreas.value = [
    {
      id: 1, missionId, name: 'A区-西侧区域',
      boundary: { type: 'Polygon', coordinates: [[[114.25, 30.45], [114.30, 30.45], [114.30, 30.55], [114.25, 30.55], [114.25, 30.45]]] },
      teamId: 1, status: 'searching', color: '#2196F3',
      createdAt: '', updatedAt: '',
    },
    {
      id: 2, missionId, name: 'B区-东北区域',
      boundary: { type: 'Polygon', coordinates: [[[114.30, 30.50], [114.35, 30.50], [114.35, 30.55], [114.30, 30.55], [114.30, 30.50]]] },
      teamId: 2, status: 'searching', color: '#F44336',
      createdAt: '', updatedAt: '',
    },
    {
      id: 3, missionId, name: 'C区-东南区域',
      boundary: { type: 'Polygon', coordinates: [[[114.30, 30.45], [114.35, 30.45], [114.35, 30.50], [114.30, 30.50], [114.30, 30.45]]] },
      teamId: 3, status: 'searching', color: '#4CAF50',
      createdAt: '', updatedAt: '',
    },
  ]

  members.value = [
    { id: 1, name: '张伟', teamId: 1, phone: '13800001001', createdAt: '' },
    { id: 2, name: '李强', teamId: 1, phone: '13800001002', createdAt: '' },
    { id: 3, name: '王磊', teamId: 2, phone: '13800002001', createdAt: '' },
    { id: 4, name: '赵刚', teamId: 2, phone: '13800002002', createdAt: '' },
    { id: 5, name: '陈明', teamId: 3, phone: '13800003001', createdAt: '' },
    { id: 6, name: '刘洋', teamId: 3, phone: '13800003002', createdAt: '' },
  ]

  const baseTime = new Date('2026-06-04T08:00:00').getTime()
  const routes = [
    [[30.478, 114.272], [30.482, 114.276], [30.486, 114.280], [30.490, 114.284], [30.494, 114.288], [30.498, 114.292]],
    [[30.495, 114.285], [30.499, 114.289], [30.503, 114.293], [30.507, 114.297], [30.511, 114.301], [30.515, 114.305]],
    [[30.505, 114.315], [30.510, 114.320], [30.515, 114.325], [30.520, 114.330], [30.525, 114.335], [30.530, 114.340]],
    [[30.520, 114.330], [30.525, 114.335], [30.530, 114.340], [30.535, 114.345], [30.540, 114.340], [30.545, 114.335]],
    [[30.460, 114.310], [30.465, 114.315], [30.470, 114.320], [30.475, 114.325], [30.480, 114.330], [30.485, 114.335]],
    [[30.475, 114.325], [30.480, 114.330], [30.485, 114.335], [30.490, 114.340], [30.485, 114.345], [30.480, 114.350]],
  ]

  trajectories.value = []
  routes.forEach((route, memberIdx) => {
    route.forEach((point, timeIdx) => {
      trajectories.value.push({
        id: memberIdx * 6 + timeIdx + 1,
        memberId: memberIdx + 1,
        missionId,
        lat: point[0] + (Math.random() - 0.5) * 0.002,
        lng: point[1] + (Math.random() - 0.5) * 0.002,
        altitude: 150 + Math.random() * 30,
        speed: 1 + Math.random() * 0.5,
        timestamp: new Date(baseTime + timeIdx * 10 * 60 * 1000).toISOString(),
        isCached: false,
      })
    })
  })

  discoveries.value = [
    {
      id: 1, missionId, memberId: 1, type: 'footprint',
      description: '在A区西侧小径发现疑似失踪者脚印',
      lat: 30.481, lng: 114.276, imageUrl: null,
      timestamp: new Date(baseTime + 15 * 60 * 1000).toISOString(),
    },
    {
      id: 2, missionId, memberId: 4, type: 'clothing',
      description: '在B区东侧灌木丛中发现一件破损外套',
      lat: 30.522, lng: 114.332, imageUrl: null,
      timestamp: new Date(baseTime + 18 * 60 * 1000).toISOString(),
    },
    {
      id: 3, missionId, memberId: 6, type: 'other',
      description: '发现一处废弃营地，有近期活动痕迹',
      lat: 30.483, lng: 114.348, imageUrl: null,
      timestamp: new Date(baseTime + 45 * 60 * 1000).toISOString(),
    },
  ]
}

const getTeamName = (teamId: number) => teams.value.find(t => t.id === teamId)?.name || '未知'

onMounted(() => loadData())
</script>

<template>
  <div class="h-screen flex flex-col bg-zinc-900">
    <header class="bg-zinc-900 border-b border-zinc-800 px-6 py-3 flex items-center justify-between shrink-0">
      <div class="flex items-center gap-4">
        <button
          class="text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
          @click="router.push(`/command/${missionId}`)"
        >
          <ArrowLeft class="w-4 h-4" />
          返回指挥
        </button>
        <div class="w-px h-6 bg-zinc-700" />
        <div>
          <h1 class="text-lg font-bold text-white flex items-center gap-2">
            <MapIcon class="w-5 h-5 text-rescue-orange" />
            轨迹回放 - {{ mission?.name }}
          </h1>
          <div class="text-xs text-zinc-400">
            加速回放全部队员搜救轨迹，查看覆盖演变过程
          </div>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <div class="text-right">
          <div class="text-xs text-zinc-500">总时长</div>
          <div class="text-sm font-mono text-white">
            {{ Math.round((trajectories.length > 0 ? (new Date(trajectories[trajectories.length - 1]?.timestamp).getTime() - new Date(trajectories[0]?.timestamp).getTime()) / 1000 : 0) / 60) }} 分钟
          </div>
        </div>
        <div class="text-right">
          <div class="text-xs text-zinc-500">轨迹点数</div>
          <div class="text-sm font-mono text-white">{{ trajectories.length }}</div>
        </div>
        <div class="text-right">
          <div class="text-xs text-zinc-500">队员数</div>
          <div class="text-sm font-mono text-white">{{ members.length }}</div>
        </div>
      </div>
    </header>

    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="flex-1 relative">
        <MapContainer
          v-if="!loading"
          :center="[30.5, 114.3]"
          :zoom="13"
          @map-ready="onMapReady"
        />

        <template v-if="map && !loading">
          <SubAreaLayer
            :map="map"
            :sub-areas="subAreas"
            :teams="teams"
            :members="members"
          />

          <HeatmapLayer
            :map="map"
            :heatmap-data="replayHeatmapData"
            :radius="25"
            :blur="20"
          />

          <MemberMarker
            :map="map"
            :members="members"
            :teams="teams"
            :trajectories="trajectories.filter(p => new Date(p.timestamp).getTime() <= replay.state.value.currentTime)"
            :live-positions="emptyPositions"
            :show-trails="true"
          />

          <DiscoveryMarker
            :map="map"
            :discoveries="visibleDiscoveries"
            :members="members"
          />
        </template>

        <div
          v-if="loading"
          class="absolute inset-0 flex items-center justify-center bg-zinc-900"
        >
          <div class="text-center">
            <div class="w-12 h-12 border-4 border-rescue-orange border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <div class="text-zinc-400">加载轨迹数据...</div>
          </div>
        </div>

        <div class="absolute top-4 right-4 bg-zinc-900/90 backdrop-blur-sm rounded-xl p-4 border border-zinc-700 min-w-[180px] z-[1000]">
          <div class="text-sm font-medium text-white mb-2">各队进度</div>
          <div class="space-y-2">
            <div v-for="team in teams" :key="team.id" class="text-xs">
              <div class="flex items-center justify-between mb-1">
                <span class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: team.color }" />
                  {{ team.name }}
                </span>
                <span class="text-zinc-400">
                  {{ Math.round((replay.visiblePoints.value.get(team.id + 0)?.length || 0) + (replay.visiblePoints.value.get(team.id + 1)?.length || 0)) }} 点
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ReplayControl
        :is-playing="replay.state.value.isPlaying"
        :progress="replay.progress.value"
        :current-time="replay.currentTimeFormatted.value"
        :playback-speed="replay.state.value.playbackSpeed"
        :total-duration="(trajectories.length > 0 ? (new Date(trajectories[trajectories.length - 1]?.timestamp).getTime() - new Date(trajectories[0]?.timestamp).getTime()) / 1000 : 0)"
        @play="replay.play()"
        @pause="replay.pause()"
        @reset="replay.reset()"
        @seek="replay.seekProgress($event)"
        @speed-change="replay.setSpeed($event)"
        @skip="(sec) => replay.seek(replay.state.value.currentTime + sec * 1000 * replay.state.value.playbackSpeed)"
      />
    </div>
  </div>
</template>
