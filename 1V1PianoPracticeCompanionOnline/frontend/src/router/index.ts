import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页', requiresAuth: true }
  },
  {
    path: '/teachers',
    name: 'Teachers',
    component: () => import('@/views/TeacherList.vue'),
    meta: { title: '老师列表', requiresAuth: true }
  },
  {
    path: '/booking/:teacherId',
    name: 'Booking',
    component: () => import('@/views/Booking.vue'),
    meta: { title: '约课', requiresAuth: true }
  },
  {
    path: '/lesson/:lessonId',
    name: 'Lesson',
    component: () => import('@/views/LessonRoom.vue'),
    meta: { title: '上课', requiresAuth: true }
  },
  {
    path: '/report/:lessonId',
    name: 'Report',
    component: () => import('@/views/LessonReport.vue'),
    meta: { title: '课后报告', requiresAuth: true }
  },
  {
    path: '/recording/:recordingId',
    name: 'Recording',
    component: () => import('@/views/RecordingPlayback.vue'),
    meta: { title: '录像回看', requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title || '1V1钢琴陪练'}`
  next()
})

export default router
