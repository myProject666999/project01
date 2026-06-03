import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const LoginPage = () => import('@/pages/LoginPage.vue')
const Layout = () => import('@/layouts/DefaultLayout.vue')
const DashboardPage = () => import('@/pages/DashboardPage.vue')
const VehicleListPage = () => import('@/pages/vehicles/VehicleListPage.vue')
const VehicleFormPage = () => import('@/pages/vehicles/VehicleFormPage.vue')
const DismantlingListPage = () => import('@/pages/dismantling/DismantlingListPage.vue')
const DismantlingDetailPage = () => import('@/pages/dismantling/DismantlingDetailPage.vue')
const InventoryListPage = () => import('@/pages/inventory/InventoryListPage.vue')
const InventoryInboundPage = () => import('@/pages/inventory/InventoryInboundPage.vue')
const HazardousListPage = () => import('@/pages/hazardous/HazardousListPage.vue')
const WaybillListPage = () => import('@/pages/hazardous/WaybillListPage.vue')
const ReportPage = () => import('@/pages/report/ReportPage.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: DashboardPage,
      },
      {
        path: 'vehicles',
        name: 'vehicles',
        component: VehicleListPage,
      },
      {
        path: 'vehicles/new',
        name: 'vehicles.new',
        component: VehicleFormPage,
      },
      {
        path: 'vehicles/:id/edit',
        name: 'vehicles.edit',
        component: VehicleFormPage,
      },
      {
        path: 'dismantling',
        name: 'dismantling',
        component: DismantlingListPage,
      },
      {
        path: 'dismantling/:id',
        name: 'dismantling.detail',
        component: DismantlingDetailPage,
      },
      {
        path: 'inventory',
        name: 'inventory',
        component: InventoryListPage,
      },
      {
        path: 'inventory/inbound',
        name: 'inventory.inbound',
        component: InventoryInboundPage,
      },
      {
        path: 'hazardous',
        name: 'hazardous',
        component: HazardousListPage,
      },
      {
        path: 'hazardous/waybill',
        name: 'hazardous.waybill',
        component: WaybillListPage,
      },
      {
        path: 'report',
        name: 'report',
        component: ReportPage,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next({ name: 'login' })
  } else if (to.name === 'login' && authStore.isLoggedIn) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
