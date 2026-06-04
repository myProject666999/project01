<script setup lang="ts">
import { ref, shallowRef, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Map, Users, List, PlayCircle, Layers, Wifi, WifiOff,
  Pencil, Check, X, Plus, Trash2, MoveRight
} from 'lucide-vue-next'
import type L from 'leaflet'
import type { Mission, SubArea, RescueTeam, Member, GPSPoint, Discovery, GeoJSONPolygon, CoverageResult } from '@/types'
import { api } from '@/utils/api'
import { useWebSocket } from '@/composables/useWebSocket'
import { statusLabel, statusColor, formatTime, teamColors, discoveryTypeLabel, discoveryTypeIcon } from '@/utils/helpers'
import MapContainer from '@/components/MapContainer.vue'
import SearchAreaDrawer from '@/components/SearchAreaDrawer.vue'
import SubAreaLayer from '@/components/SubAreaLayer.vue'
import HeatmapLayer from '@/components/HeatmapLayer.vue'
import MemberMarker from '@/components/MemberMarker.vue'
import DiscoveryMarker from '@/components/DiscoveryMarker.vue'

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
const heatmapData = ref<[number, number, number][]>([])
const coverage = ref<CoverageResult | null>(null)
const loading = ref(true)

const { isConnected, positions, connect, disconnect } = useWebSocket(missionId)

const showHeatmap = ref(true)
const showTrails = ref(true)
const isDrawing = ref(false)
const isDrawingSubArea = ref(false)
const selectedSubArea = ref<SubArea | null>(null)
const newSubAreaName = ref('')
const newSubAreaTeam = ref<number | null>(null)

const loadData = async () => {
  loading.value = true
  try {
    const [
      missionData,
      subAreasData,
      teamsData,
      discoveriesData,
    ] = await Promise.all([
      api.missions.get(missionId),
      api.subAreas.list(missionId),
      api.teams.list(),
      api.discoveries.list(missionId),
    ])

    mission.value = missionData
    subAreas.value = subAreasData
    teams.value = teamsData
    discoveries.value = discoveriesData

    const membersPromises = teamsData.map(t => api.teams.members(t.id))
    const membersResults = await Promise.all(membersPromises)
    members.value = membersResults.flat()

    await loadCoverage()
    await loadTrajectories()
    connect()
  } catch (e) {
    console.error('Failed to load data:', e)
    loadMockData()
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
      teamId: 1, status: 'searching', color: '#2196F3', coveragePercent: 72.3,
      createdAt: '', updatedAt: '',
    },
    {
      id: 2, missionId, name: 'B区-东北区域',
      boundary: { type: 'Polygon', coordinates: [[[114.30, 30.50], [114.35, 30.50], [114.35, 30.55], [114.30, 30.55], [114.30, 30.50]]] },
      teamId: 2, status: 'searching', color: '#F44336', coveragePercent: 58.7,
      createdAt: '', updatedAt: '',
    },
    {
      id: 3, missionId, name: 'C区-东南区域',
      boundary: { type: 'Polygon', coordinates: [[[114.30, 30.45], [114.35, 30.45], [114.35, 30.50], [114.30, 30.50], [114.30, 30.45]]] },
      teamId: 3, status: 'searching', color: '#4CAF50', coveragePercent: 45.2,
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
  trajectories.value = []
  const patterns = [
    [30.478, 114.272], [30.480, 114.275], [30.483, 114.278],
    [30.495, 114.285], [30.498, 114.288], [30.502, 114.290],
    [30.505, 114.315], [30.510, 114.320], [30.515, 114.325],
    [30.520, 114.330], [30.525, 114.335], [30.530, 114.340],
    [30.460, 114.310], [30.465, 114.315], [30.470, 114.320],
    [30.475, 114.325], [30.480, 114.330], [30.485, 114.335],
  ]

  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 3; j++) {
      const idx = i * 3 + j
      const [lat, lng] = patterns[idx] || patterns[0]
      trajectories.value.push({
        id: idx + 1,
        memberId: i + 1,
        missionId,
        lat: lat + (Math.random() - 0.5) * 0.003,
        lng: lng + (Math.random() - 0.5) * 0.003,
        altitude: 150 + Math.random() * 30,
        speed: 1 + Math.random(),
        timestamp: new Date(baseTime + j * 10 * 60 * 1000).toISOString(),
        isCached: false,
      })
    }
  }

  discoveries.value = [
    {
      id: 1, missionId, memberId: 1, type: 'footprint',
      description: '在A区西侧小径发现疑似失踪者脚印',
      lat: 30.481, lng: 114.276, imageUrl: null,
      timestamp: '2026-06-04T08:15:00',
    },
    {
      id: 2, missionId, memberId: 4, type: 'clothing',
      description: '在B区东侧灌木丛中发现一件破损外套',
      lat: 30.522, lng: 114.332, imageUrl: null,
      timestamp: '2026-06-04T08:18:00',
    },
  ]

  coverage.value = {
    missionId,
    totalAreaSqM: 1200000,
    coveredAreaSqM: 675000,
    coveragePercent: 56.25,
    subAreas: subAreas.value.map(sa => ({
      subAreaId: sa.id,
      totalAreaSqM: 400000,
      coveredAreaSqM: 400000 * (sa.coveragePercent || 0) / 100,
      coveragePercent: sa.coveragePercent || 0,
      heatmapData: [],
    })),
  }

  heatmapData.value = generateMockHeatmap()
}

