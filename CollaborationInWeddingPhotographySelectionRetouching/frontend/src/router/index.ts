import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import Layout from '@/components/Layout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: Layout,
    meta: { requiresAuth: true },
    redirect: '/orders',
    children: [
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('@/views/OrderList.vue'),
        meta: { title: '订单管理' }
      },
      {
        path: 'photo-selection',
        name: 'PhotoSelection',
        component: () => import('@/views/PhotoSelection.vue'),
        meta: { title: '照片选片', roles: ['couple', 'admin'] }
      },
      {
        path: 'retouch-tasks',
        name: 'RetouchTasks',
        component: () => import('@/views/RetouchTasks.vue'),
        meta: { title: '修图任务', roles: ['retoucher', 'admin'] }
      },
      {
        path: 'review-retouch',
        name: 'ReviewRetouch',
        component: () => import('@/views/ReviewRetouch.vue'),
        meta: { title: '验收修图', roles: ['couple', 'admin'] }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/orders'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  userStore.loadUserFromStorage()
  
  if (to.meta.requiresAuth === false) {
    if (userStore.isLoggedIn) {
      next('/orders')
    } else {
      next()
    }
    return
  }
  
  if (!userStore.isLoggedIn) {
    next('/login')
    return
  }
  
  if (to.meta.roles && Array.isArray(to.meta.roles)) {
    const userRole = userStore.user?.role
    if (!userRole || !to.meta.roles.includes(userRole)) {
      next('/orders')
      return
    }
  }
  
  next()
})

export default router
