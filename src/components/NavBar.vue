<template>
  <nav aria-label="Navegación principal">
    <img :src="logoEd" alt="Logo" class="logo-img" />
    <ul class="nav-list">
      
      <li>
        <button class="nav-btn" @click="handleInicio">
          Inicio
        </button>
      </li>
      <li>
        <button class="nav-btn" @click="goToSection('blog')">
          Blog
        </button>
      </li>
      <li>
        <button class="nav-btn" @click="goToSection('chatia')">
          Chat IA
        </button>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import logoEd from '@/assets/images/logoed.png'
import '../styles/NavBar.css';
import { activeSection } from '@/stores/activeSection'
const groups = [
  { key: 'presentacion', label: 'Inicio' }
]

function goToSection(section: string) {
  activeSection.value = section
}

function handleInicio() {
  if (activeSection.value === 'portafolio') {
    scrollToSectionById('presentacion')
  } else {
    activeSection.value = 'portafolio'
  }
}

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
