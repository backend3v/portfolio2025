<template>
  <nav aria-label="Navegación principal">
    <ul class="nav-list">
      <li class="nav-logo">
        <img :src="logoEd" alt="Logo" class="logo-img" />
      </li>
      <li v-for="group in groups" :key="group.key">
        <button class="nav-btn" @click="scrollToSectionById(group.key)">
          {{ group.label }}
        </button>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import logoEd from '@/assets/images/logoed.png'
const groups = [
  { key: 'presentacion', label: 'Inicio' }
]

// Suponemos que el ScrollController está en window para acceso global
function scrollToSectionById(id: string) {
  const el = document.getElementById(id)
  const container = document.querySelector('.text-content')
  if (el && container && window.scrollController) {
    const factor = 120 // Debe coincidir con el de ThreeDScene.vue
    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const maxScroll = container.scrollHeight - container.clientHeight;
    let targetOffset = elRect.top - containerRect.top + container.scrollTop;
    targetOffset = Math.min(targetOffset, maxScroll); // <-- Ajuste clave
    const currentY = -window.scrollController.getRotations().rotationY * factor
    const delta = targetOffset - currentY
    let start: number | null = null;
    const duration = 600 // ms
    function animateScroll(ts: number) {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const ease = 0.5 - 0.5 * Math.cos(Math.PI * progress) // easeInOut
      const newY = currentY + delta * ease
      window.scrollController.resetRotationYTo(-newY / factor)
      if (progress < 1) {
        requestAnimationFrame(animateScroll)
      }
    }
    requestAnimationFrame(animateScroll)
  }
}
</script>

<style scoped>
nav {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--color-bg);
  margin: 0;
  padding: 0;
}
.nav-list {
  display: flex;
  gap: 0rem;
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
  justify-content: flex-start;
  align-items: center;
  height: 100%;
}
.nav-logo {
  display: flex;
  align-items: center;
  margin-right: 0.5rem;
}
.logo-img {
  height: 1.5rem;
  margin:0.1rem;
  width: auto;
  display: block;
}
.nav-btn {
  background: var(--color-presentacion);
  border: none;
  color: var(--color-bg);
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.05em 1.2em;
  border-radius: var(--border-radius);
  transition: background 0.2s, color 0.2s;
  height: 100%;
  display: flex;
  align-items: center;
}
.nav-btn:focus, .nav-btn:hover {
  background: var(--color-light);
  color: var(--color-bg);
  outline: none;
}
</style>
