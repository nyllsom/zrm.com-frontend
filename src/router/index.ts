import { createRouter, createWebHistory } from 'vue-router'
import SiteLayout from '@/layouts/SiteLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { isTokenValid, removeToken } from '@/api/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 前台
    {
      path: '/',
      component: SiteLayout,
      children: [
        {
          path: '',
          component: () => import('@/views/Home.vue'),
        },
        {
          path: 'blog',
          component: () => import('@/views/Blog.vue'),
        },
        {
          path: 'reader',
          component: () => import('@/views/Reader.vue'),
        },
        {
          path: 'about',
          component: () => import('@/views/About.vue'),
        },
      ],
    },

    // 后台登录页
    {
      path: '/admin/login',
      component: () => import('@/views/AdminLogin.vue'),
    },

    // 后台管理页
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/admin/articles',
        },
        {
          path: 'articles',
          component: () => import('@/views/AdminReader.vue'),
        },
        {
          path: 'assets',
          component: () => import('@/views/AssetManager.vue'),
        },
        {
          path: 'livecodes',
          component: () => import('@/views/AdminLivecodes.vue'),
        },
      ],
    },

    // 兜底
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

router.beforeEach((to, _from, next) => {
  const valid = isTokenValid()
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  if (requiresAuth && !valid) {
    removeToken()
    next('/admin/login')
    return
  }

  if (to.path === '/admin/login' && valid) {
    next('/admin/articles')
    return
  }

  next()
})

export default router
