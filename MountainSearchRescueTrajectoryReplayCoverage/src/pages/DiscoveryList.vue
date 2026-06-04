<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Filter, MapPin, Calendar, User, Tag, Trash2 } from 'lucide-vue-next'
import type { Mission, Discovery, Member, RescueTeam } from '@/types'
import { api } from '@/utils/api'
import { discoveryTypeLabel, discoveryTypeIcon, statusColor, formatTime } from '@/utils/helpers'

const route = useRoute()
const router = useRouter()
const missionId = Number(route.params.taskId)

const mission = ref<Mission | null>(null)
const discoveries = ref<Discovery[]>([])
const members = ref<Member[]>([])
const teams = ref<RescueTeam[]>([])
const loading = ref(true)
const filterType = ref<string>('all')
const selectedDiscovery = ref<Discovery | null>(null)

const typeFilters = [
  { value: 'all', label: '全部', icon: '📋' },
  { value: 'footprint', label: '鞋印', icon: '👣' },
  { value: 'clothing', label: '衣物', icon: '👕' },
  { value: 'person', label: '人员', icon: '🧍' },
  { value: 'other', label: '其他', icon: '📌' },
]

const filteredDiscoveries = computed(() => {
  if (filterType.value === 'all') return discoveries.value
  return discoveries.value.filter(d => d.type === filterType.value)
})

const typeStats = computed(() => {
  const stats: Record<string, number> = { all: discoveries.value.length }
  typeFilters.forEach(t => {
    if (t.value !== 'all') {
      stats[t.value] = discoveries.value.filter(d => d.type === t.value).length
    }
  })
  return stats
})

const getMemberName = (memberId: number) => {
  const m = members.value.find(mem => mem.id === memberId)
  return m?.name || '未知'
}

const getMemberTeam = (memberId: number) => {
  const m = members.value.find(mem => mem.id === memberId)
  if (!m) return null
  return teams.value.find(t => t.id === m.teamId)
}

