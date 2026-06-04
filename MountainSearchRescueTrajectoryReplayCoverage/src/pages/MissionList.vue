<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Map, PlayCircle, List, Users, TrendingUp } from 'lucide-vue-next'
import type { Mission, RescueTeam } from '@/types'
import { api } from '@/utils/api'
import { statusLabel, statusColor, formatDate } from '@/utils/helpers'

const router = useRouter()
const missions = ref<Mission[]>([])
const teams = ref<RescueTeam[]>([])
const loading = ref(true)

const loadData = async () => {
  loading.value = true
  try {
    const [missionsData, teamsData] = await Promise.all([
      api.missions.list(),
      api.teams.list(),
    ])
    teams.value = teamsData

    for (const m of missionsData) {
      try {
        const coverage = await api.coverage.get(m.id)
        m.coveragePercent = coverage.coveragePercent
      } catch {
        m.coveragePercent = 0
      }
    }
    missions.value = missionsData
  } catch (e) {
    console.error('Failed to load data:', e)
    missions.value = [
      {
        id: 1,
        name: '磨山失踪人员搜救行动',
        status: 'active',
        searchArea: null,
        createdAt: '2026-06-04T08:00:00',
        updatedAt: '2026-06-04T08:00:00',
        coveragePercent: 67.5,
        teamCount: 3,
      },
      {
        id: 2,
        name: '东湖失联游客搜救',
        status: 'completed',
        searchArea: null,
        createdAt: '2026-06-01T10:00:00',
        updatedAt: '2026-06-02T18:00:00',
        coveragePercent: 98.2,
        teamCount: 2,
      },
    ]
  } finally {
    loading.value = false
  }
}

const goToCommand = (id: number) => router.push(`/command/${id}`)
const goToReplay = (id: number) => router.push(`/replay/${id}`)
const goToDiscoveries = (id: number) => router.push(`/discoveries/${id}`)

onMounted(() => loadData())
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-forest-900 via-forest-800 to-forest-900">
    <header class="bg-forest-900/80 backdrop-blur-sm border-b border-forest-700 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-rescue-orange rounded-lg flex items-center justify-center">
            <Map class="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 class="text-xl font-bold text-white">山地搜救指挥系统</h1>
            <p class="text-xs text-forest-300">Mountain Search & Rescue Trajectory System</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-sm text-forest-300">{{ teams.length }} 支救援队待命</span>
          <button class="px-4 py-2 bg-rescue-orange hover:bg-rescue-orange-dark text-white rounded-lg font-medium flex items-center gap-2 transition-all hover:scale-105 shadow-lg shadow-rescue-orange/30">
            <Plus class="w-4 h-4" />
            新建任务
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 py-8">
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-white mb-2">搜救任务</h2>
        <p class="text-forest-300">实时监控所有搜救任务进度与覆盖情况</p>
      </div>

      <div v-if="loading" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 3" :key="i" class="animate-pulse bg-forest-800/50 rounded-2xl h-64" />
      </div>

      <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="mission in missions"
          :key="mission.id"
          class="group bg-forest-800/50 backdrop-blur-sm rounded-2xl border border-forest-700 hover:border-rescue-orange/50 transition-all duration-300 hover:shadow-2xl hover:shadow-rescue-orange/10 hover:-translate-y-1 overflow-hidden"
        >
          <div class="p-6">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-lg font-bold text-white mb-1 group-hover:text-rescue-orange transition-colors line-clamp-1">
                  {{ mission.name }}
                </h3>
                <span :class="['text-xs px-2.5 py-1 rounded-full font-medium', statusColor[mission.status]]">
                  {{ statusLabel[mission.status] }}
                </span>
              </div>
              <div class="w-12 h-12 bg-forest-700 rounded-xl flex items-center justify-center">
                <Map class="w-6 h-6 text-forest-400" />
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <div class="flex justify-between text-sm mb-1.5">
                  <span class="text-forest-300 flex items-center gap-1.5">
                    <TrendingUp class="w-4 h-4" />
                    搜索覆盖
                  </span>
                  <span class="text-white font-bold">{{ mission.coveragePercent?.toFixed(1) }}%</span>
                </div>
                <div class="h-2 bg-forest-700 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    :class="[
                      Number(mission.coveragePercent) > 80 ? 'bg-green-500' :
                      Number(mission.coveragePercent) > 50 ? 'bg-yellow-500' : 'bg-red-500'
                    ]"
                    :style="{ width: `${mission.coveragePercent || 0}%` }"
                  />
                </div>
              </div>

              <div class="flex items-center gap-4 text-sm">
                <div class="flex items-center gap-1.5 text-forest-300">
                  <Users class="w-4 h-4" />
                  {{ mission.teamCount || 3 }} 支队伍
                </div>
                <div class="text-forest-400">
                  {{ formatDate(mission.createdAt) }}
                </div>
              </div>
            </div>
          </div>

          <div class="border-t border-forest-700 px-6 py-4 bg-forest-800/30">
            <div class="flex gap-2">
              <button
                class="flex-1 px-3 py-2 bg-rescue-orange hover:bg-rescue-orange-dark text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors"
                @click="goToCommand(mission.id)"
              >
                <Map class="w-4 h-4" />
                指挥地图
              </button>
              <button
                class="px-3 py-2 bg-forest-700 hover:bg-forest-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors"
                @click="goToReplay(mission.id)"
                title="轨迹回放"
              >
                <PlayCircle class="w-4 h-4" />
              </button>
              <button
                class="px-3 py-2 bg-forest-700 hover:bg-forest-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors"
                @click="goToDiscoveries(mission.id)"
                title="发现物"
              >
                <List class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-12 grid md:grid-cols-4 gap-4">
        <div class="bg-forest-800/30 backdrop-blur-sm rounded-xl p-5 border border-forest-700">
          <div class="text-3xl font-bold text-white mb-1">{{ missions.length }}</div>
          <div class="text-sm text-forest-300">总任务数</div>
        </div>
        <div class="bg-forest-800/30 backdrop-blur-sm rounded-xl p-5 border border-forest-700">
          <div class="text-3xl font-bold text-green-400 mb-1">{{ missions.filter(m => m.status === 'active').length }}</div>
          <div class="text-sm text-forest-300">进行中</div>
        </div>
        <div class="bg-forest-800/30 backdrop-blur-sm rounded-xl p-5 border border-forest-700">
          <div class="text-3xl font-bold text-rescue-orange mb-1">{{ teams.length }}</div>
          <div class="text-sm text-forest-300">救援队伍</div>
        </div>
        <div class="bg-forest-800/30 backdrop-blur-sm rounded-xl p-5 border border-forest-700">
          <div class="text-3xl font-bold text-blue-400 mb-1">{{ teams.length * 2 }}</div>
          <div class="text-sm text-forest-300">搜救队员</div>
        </div>
      </div>
    </main>
  </div>
</template>
