<template>
  <div class="text-overlay">
    <div class="text-frame">
      <div class="text-content" ref="textContentRef" style="overflow-y: auto;">
        <div ref="startMarkerRef" id="start-marker" style="height:1px;width:100%;margin-top:2%"></div>
        <div class="blogia-controls">
          <div class="blogia-multiselect-container">
            <div class="blogia-multiselect" @click="toggleMultiselect">
              <span class="blogia-multiselect-text">
                {{ selectedCategories.length > 0 ? `${selectedCategories.length} categoría(s) seleccionada(s)` : 'Todas las categorías' }}
              </span>
              <span class="blogia-multiselect-arrow">▼</span>
            </div>
            <div v-if="isMultiselectOpen" class="blogia-multiselect-dropdown">
              <label class="blogia-multiselect-option">
                <input 
                  type="checkbox" 
                  :checked="selectedCategories.length === 0"
                  @change="toggleAllCategories"
                />
                <span>Todas las categorías</span>
              </label>
              <label 
                v-for="cat in categories" 
                :key="cat.name" 
                class="blogia-multiselect-option"
              >
                <input 
                  type="checkbox" 
                  :value="cat.name"
                  v-model="selectedCategories"
                  @change="handleCategoryChange"
                />
                <span>{{ cat.name }}</span>
              </label>
            </div>
          </div>
          <input v-model="searchText" placeholder="Buscar posts..." class="blogia-input" />
          <button class="blogia-btn" @click="fetchPosts" :disabled="loading">Buscar</button>
        </div>
        <div class="blogia-content">
          <div v-if="loading" class="blogia-spinner"></div>
          <div v-else-if="posts.length === 0" class="blogia-empty">No hay posts para mostrar.</div>
          <div v-else class="blogia-list" >
            <div v-for="post in posts" :key="post.title + post.created_at" class="blogia-item" :style="{color: 'white', borderColor: getCategoryColor(post.category)}">
              <img v-if="post.image" :src="getImageUrl(post.image)"  class="blogia-img" />
              <div class="blogia-info" :style="{color: getCategoryColor(post.category)}">{{ post.title }}
                <h3 class="blogia-title" </h3>
                <div class="blogia-meta">
                  <span class="blogia-category" :style="{background: getCategoryColor(post.category)}">{{ post.category }}</span>
                  <span class="blogia-date">{{ formatDate(post.created_at) }}</span>
                </div>
                <p class="blogia-desc">{{ post.description }}</p>
              </div>
            </div>
          </div>
        </div>
        <div ref="endMarkerRef" id="end-marker" style="height:1px;width:100%;margin-bottom:15%"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { useOverlayScroll } from '@/utils/useOverlayScroll'
import axios from 'axios'
const API_URL = import.meta.env.VITE_API_URL

const textContentRef = ref<HTMLElement | null>(null)
const startMarkerRef = ref<HTMLElement | null>(null)
const endMarkerRef = ref<HTMLElement | null>(null)
useOverlayScroll(textContentRef, startMarkerRef, endMarkerRef)

const categories = ref<{name: string, color: string}[]>([])
const posts = ref<any[]>([])
const selectedCategories = ref<string[]>([])
const searchText = ref('')
const loading = ref(false)
const isMultiselectOpen = ref(false)

async function fetchCategories() {
  try {
    const res = await axios.get(`${API_URL}/blog/categories`)
    categories.value = res.data
  } catch {}
}

async function fetchPosts() {
  loading.value = true
  try {
    const body: any = { q: searchText.value }
    if (selectedCategories.value.length > 0) {
      body.categories = selectedCategories.value
    } else {
      body.categories = []
    }
    const res = await axios.post(`${API_URL}/blog/posts/search`, body)
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

function getImageUrl(imagePath: string) {
  // Si es una URL completa, la devuelve tal como está
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  // Si es una ruta local, la convierte a URL relativa
  if (imagePath.startsWith('/src/assets/')) {
    return imagePath.replace('/src/assets/', '/src/assets/')
  }
  // Por defecto, asume que es una ruta local
  return imagePath
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString()
}

function toggleMultiselect() {
  isMultiselectOpen.value = !isMultiselectOpen.value
}

function toggleAllCategories() {
  if (selectedCategories.value.length === 0) {
    // Si no hay categorías seleccionadas, seleccionar todas
    selectedCategories.value = categories.value.map(cat => cat.name)
  } else {
    // Si hay categorías seleccionadas, deseleccionar todas
    selectedCategories.value = []
  }
}

function handleCategoryChange() {
  // Si se selecciona una categoría específica, deseleccionar "Todas las categorías"
  // Si se deseleccionan todas, automáticamente se selecciona "Todas las categorías"
}

// Cerrar el multiselector cuando se hace clic fuera
function handleClickOutside(event: Event) {
  const target = event.target as HTMLElement
  if (!target.closest('.blogia-multiselect-container')) {
    isMultiselectOpen.value = false
  }
}

onMounted(() => {
  fetchCategories()
  fetchPosts()
  // Agregar event listener para cerrar el multiselector
  document.addEventListener('click', handleClickOutside)
})

// Limpiar event listener al desmontar
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch([selectedCategories, searchText], () => {
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
  padding-top: var(--menu-height); /* Agregar padding para evitar que quede debajo de la navbar */
}
.blogia-controls {
  position: fixed;
  top: var(--menu-height);
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: var(--search-controls-gap);
  background: var(--color-bg);
  padding: var(--search-controls-padding);
  box-shadow: var(--search-controls-shadow);
  z-index: var(--search-controls-z-index);
  border-bottom: var(--search-controls-border);
  height: var(--search-controls-height);
}
.blogia-select{
  background: var(--color-presentacion);
  color:var(--color-bg);
  cursor: pointer;
}
.blogia-select, .blogia-input {
  font-size: var(--font-blog-normal);
  padding: 0.7em 1em;
  border-radius: 1.5em;
  font-weight: bold;
  outline: none;
  border: 0px;
}
.blogia-input {
  flex: 1;
  
  color:var(--color-bg);
}
.blogia-btn {
  width: 6em;
  font-size: var(--font-blog-normal);
  padding: 0.5em 0;
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
  margin-top: calc(var(--menu-height) + 80px);
  flex: 1 1 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-blog-normal);
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
  border-radius: 1em;
  border: 3px solid transparent;
  box-shadow: 0 2px 8px #0001;
  padding: 1.5em;
  align-items: flex-start;
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  transition: border-color 0.3s ease;
  background-color: rgba(0,0,0,0.15);
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
  font-size: var(--font-blog-title);
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
  color:white;
}

/* Estilos para el multiselector */
.blogia-multiselect-container {
  position: relative;
  min-width: 200px;
}

.blogia-multiselect {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--input-padding);
  border-radius: var(--input-border-radius);
  background: transparent;
  color: var(--color-light);
  cursor: pointer;
  font-weight: bold;
  border: var(--input-border);
  outline: none;
  transition: var(--input-transition);
  font-size: var(--font-normal);
}

.blogia-multiselect:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--color-light-gold);
  transform: translateY(-2px);
}