const generateMockHeatmap = (): [number, number, number][] => {
  const data: [number, number, number][] = []
  for (let lat = 30.45; lat <= 30.55; lat += 0.002) {
    for (let lng = 114.25; lng <= 114.35; lng += 0.002) {
      const dist = Math.sqrt(Math.pow(lat - 30.49, 2) + Math.pow(lng - 114.30, 2))
      const intensity = Math.max(0, 1 - dist * 10) * (0.3 + Math.random() * 0.7)
      if (intensity > 0.1) {
        data.push([lat, lng, intensity])
      }
    }
  }
  return data
}

const loadCoverage = async () => {
  try {
    const [coverageData, heatmapDataResult] = await Promise.all([
      api.coverage.get(missionId),
      api.coverage.heatmap(missionId),
    ])
    coverage.value = coverageData
    heatmapData.value = heatmapDataResult

    subAreas.value = subAreas.value.map(sa => {
      const saCov = coverageData.subAreas.find(sc => sc.subAreaId === sa.id)
      return saCov ? { ...sa, coveragePercent: saCov.coveragePercent } : sa
    })
  } catch (e) {
    console.error('Failed to load coverage:', e)
  }
}

const loadTrajectories = async () => {
  try {
    trajectories.value = await api.gps.trajectories(missionId)
  } catch (e) {
    console.error('Failed to load trajectories:', e)
  }
}

const onMapReady = (m: L.Map) => {
  map.value = m
}

const onDrawComplete = async (polygon: GeoJSONPolygon) => {
  if (mission.value) {
    try {
      await api.missions.update(missionId, { searchArea: polygon })
      mission.value.searchArea = polygon
    } catch (e) {
      console.error('Failed to update search area:', e)
      mission.value.searchArea = polygon
    }
  }
  isDrawing.value = false
}

const startDrawSubArea = () => {
  selectedSubArea.value = null
  newSubAreaName.value = `子区域 ${subAreas.value.length + 1}`
  newSubAreaTeam.value = null
  isDrawingSubArea.value = true
}

const cancelDrawSubArea = () => {
  selectedSubArea.value = null
  newSubAreaName.value = ''
  newSubAreaTeam.value = null
  isDrawingSubArea.value = false
}

