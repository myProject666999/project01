import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'CaseBoard',
    component: () => import('../views/CaseBoard.vue')
  },
  {
    path: '/case-detail/:id?',
    name: 'CaseDetail',
    component: () => import('../views/CaseDetail.vue')
  },
  {
    path: '/document',
    name: 'Document',
    component: () => import('../views/Document.vue')
  },
  {
    path: '/work-hour',
    name: 'WorkHour',
    component: () => import('../views/WorkHour.vue')
  },
  {
    path: '/conflict-check',
    name: 'ConflictCheck',
    component: () => import('../views/ConflictCheck.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
