<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Car, User, Lock, Loader2 } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  username: '',
  password: '',
})

const loading = ref(false)
const error = ref('')

async function handleLogin() {
  if (!form.value.username || !form.value.password) {
    error.value = '请输入用户名和密码'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const result = await authStore.login(form.value)
    if (result.success) {
      router.push('/')
    } else {
      error.value = result.message || '登录失败，请检查用户名和密码'
    }
  } catch (e) {
    error.value = '登录时发生错误，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 p-4">
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        class="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 blur-3xl"
        style="background-color: #165DFF;"
      />
      <div
        class="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-20 blur-3xl"
        style="background-color: #165DFF;"
      />
    </div>

    <div class="relative w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <div class="flex flex-col items-center mb-8">
          <div
            class="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
            style="background-color: #165DFF;"
          >
            <Car class="w-8 h-8 text-white" />
          </div>
          <h1 class="text-2xl font-bold text-gray-800">报废机动车拆解管理系统</h1>
          <p class="text-gray-500 mt-2">请登录您的账户</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {{ error }}
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">用户名</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User class="w-5 h-5 text-gray-400" />
              </div>
              <input
                v-model="form.username"
                type="text"
                placeholder="请输入用户名"
                class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                :style="{ '--tw-ring-color': '#165DFF' }"
                :disabled="loading"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">密码</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock class="w-5 h-5 text-gray-400" />
              </div>
              <input
                v-model="form.password"
                type="password"
                placeholder="请输入密码"
                class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                :style="{ '--tw-ring-color': '#165DFF' }"
                :disabled="loading"
                @keyup.enter="handleLogin"
              />
            </div>
          </div>

          <button
            type="submit"
            class="w-full py-3 px-4 text-white font-medium rounded-lg transition-all duration-200 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
            style="background-color: #165DFF; --tw-ring-color: #165DFF;"
            :disabled="loading"
          >
            <Loader2 v-if="loading" class="w-5 h-5 animate-spin" />
            <span>{{ loading ? '登录中...' : '登 录' }}</span>
          </button>
        </form>

        <div class="mt-6 pt-6 border-t border-gray-100">
          <p class="text-center text-sm text-gray-500">
            登录即表示您同意我们的服务条款和隐私政策
          </p>
        </div>
      </div>

      <p class="text-center text-slate-400 text-sm mt-6">
        © 2024 报废机动车拆解管理系统 - 专业的危废处理解决方案
      </p>
    </div>
  </div>
</template>
