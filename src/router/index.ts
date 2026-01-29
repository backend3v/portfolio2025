import { createRouter, createWebHistory } from 'vue-router'

import AdminBlog from '../components/AdminBlog.vue'
import OverlayContent from '../components/OverlayContent.vue'
import HomeView from '../views/HomeView.vue'
import ChatIAView from '../views/ChatIAView.vue'
import BlogView from '../views/BlogView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/blog',
      name: 'blog',
      component: BlogView,
    },
    {
      path: '/admin-blog',
      name: 'admin-blog',
      component: AdminBlog,
    },
  ],
})

export default router
