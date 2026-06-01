<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { Phone, Lock, UserPlus, User } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const { register } = useAuth()

const phone = ref('')
const password = ref('')
const name = ref('')
const submitting = ref(false)
const error = ref('')

async function handleRegister() {
  error.value = ''
  if (!phone.value || !password.value || !name.value) {
    error.value = '请填写所有信息'
    return
  }
  if (phone.value.length !== 11) {
    error.value = '请输入正确的手机号'
    return
  }
  if (password.value.length < 6) {
    error.value = '密码至少6位'
    return
  }
  submitting.value = true
  try {
    const res = await register(phone.value, password.value, name.value)
    if (res.code === 0) {
      const redirect = (route.query.redirect as string) || '/'
      router.push(redirect)
    } else {
      error.value = res.message || '注册失败'
    }
  } catch {
    error.value = '注册失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}

function goLogin() {
  router.push({ name: 'login', query: route.query })
}
</script>

<template>
  <div class="max-w-md mx-auto px-4 py-8 min-h-screen flex flex-col justify-center">
    <div class="text-center mb-8">
      <div class="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <UserPlus class="w-10 h-10 text-primary" />
      </div>
      <h1 class="text-xl4 font-bold text-secondary">注册</h1>
      <p class="text-base text-secondary-light mt-1">创建您的账号</p>
    </div>

    <div class="bg-white rounded-xl2 shadow-md p-6">
      <div v-if="error" class="bg-red-50 text-red-600 p-3 rounded-xl2 text-lg mb-4">
        {{ error }}
      </div>

      <div class="mb-4">
        <label class="block text-lg font-bold text-secondary mb-2">姓名</label>
        <div class="relative">
          <User class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-light" />
          <input
            v-model="name"
            type="text"
            placeholder="请输入姓名"
            class="w-full pl-12 pr-4 py-4 rounded-xl2 border-2 border-cream-dark text-lg focus:border-primary focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div class="mb-4">
        <label class="block text-lg font-bold text-secondary mb-2">手机号</label>
        <div class="relative">
          <Phone class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-light" />
          <input
            v-model="phone"
            type="tel"
            maxlength="11"
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
            placeholder="请设置密码（至少6位）"
            class="w-full pl-12 pr-4 py-4 rounded-xl2 border-2 border-cream-dark text-lg focus:border-primary focus:outline-none transition-colors"
            @keyup.enter="handleRegister"
          />
        </div>
      </div>

      <button
        @click="handleRegister"
        :disabled="submitting"
        class="w-full py-4 rounded-xl2 text-xl font-bold text-white transition-all active:scale-[0.98]"
        :class="submitting ? 'bg-gray-300' : 'bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg'"
      >
        {{ submitting ? '注册中...' : '注册' }}
      </button>

      <div class="text-center mt-4">
        <button @click="goLogin" class="text-lg text-primary font-medium">
          已有账号？去登录
        </button>
      </div>
    </div>
  </div>
</template>
