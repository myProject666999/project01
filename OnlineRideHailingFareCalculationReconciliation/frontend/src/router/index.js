import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue')
  },
  {
    path: '/driver',
    name: 'DriverHome',
    component: () => import('@/views/driver/DriverHome.vue')
  },
  {
    path: '/driver/daily-report',
    name: 'DailyReport',
    component: () => import('@/views/driver/DailyReport.vue')
  },
  {
    path: '/driver/appeals',
    name: 'DriverAppeals',
    component: () => import('@/views/driver/Appeals.vue')
  },
  {
    path: '/admin/reconciliation',
    name: 'Reconciliation',
    component: () => import('@/views/admin/Reconciliation.vue')
  },
  {
    path: '/admin/orders',
    name: 'Orders',
    component: () => import('@/views/admin/Orders.vue')
  },
  {
    path: '/admin/appeals',
    name: 'AdminAppeals',
    component: () => import('@/views/admin/Appeals.vue')
  },
  {
    path: '/admin/pricing',
    name: 'PricingRules',
    component: () => import('@/views/admin/PricingRules.vue')
  },
  {
    path: '/admin/drivers',
    name: 'DriversManagement',
    component: () => import('@/views/admin/Drivers.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
