<template>
  <div class="login-container">
    <div class="login-background">
      <div class="login-card">
        <div class="login-header">
          <el-icon :size="48" class="logo-icon"><Camera /></el-icon>
          <h1 class="login-title">婚纱摄影协作系统</h1>
          <p class="login-subtitle">专业的选片与修图管理平台</p>
        </div>
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              size="large"
              prefix-icon="User"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="login-btn"
              :loading="loading"
              @click="handleLogin"
            >
              登 录
            </el-button>
          </el-form-item>
        </el-form>
        <div class="demo-accounts">
          <p class="demo-title">演示账号：</p>
          <div class="account-list">
            <div class="account-item" @click="fillAccount('admin', 'admin123')">
              <el-tag type="danger" size="small">管理员</el-tag>
              <span>admin / admin123</span>
            </div>
            <div class="account-item" @click="fillAccount('couple', 'couple123')">
              <el-tag type="success" size="small">新人</el-tag>
              <span>couple / couple123</span>
            </div>
            <div class="account-item" @click="fillAccount('retoucher', 'retoucher123')">
              <el-tag type="warning" size="small">修图师</el-tag>
              <span>retoucher / retoucher123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Camera } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref<FormInstance>()
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      const success = await userStore.login(loginForm)
      loading.value = false
      if (success) {
        router.push('/orders')
      }
    }
  })
}

const fillAccount = (username: string, password: string) => {
  loginForm.username = username
  loginForm.password = password
}

onMounted(() => {
  if (userStore.isLoggedIn) {
    router.push('/orders')
  }
})
</script>

<style scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.login-background {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.login-background::before {
  content: '';
  position: absolute;
  width: 200%;
  height: 200%;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  animation: moveBackground 20s linear infinite;
}

@keyframes moveBackground {
  0% {
    transform: translate(-50%, -50%);
  }
  100% {
    transform: translate(0, 0);
  }
}

.login-card {
  width: 420px;
  padding: 48px 40px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo-icon {
  color: #667eea;
  margin-bottom: 16px;
}

.login-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.login-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.login-form {
  margin-bottom: 24px;
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
}

.demo-accounts {
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.demo-title {
  font-size: 13px;
  color: #909399;
  margin: 0 0 12px 0;
}

.account-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.account-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.account-item:hover {
  background: #f5f7fa;
}

.account-item span {
  font-size: 13px;
  color: #606266;
}
</style>
