import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
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
        path: 'collections',
        name: 'Collections',
        component: () => import('@/views/collections/List.vue'),
        meta: { title: '藏品管理' }
      },
      {
        path: 'collections/:id',
        name: 'CollectionDetail',
        component: () => import('@/views/collections/Detail.vue'),
        meta: { title: '藏品详情' }
      },
      {
        path: 'movements',
        name: 'Movements',
        component: () => import('@/views/movements/List.vue'),
        meta: { title: '移动管理' }
      },
      {
        path: 'movements/:id',
        name: 'MovementDetail',
        component: () => import('@/views/movements/Detail.vue'),
        meta: { title: '移动详情' }
      },
      {
        path: 'inventory',
        name: 'Inventory',
        component: () => import('@/views/inventory/List.vue'),
        meta: { title: '盘点管理' }
      },
      {
        path: 'inventory/:id',
        name: 'InventoryDetail',
        component: () => import('@/views/inventory/Detail.vue'),
        meta: { title: '盘点详情' }
      },
      {
        path: 'status-records',
        name: 'StatusRecords',
        component: () => import('@/views/StatusRecords.vue'),
        meta: { title: '状态记录' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/Settings.vue'),
        meta: { title: '系统设置' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/')
  } else {
    next()
  }
})

export default router
