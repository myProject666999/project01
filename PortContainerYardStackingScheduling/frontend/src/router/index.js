import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Panorama', component: () => import('../views/PanoramaView.vue') },
  { path: '/bay/:zoneId/:bay', name: 'BayDetail', component: () => import('../views/BayDetailView.vue') },
  { path: '/containers', name: 'Containers', component: () => import('../views/ContainersView.vue') },
  { path: '/appointments', name: 'Appointments', component: () => import('../views/AppointmentsView.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
