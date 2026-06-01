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
    path: '/customers',
    name: 'Customers',
    component: () => import('@/views/Customers.vue')
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('@/views/Products.vue')
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('@/views/Orders.vue')
  },
  {
    path: '/processing',
    name: 'Processing',
    component: () => import('@/views/Processing.vue')
  },
  {
    path: '/deliveries',
    name: 'Deliveries',
    component: () => import('@/views/Deliveries.vue')
  },
  {
    path: '/waste',
    name: 'Waste',
    component: () => import('@/views/Waste.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
