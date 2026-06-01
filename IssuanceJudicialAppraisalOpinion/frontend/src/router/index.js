import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false, title: '登录' }
  },
  {
    path: '/verify',
    name: 'Verify',
    component: () => import('@/views/VerifyPage.vue'),
    meta: { requiresAuth: false, title: '验真' }
  },
  {
    path: '/',
    component: () => import('@/views/Layout.vue'),
    meta: { requiresAuth: true },
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'entrustment',
        name: 'Entrustment',
        component: () => import('@/views/EntrustmentList.vue'),
        meta: { title: '委托登记' }
      },
      {
        path: 'evidence',
        name: 'Evidence',
        component: () => import('@/views/EvidenceList.vue'),
        meta: { title: '检材管理' }
      },
      {
        path: 'evidence-chain',
        name: 'EvidenceChain',
        component: () => import('@/views/EvidenceChainView.vue'),
        meta: { title: '监管链查询' }
      },
      {
        path: 'task',
        name: 'Task',
        component: () => import('@/views/TaskList.vue'),
        meta: { title: '鉴定任务' }
      },
      {
        path: 'inspection',
        name: 'Inspection',
        component: () => import('@/views/InspectionList.vue'),
        meta: { title: '检验记录' }
      },
      {
        path: 'opinion',
        name: 'Opinion',
        component: () => import('@/views/OpinionList.vue'),
        meta: { title: '意见书管理' }
      },
      {
        path: 'review',
        name: 'Review',
        component: () => import('@/views/ReviewList.vue'),
        meta: { title: '复核管理' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const token = userStore.token

  if (to.meta.title) {
    document.title = to.meta.title + ' - 司法鉴定意见书管理系统'
  }

  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/')
  } else {
    next()
  }
})

export default router
