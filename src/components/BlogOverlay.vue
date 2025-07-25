<template>
  <div class="blogia-overlay">
    <div class="blogia-controls">
      <select v-model="selectedCategory" class="blogia-select">
        <option value="">Todas las categorías</option>
        <option v-for="cat in categories" :key="cat.name" :value="cat.name">
          {{ cat.name }}
        </option>
      </select>
      <input v-model="searchText" placeholder="Buscar posts..." class="blogia-input" />
      <button class="blogia-btn" @click="fetchPosts" :disabled="loading">Buscar</button>
    </div>
    <div class="blogia-content">
      <div v-if="loading" class="blogia-spinner"></div>
      <div v-else-if="posts.length === 0" class="blogia-empty">No hay posts para mostrar.</div>
      <div v-else class="blogia-list">
        <div v-for="post in posts" :key="post.title + post.created_at" class="blogia-item">
          <img v-if="post.image" :src="post.image" class="blogia-img" />
          <div class="blogia-info">
            <h3 class="blogia-title">{{ post.title }}</h3>
            <div class="blogia-meta">
              <span class="blogia-category" :style="{background: getCategoryColor(post.category)}">{{ post.category }}</span>
              <span class="blogia-date">{{ formatDate(post.created_at) }}</span>
            </div>
            <p class="blogia-desc">{{ post.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
const API_URL = import.meta.env.VITE_API_URL

const categories = ref<{name: string, color: string}[]>([])
const posts = ref<any[]>([])
const selectedCategory = ref('')
const searchText = ref('')
const loading = ref(false)

async function fetchCategories() {
  try {
    const res = await axios.get(`${API_URL}/categories`)
    categories.value = res.data
  } catch {}
}

async function fetchPosts() {
  loading.value = true
  try {
    const body: any = { q: searchText.value }
    if (selectedCategory.value) body.categories = [selectedCategory.value]
    else body.categories = []
    const res = await axios.post(`${API_URL}/posts/search`, body)
    posts.value = res.data
  } catch {
    posts.value = []
  } finally {
    loading.value = false
  }
}

function getCategoryColor(cat: string) {
  const c = categories.value.find(x => x.name === cat)
  return c ? c.color : '#eee'
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString()
}

onMounted(() => {
  fetchCategories()
  fetchPosts()
})

watch([selectedCategory, searchText], () => {
  // Si quieres búsqueda reactiva, descomenta:
  // fetchPosts()
})
</script>

<style scoped>
.blogia-overlay {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  font-size: 0.5em;
  padding: 0;
}
.blogia-controls {
  display: flex;
  align-items: center;
  gap: 1em;
  padding: 1.5em 2em 0.5em 2em;
}
.blogia-select{
  background: var(--color-presentacion);
  color:var(--color-bg);
  cursor: pointer;
}
.blogia-select, .blogia-input {
  font-size: 1.5em;
  padding: 0.7em 1em;
  border-radius: 1.5em;
  font-weight: bold;
  outline: none;
  border: 0px;
}
.blogia-input {
  flex: 1;
}
.blogia-btn {
  width: 7em;
  font-size: 1.25em;
  padding: 0.7em 0;
  border-radius: 1.5em;
  border: none;
  background: #3498db;
  color: var(--color-bg);
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}
.blogia-btn:disabled {
  background: #b1c2d5;
  cursor: not-allowed;
}
.blogia-content {
  flex: 1 1 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2em;
  min-height: 0;
  padding: 2em;
  text-align: center;
}
.blogia-spinner {
  border: 6px solid #f3f3f3;
  border-top: 6px solid #3498db;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  animation: spin 1s linear infinite;
  margin: auto;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.blogia-empty {
  color: white;
  margin: 2em 0;
  width: 100%;
}
.blogia-list {
  display: flex;
  flex-direction: column;
  gap: 2em;
  width: 100%;
}
.blogia-item {
  display: flex;
  gap: 2em;
  background: #fff;
  border-radius: 1em;
  box-shadow: 0 2px 8px #0001;
  padding: 1.5em;
  align-items: flex-start;
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
}
.blogia-img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 1em;
  background: #eee;
}
.blogia-info {
  flex: 1;
  text-align: left;
}
.blogia-title {
  margin: 0 0 0.5em 0;
  font-size: 1.5em;
  color: #283747;
}
.blogia-meta {
  display: flex;
  gap: 1em;
  font-size: 0.9em;
  margin-bottom: 0.5em;
  align-items: center;
}
.blogia-category {
  padding: 0.2em 0.8em;
  border-radius: 1em;
  color: #fff;
  font-weight: bold;
  font-size: 0.9em;
}
.blogia-date {
  color: #888;
  font-size: 0.9em;
}
.blogia-desc {
  margin: 0.5em 0 0 0;
  font-size: 1.1em;
}
</style> 