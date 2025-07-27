<template>
  <nav class="nav-bar">
    <div class="nav-logo">
      <img src="@/assets/images/logoed.png" alt="Logo" />
    </div>
    
    <!-- Hamburger Menu Button (Mobile) -->
    <button 
      class="hamburger-btn" 
      @click="toggleMobileMenu"
      :class="{ 'active': isMobileMenuOpen }"
      aria-label="Toggle mobile menu"
    >
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </button>
    
    <!-- Desktop Menu -->
    <ul class="nav-list desktop-menu">
      <li>
        <router-link class="nav-btn" :class="{ selected: $route.path === '/' }" to="/">Portafolio</router-link>
      </li>
      <li>
        <router-link class="nav-btn" :class="{ selected: $route.path.startsWith('/blog') }" to="/blog">Blog</router-link>
      </li>
      <li>
        <router-link class="nav-btn" :class="{ selected: $route.path.startsWith('/chat-ia') }" to="/chat-ia">Aplicaciones</router-link>
      </li>
      <li>
        <button class="nav-btn contact-btn" @click="openContactModal">Contacto</button>
      </li>
    </ul>
    
    <!-- Mobile Menu Overlay -->
    <div 
      class="mobile-menu-overlay" 
      :class="{ 'active': isMobileMenuOpen }"
      @click="closeMobileMenu"
    ></div>
    
    <!-- Mobile Menu -->
    <div class="mobile-menu" :class="{ 'active': isMobileMenuOpen }">
      <router-link 
        to="/" 
        class="mobile-nav-btn" 
        :class="{ selected: $route.path === '/' }"
        @click="closeMobileMenu"
      >
        Portafolio
      </router-link>
      <router-link 
        to="/blog" 
        class="mobile-nav-btn" 
        :class="{ selected: $route.path.startsWith('/blog') }"
        @click="closeMobileMenu"
      >
        Blog
      </router-link>
      <router-link 
        to="/chat-ia" 
        class="mobile-nav-btn" 
        :class="{ selected: $route.path.startsWith('/chat-ia') }"
        @click="closeMobileMenu"
      >
        Aplicaciones
      </router-link>
      <button 
        class="mobile-nav-btn contact-btn" 
        @click="openContactModal"
      >
        Contactos
      </button>
    </div>
    
    <!-- Contact Modal -->
    <ContactModal 
      :is-visible="isContactModalOpen" 
      @close="closeContactModal" 
    />
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import ContactModal from './ContactModal.vue'
import '../styles/NavBar.css'

const $route = useRoute()
const isMobileMenuOpen = ref(false)
const isContactModalOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  // Prevent body scroll when menu is open
  if (isMobileMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
  document.body.style.overflow = ''
}

const openContactModal = () => {
  isContactModalOpen.value = true
  closeMobileMenu() // Close mobile menu if open
}

const closeContactModal = () => {
  isContactModalOpen.value = false
}

// Handle escape key
const handleKeydown = (event: any) => {
  if (event.key === 'Escape') {
    if (isMobileMenuOpen.value) {
      closeMobileMenu()
    }
    if (isContactModalOpen.value) {
      closeContactModal()
    }
  }
}

// Add/remove event listeners
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  // Ensure body scroll is restored
  document.body.style.overflow = ''
})
</script>
