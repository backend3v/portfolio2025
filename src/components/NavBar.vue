<template>
  <nav aria-label="Navegación principal">
    <ul class="nav-list">
      <li v-for="group in groups" :key="group.key">
        <button class="nav-btn" @click="$emit('navigate-group', group.key)">
          {{ group.label }}
        </button>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
const groups = [
  { key: 'presentacion', label: 'Presentación' },
  { key: 'habilidades', label: 'Habilidades' },
  { key: 'proyectos', label: 'Proyectos' }
]
</script>

<style scoped>
nav {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--color-medium);
  margin: 0;
  padding: 0;
}
.nav-list {
  display: flex;
  gap: 2rem;
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
  justify-content: center;
  align-items: center;
  height: 100%;
}
.nav-btn {
  background: none;
  border: none;
  color: var(--color-white);
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.5em 1.2em;
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
