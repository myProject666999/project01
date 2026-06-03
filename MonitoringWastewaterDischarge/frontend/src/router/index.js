import { createRouter, createWebHashHistory } from 'vue-router'

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
    path: '/discharge-point',
    name: 'DischargePoint',
    component: () => import('@/views/DischargePoint.vue')
  },
  {
    path: '/monitor-data',
    name: 'MonitorData',
    component: () => import('@/views/MonitorData.vue')
  },
  {
    path: '/alarm-record',
    name: 'AlarmRecord',
    component: () => import('@/views/AlarmRecord.vue')
  },
  {
    path: '/shutdown-order',
    name: 'ShutdownOrder',
    component: () => import('@/views/ShutdownOrder.vue')
  },
  {
    path: '/recovery-application',
    name: 'RecoveryApplication',
    component: () => import('@/views/RecoveryApplication.vue')
  },
  {
    path: '/env-report',
    name: 'EnvReport',
    component: () => import('@/views/EnvReport.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
