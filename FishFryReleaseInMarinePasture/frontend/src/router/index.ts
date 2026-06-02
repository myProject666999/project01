import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/components/Layout.vue'
import Dashboard from '@/pages/Dashboard.vue'
import SeaArea from '@/pages/SeaArea.vue'
import ReleasePlan from '@/pages/ReleasePlan.vue'
import ReleaseRecord from '@/pages/ReleaseRecord.vue'
import Recapture from '@/pages/Recapture.vue'
import RecaptureAnalysis from '@/pages/RecaptureAnalysis.vue'
import WaterQuality from '@/pages/WaterQuality.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    children: [
      { path: '', name: 'dashboard', component: Dashboard, meta: { title: '仪表盘' } },
      { path: 'sea-area', name: 'sea-area', component: SeaArea, meta: { title: '海域区域管理' } },
      { path: 'release-plan', name: 'release-plan', component: ReleasePlan, meta: { title: '投放计划管理' } },
      { path: 'release-record', name: 'release-record', component: ReleaseRecord, meta: { title: '投放执行登记' } },
      { path: 'recapture', name: 'recapture', component: Recapture, meta: { title: '回捕统计' } },
      { path: 'recapture-analysis', name: 'recapture-analysis', component: RecaptureAnalysis, meta: { title: '回捕率分析' } },
      { path: 'water-quality', name: 'water-quality', component: WaterQuality, meta: { title: '水质监测' } },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
