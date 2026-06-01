import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import CourseListPage from '@/pages/CourseListPage.vue'
import CourseDetailPage from '@/pages/CourseDetailPage.vue'
import SchedulePage from '@/pages/SchedulePage.vue'
import WaitlistPage from '@/pages/WaitlistPage.vue'
import AttendancePage from '@/pages/AttendancePage.vue'
import ClubsPage from '@/pages/ClubsPage.vue'
import ProfilePage from '@/pages/ProfilePage.vue'
import LoginPage from '@/pages/LoginPage.vue'
import RegisterPage from '@/pages/RegisterPage.vue'

const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/courses', name: 'courses', component: CourseListPage },
  { path: '/courses/:id', name: 'courseDetail', component: CourseDetailPage },
  { path: '/schedule', name: 'schedule', component: SchedulePage, meta: { auth: true } },
  { path: '/waitlist', name: 'waitlist', component: WaitlistPage, meta: { auth: true } },
  { path: '/attendance', name: 'attendance', component: AttendancePage, meta: { auth: true } },
  { path: '/clubs', name: 'clubs', component: ClubsPage },
  { path: '/profile', name: 'profile', component: ProfilePage, meta: { auth: true } },
  { path: '/login', name: 'login', component: LoginPage },
  { path: '/register', name: 'register', component: RegisterPage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.auth && !token) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
