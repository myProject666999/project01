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
    path: '/recipes',
    name: 'RecipeList',
    component: () => import('@/views/RecipeList.vue')
  },
  {
    path: '/recipes/:id',
    name: 'RecipeDetail',
    component: () => import('@/views/RecipeDetail.vue')
  },
  {
    path: '/batches',
    name: 'BatchList',
    component: () => import('@/views/BatchList.vue')
  },
  {
    path: '/batches/:id',
    name: 'BatchDetail',
    component: () => import('@/views/BatchDetail.vue')
  },
  {
    path: '/temperature',
    name: 'TemperatureChart',
    component: () => import('@/views/TemperatureChart.vue')
  },
  {
    path: '/tastings',
    name: 'TastingList',
    component: () => import('@/views/TastingList.vue')
  },
  {
    path: '/tastings/:id',
    name: 'TastingDetail',
    component: () => import('@/views/TastingDetail.vue')
  },
  {
    path: '/traceability',
    name: 'Traceability',
    component: () => import('@/views/Traceability.vue')
  },
  {
    path: '/materials',
    name: 'MaterialList',
    component: () => import('@/views/MaterialList.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
