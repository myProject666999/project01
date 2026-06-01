import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { title: '系统概览' }
  },
  {
    path: '/tea-products',
    name: 'TeaProducts',
    component: () => import('../views/TeaProducts.vue'),
    meta: { title: '茶品档案' }
  },
  {
    path: '/storage-locations',
    name: 'StorageLocations',
    component: () => import('../views/StorageLocations.vue'),
    meta: { title: '仓位管理' }
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: () => import('../views/Inventory.vue'),
    meta: { title: '库存管理' }
  },
  {
    path: '/environment',
    name: 'Environment',
    component: () => import('../views/Environment.vue'),
    meta: { title: '环境监控' }
  },
  {
    path: '/tasting-notes',
    name: 'TastingNotes',
    component: () => import('../views/TastingNotes.vue'),
    meta: { title: '品鉴笔记' }
  },
  {
    path: '/conversion-curve/:id',
    name: 'ConversionCurve',
    component: () => import('../views/ConversionCurve.vue'),
    meta: { title: '转化曲线' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
