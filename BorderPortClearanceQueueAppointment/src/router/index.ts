import { createRouter, createWebHistory } from 'vue-router'
import PortList from '@/pages/PortList.vue'
import Appointment from '@/pages/Appointment.vue'
import QrCode from '@/pages/QrCode.vue'
import QueueInfo from '@/pages/QueueInfo.vue'

const routes = [
  {
    path: '/',
    name: 'PortList',
    component: PortList,
  },
  {
    path: '/appointment/:portId',
    name: 'Appointment',
    component: Appointment,
  },
  {
    path: '/qrcode/:appointmentId',
    name: 'QrCode',
    component: QrCode,
  },
  {
    path: '/queue/:portId',
    name: 'QueueInfo',
    component: QueueInfo,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
