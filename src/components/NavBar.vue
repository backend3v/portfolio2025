<template>
  <nav aria-label="Navegación principal">
    <img :src="logoEd" alt="Logo" class="logo-img" />
    <ul class="nav-list">
      <li>
        <router-link class="nav-btn" :class="{ selected: $route.path === '/' }" to="/">Inicio</router-link>
      </li>
      <li>
        <router-link class="nav-btn" :class="{ selected: $route.path.startsWith('/blog') }" to="/blog">Blog</router-link>
      </li>
      <li>
        <router-link class="nav-btn" :class="{ selected: $route.path.startsWith('/chat-ia') }" to="/chat-ia">Chat IA</router-link>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import logoEd from '@/assets/images/logoed.png'
import '../styles/NavBar.css';
const $route = useRoute();
</script>
