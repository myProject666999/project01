<template>
  <div class="min-h-screen bg-ink-50 seal-pattern flex items-center justify-center p-8">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-lg shadow-xl p-8 border border-ink-200">
        <div class="text-center mb-8">
          <div class="text-6xl mb-4">📜</div>
          <h1 class="text-2xl font-serif text-ink-900 mb-2">古籍善本数字化校对系统</h1>
          <p class="text-ink-500 text-sm">多人协同 · 双人校对 · 专家定稿</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-ink-700 mb-2">用户名</label>
            <input
              v-model="form.username"
              type="text"
              class="w-full px-4 py-3 border border-ink-300 rounded-lg focus:ring-2 focus:ring-vermilion-500 focus:border-vermilion-500 bg-ink-50 font-serif"
              placeholder="请输入用户名"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-ink-700 mb-2">密码</label>
            <input
              v-model="form.password"
              type="password"
              class="w-full px-4 py-3 border border-ink-300 rounded-lg focus:ring-2 focus:ring-vermilion-500 focus:border-vermilion-500 bg-ink-50 font-serif"
              placeholder="请输入密码"
              @keyup.enter="handleLogin"
            />
          </div>
          <div v-if="error" class="text-vermilion-500 text-sm text-center">
            {{ error }}
          </div>
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 bg-vermilion-500 hover:bg-vermilion-600 text-white font-serif rounded-lg transition-colors disabled:opacity-50"
          >
            {{ loading ? '登录中...' : '登录系统' }}
          </button>
        </form>

        <div class="mt-8 pt-6 border-t border-ink-200">
          <p class="text-xs text-ink-400 text-center mb-3">演示账号：</p>
          <div class="grid grid-cols-2 gap-2 text-xs text-ink-500">
            <div class="bg-ink-50 p-2 rounded text-center">
              <div class="font-medium text-ink-700">管理员</div>
              <div>admin / admin123</div>
            </div>
            <div class="bg-ink-50 p-2 rounded text-center">
              <div class="font-medium text-ink-700">校对员</div>
              <div>proofreader1 / proof123</div>
            </div>
            <div class="bg-ink-50 p-2 rounded text-center col-span-2">
              <div class="font-medium text-ink-700">审稿人</div>
              <div>reviewer1 / review123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { login } = useAuth()

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
    const result = await login(form.value.username, form.value.password)
    if (result.success) {
      router.push('/books')
    } else {
      error.value = result.error || '登录失败'
    }
  } catch (e) {
    error.value = '网络错误，请重试'
  } finally {
    loading.value = false
  }
}
</script>
