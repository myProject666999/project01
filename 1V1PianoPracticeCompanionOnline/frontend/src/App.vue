<script setup lang="ts">
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

watch(
  () => route.fullPath,
  () => {
    const token = localStorage.getItem('token')
    if (token && !userStore.token) {
      userStore.setToken(token)
      const userInfo = localStorage.getItem('userInfo')
      if (userInfo) {
        userStore.setUserInfo(JSON.parse(userInfo))
      }
    }

    const publicPages = ['/login', '/register']
    const authRequired = !publicPages.includes(route.path)
    if (authRequired && !userStore.token) {
      router.push('/login')
    }
  },
  { immediate: true }
)
</script>

<template>
  <el-config-provider>
    <router-view />
  </el-config-provider>
</template>

<style>
#app {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
