import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false, title: '登录' }
  },
  {
    path: '/scan/:code',
    name: 'ScanQuery',
    component: () => import('@/views/ScanQuery.vue'),
    meta: { requiresAuth: false, title: '溯源查询' }
  },
  {
    path: '/',
    component: AdminLayout,
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '数据看板', icon: 'DataBoard' }
      },
      {
        path: 'plots',
        name: 'Plots',
        component: () => import('@/views/plots/Index.vue'),
        meta: { title: '地块档案管理', icon: 'Location' }
      },
      {
        path: 'farming-records',
        name: 'FarmingRecords',
        component: () => import('@/views/farming-records/Index.vue'),
        meta: { title: '农事记录管理', icon: 'Document' }
      },
      {
        path: 'harvest-batches',
        name: 'HarvestBatches',
        component: () => import('@/views/harvest-batches/Index.vue'),
        meta: { title: '采收批次管理', icon: 'Box' }
      },
      {
        path: 'processing-records',
        name: 'ProcessingRecords',
        component: () => import('@/views/processing-records/Index.vue'),
        meta: { title: '加工记录管理', icon: 'Setting' }
      },
      {
        path: 'products',
        name: 'Products',
        component: () => import('@/views/products/Index.vue'),
        meta: { title: '产品管理', icon: 'Goods' }
      },
      {
        path: 'qrcodes',
        name: 'QRCodes',
        component: () => import('@/views/qrcodes/Index.vue'),
        meta: { title: '二维码管理', icon: 'QrCode' }
      },
      {
        path: 'outbounds',
        name: 'Outbounds',
        component: () => import('@/views/outbounds/Index.vue'),
        meta: { title: '出库管理', icon: 'Bottom' }
      },
      {
        path: 'basic/operators',
        name: 'Operators',
        component: () => import('@/views/basic/operators/Index.vue'),
        meta: { title: '操作人员管理', icon: 'User', group: '基础数据' }
      },
      {
        path: 'basic/pesticides',
        name: 'Pesticides',
        component: () => import('@/views/basic/pesticides/Index.vue'),
        meta: { title: '农药管理', icon: 'Warning', group: '基础数据' }
      },
      {
        path: 'basic/fertilizers',
        name: 'Fertilizers',
        component: () => import('@/views/basic/fertilizers/Index.vue'),
        meta: { title: '肥料管理', icon: 'Flower', group: '基础数据' }
      },
      {
        path: 'basic/herb-varieties',
        name: 'HerbVarieties',
        component: () => import('@/views/basic/herb-varieties/Index.vue'),
        meta: { title: '中药材品种管理', icon: 'CirclePlus', group: '基础数据' }
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
  const isAuthenticated = userStore.isAuthenticated

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else if (to.path === '/login' && isAuthenticated) {
    next({ path: '/dashboard' })
  } else {
    next()
  }
})

export default router