const loadData = async () => {
  loading.value = true
  try {
    const [missionData, discoveriesData, teamsData] = await Promise.all([
      api.missions.get(missionId),
      api.discoveries.list(missionId),
      api.teams.list(),
    ])

    mission.value = missionData
    discoveries.value = discoveriesData.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    teams.value = teamsData

    const membersPromises = teamsData.map(t => api.teams.members(t.id))
    const membersResults = await Promise.all(membersPromises)
    members.value = membersResults.flat()
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
    searchArea: null,
    createdAt: '2026-06-04T08:00:00',
    updatedAt: '2026-06-04T08:00:00',
  }

  teams.value = [
    { id: 1, name: '蓝鹰救援队', leaderId: 1, color: '#2196F3', createdAt: '', memberCount: 2 },
    { id: 2, name: '红枫救援队', leaderId: 3, color: '#F44336', createdAt: '', memberCount: 2 },
    { id: 3, name: '绿野救援队', leaderId: 5, color: '#4CAF50', createdAt: '', memberCount: 2 },
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
  const mockData: Discovery[] = [
    {
      id: 1, missionId, memberId: 1, type: 'footprint',
      description: '在A区西侧小径发现疑似失踪者脚印，方向朝向东北，鞋印约42码，看起来是登山鞋',
      lat: 30.481, lng: 114.276, imageUrl: null,
      timestamp: new Date(baseTime + 15 * 60 * 1000).toISOString(),
    },
    {
      id: 2, missionId, memberId: 4, type: 'clothing',
      description: '在B区东侧灌木丛中发现一件破损的灰色冲锋衣外套，左袖口有撕裂痕迹',
      lat: 30.522, lng: 114.332, imageUrl: null,
      timestamp: new Date(baseTime + 18 * 60 * 1000).toISOString(),
    },
    {
      id: 3, missionId, memberId: 6, type: 'other',
      description: '发现一处废弃营地，有近期活动痕迹，包括两个空矿泉水瓶和食品包装',
      lat: 30.483, lng: 114.348, imageUrl: null,
      timestamp: new Date(baseTime + 45 * 60 * 1000).toISOString(),
    },
    {
      id: 4, missionId, memberId: 2, type: 'footprint',
      description: '在山脊线附近发现新鲜脚印，与之前发现的鞋印特征相符',
      lat: 30.495, lng: 114.288, imageUrl: null,
      timestamp: new Date(baseTime + 62 * 60 * 1000).toISOString(),
    },
    {
      id: 5, missionId, memberId: 3, type: 'other',
      description: '树枝上发现红色布条标记，疑似登山者留下的路标',
      lat: 30.512, lng: 114.322, imageUrl: null,
      timestamp: new Date(baseTime + 78 * 60 * 1000).toISOString(),
    },
    {
      id: 6, missionId, memberId: 5, type: 'clothing',
      description: '在山谷小溪边发现一只黑色户外手套，尺寸较大',
      lat: 30.468, lng: 114.318, imageUrl: null,
      timestamp: new Date(baseTime + 95 * 60 * 1000).toISOString(),
    },
  ]
  discoveries.value = mockData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

const goToCommand = (d: Discovery) => {
  selectedDiscovery.value = d
  router.push(`/command/${missionId}`)
}

onMounted(() => loadData())
</script>

<template>
  <div class="min-h-screen bg-zinc-900">
    <header class="bg-zinc-900 border-b border-zinc-800 px-6 py-4 sticky top-0 z-50">
      <div class="max-w-6xl mx-auto flex items-center justify-between">
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
            <h1 class="text-lg font-bold text-white">发现物管理</h1>
            <p class="text-xs text-zinc-400">{{ mission?.name }}</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <span class="text-sm text-zinc-400">共 {{ discoveries.length }} 条记录</span>
          <button
            class="px-4 py-2 bg-rescue-orange hover:bg-rescue-orange-dark text-white rounded-lg text-sm font-medium transition-colors"
          >
            新增上报
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-6 py-8">
      <div class="flex gap-3 mb-6 overflow-x-auto pb-2">
        <button
          v-for="filter in typeFilters"
          :key="filter.value"
          :class="[
            'px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-all',
            filterType === filter.value
              ? 'bg-rescue-orange text-white shadow-lg shadow-rescue-orange/30'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
          ]"
          @click="filterType = filter.value"
        >
          <span>{{ filter.icon }}</span>
          {{ filter.label }}
          <span
            :class="[
              'text-xs px-1.5 py-0.5 rounded-full',
              filterType === filter.value ? 'bg-white/20' : 'bg-zinc-700'
            ]"
          >
            {{ typeStats[filter.value] || 0 }}
          </span>
        </button>
      </div>

      <div v-if="loading" class="grid md:grid-cols-2 gap-4">
        <div v-for="i in 4" :key="i" class="animate-pulse bg-zinc-800 rounded-2xl h-48" />
      </div>

      <div v-else-if="filteredDiscoveries.length === 0" class="text-center py-16">
        <div class="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Filter class="w-8 h-8 text-zinc-600" />
        </div>
        <h3 class="text-lg font-medium text-zinc-400 mb-2">暂无相关记录</h3>
        <p class="text-sm text-zinc-500">调整筛选条件查看更多结果</p>
      </div>

      <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="d in filteredDiscoveries"
          :key="d.id"
          class="group bg-zinc-800/50 backdrop-blur-sm rounded-2xl border border-zinc-700 hover:border-zinc-600 transition-all overflow-hidden"
        >
          <div class="p-5">
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-3">
                <div
                  class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  :style="{
                    backgroundColor: d.type === 'footprint' ? 'rgba(33, 150, 243, 0.2)' :
                      d.type === 'clothing' ? 'rgba(255, 152, 0, 0.2)' :
                      d.type === 'person' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(156, 39, 176, 0.2)'
                  }"
                >
                  {{ discoveryTypeIcon[d.type] }}
                </div>
                <div>
                  <h3 class="font-semibold text-white">{{ discoveryTypeLabel[d.type] }}</h3>
                  <div class="flex items-center gap-1.5 text-xs text-zinc-500">
                    <Calendar class="w-3 h-3" />
                    {{ formatTime(d.timestamp) }}
                  </div>
                </div>
              </div>
              <span
                :class="[
                  'text-xs px-2 py-1 rounded-full font-medium',
                  statusColor.active
                ]"
                style="background: rgba(33, 150, 243, 0.1); color: #60A5FA;"
              >
                #{{ d.id }}
              </span>
            </div>

            <p class="text-sm text-zinc-300 mb-4 line-clamp-3">
              {{ d.description }}
            </p>

            <div class="space-y-2 text-xs">
              <div class="flex items-center justify-between">
                <span class="text-zinc-500 flex items-center gap-1">
                  <User class="w-3 h-3" />
                  上报人
                </span>
                <span class="text-zinc-300">
                  {{ getMemberName(d.memberId) }}
                  <span
                    class="ml-1.5 px-1.5 py-0.5 rounded text-xs"
                    :style="{
                      backgroundColor: getMemberTeam(d.memberId)?.color + '20',
                      color: getMemberTeam(d.memberId)?.color
                    }"
                  >
                    {{ getMemberTeam(d.memberId)?.name || '未知队伍' }}
                  </span>
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-zinc-500 flex items-center gap-1">
                  <MapPin class="w-3 h-3" />
                  坐标
                </span>
                <span class="text-zinc-300 font-mono text-[11px]">
                  {{ d.lat.toFixed(4) }}, {{ d.lng.toFixed(4) }}
                </span>
              </div>
            </div>
          </div>

          <div class="border-t border-zinc-700 px-5 py-3 bg-zinc-800/30 flex gap-2">
            <button
              class="flex-1 px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors"
              @click="goToCommand(d)"
            >
              <MapPin class="w-3.5 h-3.5" />
              地图定位
            </button>
            <button
              class="px-3 py-1.5 bg-zinc-700 hover:bg-red-900/50 text-zinc-400 hover:text-red-400 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div class="mt-12 bg-zinc-800/30 rounded-2xl p-6 border border-zinc-700">
        <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Tag class="w-5 h-5 text-rescue-orange" />
          发现物类型统计
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            v-for="filter in typeFilters.filter(f => f.value !== 'all')"
            :key="filter.value"
            class="bg-zinc-800 rounded-xl p-4 text-center"
          >
            <div class="text-3xl mb-2">{{ filter.icon }}</div>
            <div class="text-2xl font-bold text-white">{{ typeStats[filter.value] || 0 }}</div>
            <div class="text-xs text-zinc-400">{{ filter.label }}</div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
