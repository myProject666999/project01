<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="sidebar">
      <div class="logo">
        <h2>中央厨房</h2>
        <p>净菜配送系统</p>
      </div>
      <el-menu
        :default-active="$route.path"
        router
        background-color="#001529"
        text-color="#fff"
        active-text-color="#1890ff"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据概览</span>
        </el-menu-item>
        <el-menu-item index="/customers">
          <el-icon><User /></el-icon>
          <span>客户管理</span>
        </el-menu-item>
        <el-menu-item index="/products">
          <el-icon><Goods /></el-icon>
          <span>菜品管理</span>
        </el-menu-item>
        <el-menu-item index="/orders">
          <el-icon><Document /></el-icon>
          <span>订单管理</span>
        </el-menu-item>
        <el-menu-item index="/processing">
          <el-icon><Setting /></el-icon>
          <span>加工排程</span>
        </el-menu-item>
        <el-menu-item index="/deliveries">
          <el-icon><Van /></el-icon>
          <span>配送管理</span>
        </el-menu-item>
        <el-menu-item index="/waste">
          <el-icon><Delete /></el-icon>
          <span>报废登记</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-title">{{ currentTitle }}</div>
        <div class="header-right">
          <el-popover
            placement="bottom"
            :width="320"
            trigger="click"
            popper-class="message-popover"
          >
            <template #reference>
              <el-badge :value="unreadCount" :max="99" class="header-badge">
                <el-icon class="header-icon" @click.stop><Bell /></el-icon>
              </el-badge>
            </template>
            <div class="message-header">
              <span>消息中心</span>
              <el-button type="text" size="small" @click="markAllRead">全部已读</el-button>
            </div>
            <el-divider style="margin: 8px 0" />
            <div class="message-list" v-if="messages.length > 0">
              <div
                v-for="msg in messages"
                :key="msg.id"
                class="message-item"
                :class="{ unread: !msg.read }"
                @click="markAsRead(msg.id)"
              >
                <div class="message-title">
                  <el-tag :type="msg.type === 'warning' ? 'warning' : msg.type === 'error' ? 'danger' : 'info'" size="small">
                    {{ msg.typeText }}
                  </el-tag>
                  <span class="message-time">{{ msg.time }}</span>
                </div>
                <div class="message-content">{{ msg.content }}</div>
              </div>
            </div>
            <div v-else class="empty-message">暂无消息</div>
          </el-popover>
          <el-icon class="header-icon"><UserFilled /></el-icon>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const currentTitle = computed(() => {
  const titles = {
    '/dashboard': '数据概览',
    '/customers': '客户管理',
    '/products': '菜品管理',
    '/orders': '订单管理',
    '/processing': '加工排程',
    '/deliveries': '配送管理',
    '/waste': '报废登记'
  }
  return titles[route.path] || '中央厨房净菜配送系统'
})

const messages = ref([
  {
    id: 1,
    type: 'success',
    typeText: '订单通知',
    content: '客户【第一中学食堂】提交了新订单，请及时处理',
    time: '2026-06-04 09:30',
    read: false
  },
  {
    id: 2,
    type: 'warning',
    typeText: '库存预警',
    content: '菜品【土豆丝】库存不足，请及时补货',
    time: '2026-06-04 08:15',
    read: false
  },
  {
    id: 3,
    type: 'info',
    typeText: '配送提醒',
    content: '配送车辆【京A12345】已出发，预计10:00到达客户',
    time: '2026-06-04 07:00',
    read: true
  }
])

const unreadCount = computed(() => messages.value.filter(m => !m.read).length)

const markAsRead = (id) => {
  const msg = messages.value.find(m => m.id === id)
  if (msg) {
    msg.read = true
  }
}

const markAllRead = () => {
  messages.value.forEach(m => {
    m.read = true
  })
}

onMounted(() => {
})
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.sidebar {
  background-color: #001529;
  overflow: hidden;
}

.logo {
  height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo h2 {
  font-size: 20px;
  margin: 0;
}

.logo p {
  font-size: 12px;
  margin: 5px 0 0 0;
  opacity: 0.8;
}

.header {
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.header-right {
  display: flex;
  gap: 20px;
}

.header-badge {
  cursor: pointer;
}

.header-icon {
  font-size: 20px;
  color: #666;
  cursor: pointer;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #333;
}

.message-list {
  max-height: 400px;
  overflow-y: auto;
}

.message-item {
  padding: 12px 8px;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.message-item:hover {
  background-color: #f5f7fa;
}

.message-item.unread {
  background-color: #ecf5ff;
}

.message-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.message-time {
  font-size: 12px;
  color: #999;
}

.message-content {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.empty-message {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-size: 14px;
}

.main-content {
  background-color: #f0f2f5;
  overflow-y: auto;
}
</style>

<style>
.message-popover {
  max-height: 500px;
}
</style>
