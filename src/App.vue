<script setup lang="ts">
import NavBar from './components/NavBar.vue'
import ThreeDScene from './components/ThreeDScene.vue'
import FooterBar from './components/FooterBar.vue'
import { activeSection } from './stores/activeSection'
import ScrollInvite from './components/ScrollInvite.vue'
import OverlayContent from './components/OverlayContent.vue'
import BlogOverlay from './components/BlogOverlay.vue'
import ChatIAOverlay from './components/ChatIAOverlay.vue'
</script>

<template>
  <div id="app">
    <header>
      <NavBar />
    </header>
    <main style="position: relative; width: 100vw; height: 100vh; overflow: hidden;">
      <ThreeDScene />
      <OverlayContent v-if="activeSection === 'portafolio'" class="overlay-absolute" />
      <BlogOverlay v-else-if="activeSection === 'blog'" class="overlay-absolute" />
      <ChatIAOverlay v-else-if="activeSection === 'chatia'" class="overlay-absolute" />
    </main>
    <footer>
      <FooterBar />
    </footer>
    <!-- Botón flotante e invitación a hacer scroll, fuera del overlay -->
    <button
      v-if="activeSection === 'portafolio'"
      class="floating-home-btn-global"
      @click="scrollToSectionById('presentacion')"
    >
      <span class="arrow-up">&#8593;</span>
    </button>
    <ScrollInvite v-if="activeSection === 'portafolio'" class="scroll-invite-global" />
  </div>
</template>

<script lang="ts">
function scrollToSectionById(id: string) {
  const el = document.getElementById(id)
  const container = document.querySelector('.text-content')
  if (el && container && window.scrollController) {
    const factor = 120
    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const maxScroll = container.scrollHeight - container.clientHeight;
    let targetOffset = elRect.top - containerRect.top + container.scrollTop;
    targetOffset = Math.min(targetOffset, maxScroll);
    const currentY = -window.scrollController.getRotations().rotationY * factor
    const delta = targetOffset - currentY
    let start: number | null = null;
    const duration = 600
    function animateScroll(ts: number) {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const ease = 0.5 - 0.5 * Math.cos(Math.PI * progress)
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
#app {
  background: var(--color-bg);
  width: 100vw;
  height: 100vh;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
main {
  flex: 1 1 auto;
  width: 100%;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  position: relative;
    display: flex;
}
.floating-home-btn-global {
  position: fixed;
    bottom: 1.5%;
    right: 1%;
    z-index: 1000;
    background: #3498db;
    color: #fff;
    border: none;
    border-radius: 50%;
    /* padding: 0.8em 2em; */
    font-size: 1.1em;
    font-weight: bold;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    cursor: pointer;
    transition: background 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 7%;
    height: 7%;
}
.floating-home-btn-global:hover {
  background: #217dbb;
}
.arrow-up {
  font-size: 2em;
  animation: bounce 1.2s infinite;
  color: #fff;
  display: inline-block;
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.scroll-invite-global {
  position: fixed !important;
  bottom: 5%;
  left: 0%;
  z-index: 1000;
  transform: scale(0.7);
  font-size: 1em;
  background-color: var(--color-bg);
  backdrop-filter: opacity(0.5);
  opacity: 0.5;
  padding: 2rem;
  border-radius: 25%;
}
.overlay-absolute {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10;
  pointer-events: auto;
}
</style>
