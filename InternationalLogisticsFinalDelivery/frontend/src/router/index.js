import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Dashboard.vue')
  },
  {
    path: '/batches',
    name: 'Batches',
    component: () => import('../views/BatchList.vue')
  },
  {
    path: '/batches/:id/packages',
    name: 'BatchPackages',
    component: () => import('../views/BatchPackages.vue')
  },
  {
    path: '/packages',
    name: 'Packages',
    component: () => import('../views/PackageList.vue')
  },
  {
    path: '/packages/:id/label',
    name: 'PackageLabel',
    component: () => import('../views/LabelPreview.vue')
  },
  {
    path: '/labels',
    name: 'Labels',
    component: () => import('../views/LabelList.vue')
  },
  {
    path: '/routes',
    name: 'Routes',
    component: () => import('../views/RouteList.vue')
  },
  {
    path: '/routes/create',
    name: 'CreateRoute',
    component: () => import('../views/RouteCreate.vue')
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: () => import('../views/TaskList.vue')
  },
  {
    path: '/exceptions',
    name: 'Exceptions',
    component: () => import('../views/ExceptionList.vue')
  },
  {
    path: '/couriers',
    name: 'Couriers',
    component: () => import('../views/CourierList.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
