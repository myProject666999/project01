import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('../views/Layout.vue'),
    meta: { requiresAuth: true },
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue')
      },
      {
        path: 'auctions',
        name: 'Auctions',
        component: () => import('../views/auctions/List.vue')
      },
      {
        path: 'auctions/:id/lots',
        name: 'AuctionLots',
        component: () => import('../views/lots/List.vue')
      },
      {
        path: 'auctions/:id/catalogue',
        name: 'Catalogue',
        component: () => import('../views/lots/Catalogue.vue')
      },
      {
        path: 'bidders',
        name: 'Bidders',
        component: () => import('../views/bidders/List.vue')
      },
      {
        path: 'qualifications',
        name: 'Qualifications',
        component: () => import('../views/qualifications/List.vue')
      },
      {
        path: 'appointments',
        name: 'Appointments',
        component: () => import('../views/appointments/List.vue')
      },
      {
        path: 'results',
        name: 'Results',
        component: () => import('../views/results/List.vue')
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
  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/')
  } else {
    next()
  }
})

export default router