.blogia-multiselect-text {
  flex: 1;
  text-align: left;
}

.blogia-multiselect-arrow {
  margin-left: 0.5em;
  transition: transform 0.3s ease;
  font-size: 0.8em;
}

.blogia-multiselect-container:hover .blogia-multiselect-arrow {
  transform: rotate(180deg);
}

.blogia-multiselect-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-bg);
  border: 2px solid var(--color-light-gold);
  border-radius: 1em;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  margin-top: 0.5em;
}

.blogia-multiselect-option {
  display: flex;
  align-items: center;
  padding: 0.8em 1.2em;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: var(--font-normal);
  color: var(--color-light);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.blogia-multiselect-option:last-child {
  border-bottom: none;
}

.blogia-multiselect-option:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-light-gold);
}

.blogia-multiselect-option input[type="checkbox"] {
  margin-right: 0.8em;
  cursor: pointer;
  accent-color: var(--color-light-gold);
}

.blogia-multiselect-option span {
  flex: 1;
  cursor: pointer;
}

.blogia-input {
  flex: 1;
  font-size: var(--font-blog-normal);
  padding: var(--input-padding);
  border-radius: var(--input-border-radius);
  font-weight: bold;
  outline: none;
  border: var(--input-border);
  background: var(--color-light);
  color: var(--color-bg);
  transition: var(--input-transition);
}

.blogia-input::placeholder {
  background: var(--color-light);
  color: var(--color-medium);
}

.blogia-input:focus {
  border-color: var(--color-light-gold);
  background: var(--color-light);
  color: var(--color-medium);
}

.blogia-btn {
  width: var(--button-width);
  font-size: var(--font-blog-normal);
  padding: var(--button-padding);
  border-radius: var(--button-border-radius);
  border: none;
  background: var(--color-light-gold);
  color: var(--color-bg);
  font-weight: bold;
  cursor: pointer;
  transition: var(--button-transition);
}

.blogia-btn:hover {
  background: #f39c12;
  transform: translateY(-2px);
}

.blogia-btn:disabled {
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
  transform: none;
}

.blogia-content {
  margin-top: var(--content-margin-top);
  flex: 1 1 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-blog-normal);
  min-height: 0;
  padding: var(--content-padding);
  text-align: center;
}

/* Responsive Design */
@media (max-width: 768px) {
  .blogia-controls {
    flex-direction: column;
    gap: 0.8em;
    padding: 1em;
  }
  
  .blogia-select, .blogia-input {
    width: 100%;
    font-size: var(--font-mobile-normal);
  }
  
  .blogia-btn {
    width: 100%;
    font-size: var(--font-mobile-normal);
  }
  
  .blogia-content {
    font-size: var(--font-mobile-normal);
    padding: 1em;
  }
  
  .blogia-title {
    font-size: var(--font-mobile-title);
  }
}

@media (max-width: 480px) {
  .blogia-controls {
    padding: 0.8em;
    gap: 0.6em;
  }
  
  .blogia-select, .blogia-input {
    font-size: 0.9em;
    padding: 0.5em 0.8em;
  }
  
  .blogia-btn {
    font-size: 0.9em;
    padding: 0.4em 0;
  }
  
  .blogia-content {
    font-size: 0.9em;
    padding: 0.8em;
  }
  
  .blogia-title {
    font-size: 1.2em;
  }
}

/* Responsive para el multiselector */
@media (max-width: 768px) {
  .blogia-multiselect-container {
    min-width: 150px;
  }
  
  .blogia-multiselect {
    font-size: var(--font-mobile-normal);
    padding: 0.5em 0.8em;
  }
  
  .blogia-multiselect-option {
    font-size: var(--font-mobile-normal);
    padding: 0.4em 0.8em;
  }
}
</style> 