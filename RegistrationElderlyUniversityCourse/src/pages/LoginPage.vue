<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { Phone, Lock, LogIn } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const { login } = useAuth()

const phone = ref('')
const password = ref('')
const submitting = ref(false)
const error = ref('')

async function handleLogin() {
  error.value = ''
  if (!phone.value || !password.value) {
    error.value = '请填写手机号和密码'
    return
  }
  submitting.value = true
  try {
    const res = await login(phone.value, password.value)
    if (res.code === 0) {
      const redirect = (route.query.redirect as string) || '/'
      router.push(redirect)
    } else {
      error.value = res.message || '登录失败'
    }
  } catch {
    error.value = '登录失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}

function goRegister() {
  router.push({ name: 'register', query: route.query })
}
</script>

<template>
  <div class="max-w-md mx-auto px-4 py-8 min-h-screen flex flex-col justify-center">
    <div class="text-center mb-8">
      <div class="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <LogIn class="w-10 h-10 text-primary" />
      </div>
      <h1 class="text-xl4 font-bold text-secondary">登录</h1>
      <p class="text-base text-secondary-light mt-1">老年大学课程报名系统</p>
    </div>

    <div class="bg-white rounded-xl2 shadow-md p-6">
      <div v-if="error" class="bg-red-50 text-red-600 p-3 rounded-xl2 text-lg mb-4">
        {{ error }}
      </div>

      <div class="mb-4">
        <label class="block text-lg font-bold text-secondary mb-2">手机号</label>
        <div class="relative">
          <Phone class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-light" />
          <input
            v-model="phone"
            type="tel"
            placeholder="请输入手机号"
            class="w-full pl-12 pr-4 py-4 rounded-xl2 border-2 border-cream-dark text-lg focus:border-primary focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div class="mb-6">
        <label class="block text-lg font-bold text-secondary mb-2">密码</label>
        <div class="relative">
          <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-light" />
          <input
            v-model="password"
            type="password"
            placeholder="请输入密码"
            class="w-full pl-12 pr-4 py-4 rounded-xl2 border-2 border-cream-dark text-lg focus:border-primary focus:outline-none transition-colors"
            @keyup.enter="handleLogin"
          />
        </div>
      </div>

      <button
        @click="handleLogin"
        :disabled="submitting"
        class="w-full py-4 rounded-xl2 text-xl font-bold text-white transition-all active:scale-[0.98]"
        :class="submitting ? 'bg-gray-300' : 'bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg'"
      >
        {{ submitting ? '登录中...' : '登录' }}
      </button>

      <div class="text-center mt-4">
        <button @click="goRegister" class="text-lg text-primary font-medium">
          还没有账号？去注册
        </button>
      </div>
    </div>
  </div>
</template>
