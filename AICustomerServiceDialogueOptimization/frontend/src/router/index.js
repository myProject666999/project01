import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { title: '数据概览' }
  },
  {
    path: '/quality-task',
    name: 'QualityTask',
    component: () => import('@/views/QualityTask.vue'),
    meta: { title: '质检任务' }
  },
  {
    path: '/conversation',
    name: 'Conversation',
    component: () => import('@/views/ConversationList.vue'),
    meta: { title: '会话质检' }
  },
  {
    path: '/conversation/:id',
    name: 'ConversationDetail',
    component: () => import('@/views/ConversationDetail.vue'),
    meta: { title: '会话详情' }
  },
  {
    path: '/violation',
    name: 'Violation',
    component: () => import('@/views/ViolationList.vue'),
    meta: { title: '违规记录' }
  },
  {
    path: '/appeal',
    name: 'Appeal',
    component: () => import('@/views/AppealList.vue'),
    meta: { title: '申诉管理' }
  },
  {
    path: '/script',
    name: 'Script',
    component: () => import('@/views/ScriptLibrary.vue'),
    meta: { title: '话术库' }
  },
  {
    path: '/ranking',
    name: 'Ranking',
    component: () => import('@/views/CsRanking.vue'),
    meta: { title: '评分排行' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
