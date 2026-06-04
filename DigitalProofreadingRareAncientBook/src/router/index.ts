import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import LoginPage from '@/pages/LoginPage.vue'
import LayoutPage from '@/pages/LayoutPage.vue'
import BooksPage from '@/pages/BooksPage.vue'
import PagesPage from '@/pages/PagesPage.vue'
import ProofreadPage from '@/pages/ProofreadPage.vue'
import ReviewPage from '@/pages/ReviewPage.vue'
import DictionariesPage from '@/pages/DictionariesPage.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
  },
  {
    path: '/',
    component: LayoutPage,
    children: [
      {
        path: '',
        redirect: '/books',
      },
      {
        path: 'books',
        name: 'books',
        component: BooksPage,
      },
      {
        path: 'books/:id/pages',
        name: 'pages',
        component: PagesPage,
        props: true,
      },
      {
        path: 'proofread/:bookId/:pageId',
        name: 'proofread',
        component: ProofreadPage,
        props: true,
      },
      {
        path: 'review/:bookId/:pageId',
        name: 'review',
        component: ReviewPage,
        props: true,
      },
      {
        path: 'dictionaries',
        name: 'dictionaries',
        component: DictionariesPage,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const { isLoggedIn, checkAuth } = useAuth()
  
  if (to.path === '/login') {
    next()
    return
  }

  if (!isLoggedIn.value) {
    await checkAuth()
    if (!isLoggedIn.value) {
      next('/login')
      return
    }
  }
  next()
})

export default router