const saveSubArea = async (polygon: GeoJSONPolygon) => {
  try {
    const newSub = await api.subAreas.create(missionId, {
      name: newSubAreaName.value,
      boundary: polygon,
      teamId: newSubAreaTeam.value,
      status: newSubAreaTeam.value ? 'searching' : 'unassigned',
      color: teamColors[subAreas.value.length % teamColors.length],
    })
    subAreas.value.push(newSub)
  } catch (e) {
    console.error('Failed to create sub area:', e)
    const newSub: SubArea = {
      id: subAreas.value.length + 1,
      missionId,
      name: newSubAreaName.value,
      boundary: polygon,
      teamId: newSubAreaTeam.value,
      status: newSubAreaTeam.value ? 'searching' : 'unassigned',
      color: teamColors[subAreas.value.length % teamColors.length],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    subAreas.value.push(newSub)
  }
  cancelDrawSubArea()
  isDrawing.value = false
}

const selectSubArea = (sa: SubArea) => {
  selectedSubArea.value = sa
}

const reassignSubArea = async (sa: SubArea, newTeamId: number | null) => {
  try {
    await api.subAreas.update(sa.id, {
      teamId: newTeamId,
      status: newTeamId ? 'searching' : 'unassigned',
    })
    sa.teamId = newTeamId
    sa.status = newTeamId ? 'searching' : 'unassigned'
  } catch (e) {
    console.error('Failed to reassign:', e)
    sa.teamId = newTeamId
    sa.status = newTeamId ? 'searching' : 'unassigned'
  }
}

const getTeamName = (teamId: number | null) => {
  if (!teamId) return '未分配'
  return teams.value.find(t => t.id === teamId)?.name || '未知'
}

const getMemberName = (memberId: number) => {
  return members.value.find(m => m.id === memberId)?.name || '未知'
}

const getTeamMembers = (teamId: number) => {
  return members.value.filter(m => m.teamId === teamId)
}

watch(positions, () => {
  loadCoverage()
}, { deep: true })

onMounted(() => loadData())
</script>

<template>
  <div class="h-screen flex flex-col bg-zinc-900">
    <header class="bg-zinc-900 border-b border-zinc-800 px-6 py-3 flex items-center justify-between shrink-0">
      <div class="flex items-center gap-4">
        <button
          class="text-zinc-400 hover:text-white transition-colors"
          @click="router.push('/')"
        >
          ← 返回
        </button>
        <div class="w-px h-6 bg-zinc-700" />
        <div>
          <h1 class="text-lg font-bold text-white flex items-center gap-2">
            <Map class="w-5 h-5 text-rescue-orange" />
            {{ mission?.name || '指挥地图' }}
          </h1>
          <div class="flex items-center gap-3 text-xs">
            <span :class="['px-2 py-0.5 rounded font-medium', statusColor[mission?.status || 'planning']]">
              {{ statusLabel[mission?.status || 'planning'] }}
            </span>
            <span class="text-zinc-400 flex items-center gap-1">
              <component :is="isConnected ? Wifi : WifiOff" class="w-3.5 h-3.5" :class="isConnected ? 'text-green-500' : 'text-red-500'" />
              {{ isConnected ? '实时连接' : '连接中断' }}
            </span>
            <span class="text-zinc-500">{{ subAreas.length }} 个子区域</span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          :class="[
            'px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors',
            showHeatmap ? 'bg-rescue-orange text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
          ]"
          @click="showHeatmap = !showHeatmap"
        >
          <Layers class="w-4 h-4" />
          热力图
        </button>
        <button
          :class="[
            'px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors',
            showTrails ? 'bg-zinc-700 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
          ]"
          @click="showTrails = !showTrails"
        >
          轨迹
        </button>
        <div class="w-px h-6 bg-zinc-700" />
        <button
          class="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors"
          @click="router.push(`/replay/${missionId}`)"
        >
          <PlayCircle class="w-4 h-4" />
          回放
        </button>
        <button
          class="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors"
          @click="router.push(`/discoveries/${missionId}`)"
        >
          <List class="w-4 h-4" />
          发现物
        </button>
      </div>
    </header>

    <div class="flex-1 flex overflow-hidden">
      <div class="flex-1 relative">
        <MapContainer
          v-if="!loading"
          :center="[30.5, 114.3]"
          :zoom="13"
          @map-ready="onMapReady"
        />

        <template v-if="map && !loading">
          <SearchAreaDrawer
            v-if="isDrawing"
            :map="map"
            :existing-area="mission?.searchArea"
            :is-drawing="isDrawing"
            @draw-start="() => {}"
            @draw-complete="isDrawingSubArea ? saveSubArea($event) : onDrawComplete($event)"
            @draw-cancel="isDrawingSubArea ? cancelDrawSubArea() : (isDrawing = false)"
          />

          <SearchAreaDrawer
            v-else
            :map="map"
            :existing-area="mission?.searchArea"
            :is-drawing="false"
            @draw-complete="() => {}"
          />

          <SubAreaLayer
            :map="map"
            :sub-areas="subAreas"
            :teams="teams"
            :members="members"
            :selected-id="selectedSubArea?.id"
            @select="selectSubArea"
          />

          <HeatmapLayer
            v-if="showHeatmap"
            :map="map"
            :heatmap-data="heatmapData"
            :radius="30"
            :blur="25"
          />

          <MemberMarker
            :map="map"
            :members="members"
            :teams="teams"
            :trajectories="trajectories"
            :live-positions="positions"
            :show-trails="showTrails"
          />

          <DiscoveryMarker
            :map="map"
            :discoveries="discoveries"
            :members="members"
          />
        </template>

        <div
          v-if="loading"
          class="absolute inset-0 flex items-center justify-center bg-zinc-900"
        >
          <div class="text-center">
            <div class="w-12 h-12 border-4 border-rescue-orange border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <div class="text-zinc-400">加载中...</div>
          </div>
        </div>

        <div
          v-if="coverage && !loading"
          class="absolute top-4 left-4 bg-zinc-900/90 backdrop-blur-sm rounded-xl p-4 border border-zinc-700 min-w-[200px]"
        >
          <div class="text-sm text-zinc-400 mb-1">总覆盖率</div>
          <div class="text-3xl font-bold text-white mb-2">{{ coverage.coveragePercent.toFixed(1) }}%</div>
          <div class="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-rescue-orange to-yellow-500 transition-all duration-500"
              :style="{ width: `${coverage.coveragePercent}%` }"
            />
          </div>
          <div class="text-xs text-zinc-500 mt-2">
            {{ (coverage.coveredAreaSqM / 1000000).toFixed(2) }} km² / {{ (coverage.totalAreaSqM / 1000000).toFixed(2) }} km²
          </div>
        </div>

        <div
          v-if="isDrawing"
          class="absolute top-4 left-1/2 -translate-x-1/2 bg-rescue-orange text-white px-5 py-2 rounded-full font-medium shadow-lg z-[1000] flex items-center gap-2"
        >
          <Pencil class="w-4 h-4 animate-pulse" />
          {{ isDrawingSubArea ? '点击地图绘制子区域边界，双击完成' : '点击地图绘制搜索区域边界，双击完成' }}
          <button class="ml-2 hover:bg-white/20 rounded p-1" @click="isDrawingSubArea ? cancelDrawSubArea() : (isDrawing = false)">
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

      <aside class="w-80 bg-zinc-900 border-l border-zinc-800 flex flex-col overflow-hidden">
        <div class="p-4 border-b border-zinc-800">
          <div class="flex items-center justify-between mb-3">
            <h2 class="font-semibold text-white flex items-center gap-2">
              <Users class="w-4 h-4 text-rescue-orange" />
              搜索区域
            </h2>
            <button
              class="text-xs px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded flex items-center gap-1"
              @click="isDrawing = true"
            >
              <Pencil class="w-3 h-3" />
              编辑
            </button>
          </div>

          <button
            class="w-full px-3 py-2 bg-rescue-orange hover:bg-rescue-orange-dark text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 mb-3"
            @click="startDrawSubArea"
          >
            <Plus class="w-4 h-4" />
            添加子区域
          </button>

          <div v-if="isDrawingSubArea" class="bg-zinc-800 rounded-lg p-3 mb-3 space-y-3">
            <div>
              <label class="text-xs text-zinc-400 block mb-1">子区域名称</label>
              <input
                v-model="newSubAreaName"
                type="text"
                class="w-full px-2 py-1.5 bg-zinc-700 border border-zinc-600 rounded text-sm text-white focus:outline-none focus:border-rescue-orange"
              />
            </div>
            <div>
              <label class="text-xs text-zinc-400 block mb-1">分配队伍</label>
              <select
                v-model="newSubAreaTeam"
                class="w-full px-2 py-1.5 bg-zinc-700 border border-zinc-600 rounded text-sm text-white focus:outline-none focus:border-rescue-orange"
              >
                <option :value="null">暂不分配</option>
                <option v-for="t in teams" :key="t.id" :value="t.id">{{ t.name }}</option>
              </select>
            </div>
            <div class="flex gap-2">
              <button
                class="flex-1 px-2 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded text-sm"
                @click="cancelDrawSubArea"
              >
                取消
              </button>
              <button
                class="flex-1 px-2 py-1.5 bg-rescue-orange hover:bg-rescue-orange-dark text-white rounded text-sm flex items-center justify-center gap-1"
                :disabled="true"
              >
                <Check class="w-3 h-3" />
                地图上绘制
              </button>
            </div>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-4">
          <h3 class="text-sm font-semibold text-zinc-400 mb-3">子区域列表</h3>
          <div class="space-y-2">
            <div
              v-for="sa in subAreas"
              :key="sa.id"
              :class="[
                'p-3 rounded-xl border transition-all cursor-pointer',
                selectedSubArea?.id === sa.id
                  ? 'bg-zinc-800 border-rescue-orange/50'
                  : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600'
              ]"
              @click="selectSubArea(sa)"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: sa.color }" />
                  <span class="font-medium text-white text-sm">{{ sa.name }}</span>
                </div>
                <span :class="['text-xs px-2 py-0.5 rounded font-medium', statusColor[sa.status]]">
                  {{ statusLabel[sa.status] }}
                </span>
              </div>

              <div class="text-xs space-y-1">
                <div class="flex justify-between">
                  <span class="text-zinc-500">负责队伍</span>
                  <span class="text-zinc-300">{{ getTeamName(sa.teamId) }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-zinc-500">覆盖率</span>
                  <div class="flex items-center gap-2">
                    <div class="w-16 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        class="h-full transition-all"
                        :class="[
                          Number(sa.coveragePercent) > 80 ? 'bg-green-500' :
                          Number(sa.coveragePercent) > 50 ? 'bg-yellow-500' : 'bg-red-500'
                        ]"
                        :style="{ width: `${sa.coveragePercent || 0}%` }"
                      />
                    </div>
                    <span class="font-mono text-zinc-300 w-10 text-right">{{ sa.coveragePercent?.toFixed(1) }}%</span>
                  </div>
                </div>
              </div>

              <div v-if="sa.teamId" class="mt-2 pt-2 border-t border-zinc-700">
                <div class="text-xs text-zinc-500 mb-1">队员位置</div>
                <div class="flex flex-wrap gap-1">
                  <div
                    v-for="m in getTeamMembers(sa.teamId)"
                    :key="m.id"
                    class="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-medium"
                    :style="{ backgroundColor: teams.find(t => t.id === sa.teamId)?.color }"
                    :title="m.name"
                  >
                    {{ m.name.charAt(0) }}
                  </div>
                </div>
              </div>

              <div v-if="selectedSubArea?.id === sa.id" class="mt-3 pt-3 border-t border-zinc-700">
                <label class="text-xs text-zinc-400 block mb-1">重新分配</label>
                <div class="flex gap-2">
                  <select
                    :value="sa.teamId"
                    class="flex-1 px-2 py-1.5 bg-zinc-700 border border-zinc-600 rounded text-xs text-white focus:outline-none focus:border-rescue-orange"
                    @change="reassignSubArea(sa, Number(($event.target as HTMLSelectElement).value) || null)"
                  >
                    <option :value="null">未分配</option>
                    <option v-for="t in teams" :key="t.id" :value="t.id">{{ t.name }}</option>
                  </select>
                  <button
                    class="px-2 py-1.5 bg-red-900/50 hover:bg-red-900 text-red-400 rounded text-xs"
                  >
                    <Trash2 class="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 border-t border-zinc-800 bg-zinc-900/50">
          <h3 class="text-sm font-semibold text-zinc-400 mb-3 flex items-center gap-2">
            <List class="w-4 h-4" />
            最近发现物
          </h3>
          <div class="space-y-2 max-h-48 overflow-y-auto">
            <div
              v-for="d in discoveries.slice().reverse().slice(0, 3)"
              :key="d.id"
              class="p-2 bg-zinc-800 rounded-lg text-xs"
            >
              <div class="flex items-center gap-2 mb-1">
                <span class="text-base">{{ discoveryTypeIcon[d.type] }}</span>
                <span class="font-medium text-white">{{ discoveryTypeLabel[d.type] }}</span>
                <span class="text-zinc-500 ml-auto">{{ formatTime(d.timestamp) }}</span>
              </div>
              <p class="text-zinc-400 line-clamp-1">{{ d.description }}</p>
              <div class="text-zinc-500 mt-1">
                上报人：{{ getMemberName(d.memberId) }}
              </div>
            </div>
            <div v-if="discoveries.length === 0" class="text-center text-zinc-500 py-4 text-xs">
              暂无发现物记录
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>
