import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'mission-list',
      component: () => import('@/pages/MissionList.vue'),
    },
    {
      path: '/command/:taskId',
      name: 'command-map',
      component: () => import('@/pages/CommandMap.vue'),
    },
    {
      path: '/replay/:taskId',
      name: 'trajectory-replay',
      component: () => import('@/pages/TrajectoryReplay.vue'),
    },
    {
      path: '/discoveries/:taskId',
      name: 'discovery-list',
      component: () => import('@/pages/DiscoveryList.vue'),
    },
  ],
})

export default router
