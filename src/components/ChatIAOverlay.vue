<template>
  <div class="text-overlay">
    <div class="text-frame">
      <div class="text-content" ref="textContentRef" style="overflow-y: auto;">
        <div ref="startMarkerRef" id="start-marker" style="height:1px;width:100%;margin-top:2%"></div>
        <div class="inputChat">
          <input v-model="inputValue" class="chat-input" placeholder="Escribe tu pregunta..." />
          <button class="chat-btn" @click="sendRequest" :disabled="loading || !inputValue.trim()">Enviar</button>
        </div>
        <div class="outputRequest">
          <div v-if="loading" class="spinner"></div>
          <template v-else-if="responseObj">
            <ChatIAResponse :data="responseObj" />
          </template>
          <div v-else-if="response">{{ response }}</div>
          <div v-else></div>
        </div>
        <div ref="endMarkerRef" id="end-marker" style="height:1px;width:100%;margin-bottom:15%"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useOverlayScroll } from '@/utils/useOverlayScroll'
import axios from 'axios'
import ChatIAResponse from './ChatIAResponse.vue'

const textContentRef = ref<HTMLElement | null>(null)
const startMarkerRef = ref<HTMLElement | null>(null)
const endMarkerRef = ref<HTMLElement | null>(null)
useOverlayScroll(textContentRef, startMarkerRef, endMarkerRef)

const inputValue = ref('')
const response = ref<string|null>(null)
const responseObj = ref<any|null>(null)
const loading = ref(false)
const API_URL = import.meta.env.VITE_API_URL

async function sendRequest() {
  if (!inputValue.value.trim()) return;
  loading.value = true;
  response.value = null;
  responseObj.value = null;
  try {
    const res = await axios.post(`${API_URL}/prompt`, {
      prompt: inputValue.value,
      lang: 'es'
    });
    if (typeof res.data === 'object' && res.data !== null) {
      responseObj.value = res.data;
    } else {
      // Intentar parsear si es string JSON
      try {
        const parsed = JSON.parse(res.data);
        if (typeof parsed === 'object' && parsed !== null) {
          responseObj.value = parsed;
        } else {
          response.value = res.data;
        }
      } catch {
        response.value = res.data;
      }
    }
  } catch (e) {
    const err = e as any;
    if (err.response && err.response.status === 429) {
      response.value = 'Se ha cumplido con el limite de peticiones, no puedo generarte una respuesta';
    } else if (err.response && err.response.data && err.response.data.error && err.response.data.error.includes('Límite de consultas')) {
      response.value = 'Se ha cumplido con el limite de peticiones, no puedo generarte una respuesta';
    } else {
      response.value = 'Se ha cumplido con el limite de peticiones, no puedo generarte una respuesta';
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.chatia-overlay {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  font-size: 0.5em;
  padding-top: var(--menu-height); /* Agregar padding para evitar que quede debajo de la navbar */
}
.inputChat {
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

.chat-input {
  flex: 1;
  font-size: var(--font-chat-normal);
  padding: var(--input-padding);
  border-radius: var(--input-border-radius);
  font-weight: bold;
  outline: none;
  border: var(--input-border);
  background: var(--color-light);
  color: var(--color-bg);
  transition: var(--input-transition);
}

.chat-input::placeholder {
  background: var(--color-light);
  color: var(--color-medium);
}

.chat-input:focus {
  border-color: var(--color-light-gold);
  background: var(--color-light);
  color: var(--color-medium);
}

.chat-btn {
  width: var(--button-width);
  font-size: var(--font-chat-normal);
  padding: var(--button-padding);
  border-radius: var(--button-border-radius);
  border: none;
  background: var(--color-light-gold);
  color: var(--color-bg);
  font-weight: bold;
  cursor: pointer;
  transition: var(--button-transition);
}

.chat-btn:hover {
  background: #f39c12;
  transform: translateY(-2px);
}

.chat-btn:disabled {
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
  transform: none;
}

.outputRequest {
  margin-top: var(--content-margin-top);
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--content-padding);
  overflow-y: auto;
}
.spinner {
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

/* Responsive Design */
@media (max-width: 768px) {
  .inputChat {
    flex-direction: column;
    gap: 0.8em;
    padding: 1em;
    height: auto;
  }
  
  .chat-input {
    width: 100%;
    font-size: var(--font-mobile-normal);
  }
  
  .chat-btn {
    width: 100%;
    font-size: var(--font-mobile-normal);
  }
  
  .outputRequest {
    font-size: var(--font-mobile-title);
    padding: 1em;
  }
  
  .spinner {
    width: 2rem;
    height: 2rem;
  }
}

@media (max-width: 480px) {
  .inputChat {
    padding: 0.8em;
    gap: 0.6em;
  }
  
  .chat-input {
    font-size: 0.9em;
    padding: 0.5em 0.8em;
  }
  
  .chat-btn {
    font-size: 0.9em;
    padding: 0.4em 0;
  }
  
  .outputRequest {
    font-size: 1.2em;
    padding: 0.8em;
  }
  
  .spinner {
    width: 1.5rem;
    height: 1.5rem;
  }
}
</style> 