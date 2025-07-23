import { createRouter, createWebHistory } from 'vue-router'

import ThreeDScene from '../components/ThreeDScene.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: ThreeDScene,
    },
  ],
})

export default router
