<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { get, post } from '@/lib/api'
import { useAuth } from '@/composables/useAuth'
import type { Club, Activity } from '@/lib/types'
import Empty from '@/components/Empty.vue'
import { Users, MapPin, Clock, UserPlus } from 'lucide-vue-next'

const { isLoggedIn } = useAuth()

const activeTab = ref<'clubs' | 'activities'>('clubs')
const clubs = ref<Club[]>([])
const activities = ref<Activity[]>([])
const joinedClubIds = ref<Set<number>>(new Set())
const registeredActivityIds = ref<Set<number>>(new Set())
const loading = ref(true)

onMounted(fetchData)

async function fetchData() {
  loading.value = true
  try {
    if (activeTab.value === 'clubs') {
      const res = await get<Club[]>('/clubs')
      if (res.code === 0) clubs.value = res.data
    } else {
      const res = await get<Activity[]>('/activities')
      if (res.code === 0) activities.value = res.data
    }
  } catch { /* */ } finally {
    loading.value = false
  }
}

function switchTab(tab: 'clubs' | 'activities') {
  activeTab.value = tab
  fetchData()
}

async function joinClub(clubId: number) {
  if (!isLoggedIn.value) return
  try {
    const res = await post(`/clubs/${clubId}/join`)
      if (res.code === 0) {
        joinedClubIds.value.add(clubId)
        joinedClubIds.value = new Set(joinedClubIds.value)
        const club = clubs.value.find(c => c.id === clubId)
        if (club) {
          club.member_count++
        }
    } else {
      alert(res.message || '加入失败')
    }
  } catch {
    alert('操作失败，请稍后重试')
  }
}

async function registerActivity(activityId: number) {
  if (!isLoggedIn.value) return
  try {
    const res = await post(`/activities/${activityId}/register`)
      if (res.code === 0) {
        registeredActivityIds.value.add(activityId)
        registeredActivityIds.value = new Set(registeredActivityIds.value)
        const act = activities.value.find(a => a.id === activityId)
        if (act) act.registered_count++
    } else {
      alert(res.message || '报名失败')
    }
  } catch {
    alert('操作失败，请稍后重试')
  }
}

function getClubImage(name: string) {
  const prompt = encodeURIComponent(`${name} community club elderly people warm atmosphere`)
  return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${prompt}&image_size=landscape_16_9`
}
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-4">
    <h1 class="text-xl4 font-bold text-secondary mb-4">社团活动</h1>

    <div class="flex gap-2 mb-4">
      <button
        @click="switchTab('clubs')"
        class="flex-1 py-3 rounded-xl2 text-xl font-bold transition-colors"
        :class="activeTab === 'clubs'
          ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-md'
          : 'bg-white text-secondary'"
      >
        社团
      </button>
      <button
        @click="switchTab('activities')"
        class="flex-1 py-3 rounded-xl2 text-xl font-bold transition-colors"
        :class="activeTab === 'activities'
          ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-md'
          : 'bg-white text-secondary'"
      >
        活动
      </button>
    </div>

    <div v-if="loading" class="text-center py-12 text-secondary-light text-xl">加载中...</div>

    <template v-else-if="activeTab === 'clubs'">
      <Empty v-if="clubs.length === 0" message="暂无社团" />
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div v-for="club in clubs" :key="club.id" class="bg-white rounded-xl2 shadow-sm overflow-hidden">
          <img :src="getClubImage(club.name)" :alt="club.name" class="w-full h-32 object-cover" />
          <div class="p-4">
            <h3 class="text-xl2 font-bold text-secondary mb-1">{{ club.name }}</h3>
            <p v-if="club.description" class="text-base text-secondary-light mb-2 line-clamp-2">{{ club.description }}</p>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1 text-base text-secondary-light">
                <Users class="w-4 h-4" />
                <span>{{ club.member_count }} 人</span>
              </div>
              <button
                v-if="joinedClubIds.has(club.id)"
                disabled
                class="px-4 py-2 rounded-xl2 text-base font-bold bg-green-100 text-green-700"
              >
                已加入
              </button>
              <button
                v-else
                @click="joinClub(club.id)"
                class="px-4 py-2 rounded-xl2 text-base font-bold bg-gradient-to-r from-primary to-primary-dark text-white active:scale-95 transition"
              >
                <span class="flex items-center gap-1"><UserPlus class="w-4 h-4" /> 加入</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <Empty v-if="activities.length === 0" message="暂无活动" />
      <div v-else class="flex flex-col gap-3">
        <div v-for="act in activities" :key="act.id" class="bg-white rounded-xl2 p-4 shadow-sm">
          <h3 class="text-xl2 font-bold text-secondary mb-2">{{ act.title }}</h3>
          <p v-if="act.description" class="text-base text-secondary-light mb-2">{{ act.description }}</p>
          <div class="flex flex-col gap-1 text-base text-secondary-light mb-3">
            <div class="flex items-center gap-2"><Clock class="w-4 h-4 text-primary" /> {{ act.start_time }} ~ {{ act.end_time }}</div>
            <div class="flex items-center gap-2"><MapPin class="w-4 h-4 text-primary" /> {{ act.location }}</div>
          </div>
          <button
            v-if="registeredActivityIds.has(act.id)"
            disabled
            class="w-full py-2.5 rounded-xl2 text-lg font-bold bg-green-100 text-green-700"
          >
            已报名
          </button>
          <button
            v-else
            @click="registerActivity(act.id)"
            class="w-full py-2.5 rounded-xl2 text-lg font-bold bg-gradient-to-r from-primary to-primary-dark text-white active:scale-95 transition"
          >
            报名参加
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
