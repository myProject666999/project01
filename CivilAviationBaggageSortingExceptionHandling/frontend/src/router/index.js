import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/baggages' },
  { path: '/baggages', name: 'Baggages', component: () => import('../views/BaggageView.vue') },
  { path: '/sortings', name: 'Sortings', component: () => import('../views/SortingView.vue') },
  { path: '/exceptions', name: 'Exceptions', component: () => import('../views/ExceptionView.vue') },
  { path: '/query', name: 'Query', component: () => import('../views/PassengerQueryView.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
